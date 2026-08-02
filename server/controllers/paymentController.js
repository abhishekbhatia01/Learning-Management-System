import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import Enrollment from "../model/Enrollment.js";
import Payment from "../model/Payment.js";
import Course from "../model/Course.js";
import User from "../model/User.js";
import stripe from "../config/stripe.js";
import { paginate } from "../utils/paginate.js";

/* ======================================================
   CREATE STRIPE CHECKOUT SESSION
====================================================== */
export const createCheckoutSession = async (req, res) => {
  try {
    const { user } = req;

    // Fetch cart with populated course + instructor
    const cart = await Cart.findOne({
      where: { userId: user.id },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title", "price", "thumbnail", "instructorId"],
              include: [
                {
                  model: User,
                  as: "instructor",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Keep only items that can produce valid Stripe line items.
    const validCartItems = cart.items.filter((item) => {
      const amount = Number.parseFloat(item?.course?.price);
      const courseId = item?.course?.id;
      return (
        item?.course &&
        Number.isInteger(courseId) &&
        typeof item.course.title === "string" &&
        item.course.title.trim().length > 0 &&
        Number.isFinite(amount) &&
        amount > 0
      );
    });

    // Clean up stale or invalid cart rows so user does not hit this repeatedly.
    const invalidCartItemIds = cart.items
      .filter((item) => !validCartItems.includes(item))
      .map((item) => item.id)
      .filter(Boolean);

    if (invalidCartItemIds.length > 0) {
      await CartItem.destroy({ where: { id: invalidCartItemIds } });
    }

    if (validCartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No payable courses found in cart. Please refresh cart and add courses again.",
      });
    }

    const lineItems = validCartItems.map((item) => {
      const productData = {
        name: item.course.title,
        description: `Instructor: ${item.course.instructor?.name || "N/A"}`,
      };

      // Stripe expects public absolute image URLs.
      const thumbnail = item.course.thumbnail;
      if (typeof thumbnail === "string" && /^https?:\/\//i.test(thumbnail)) {
        productData.images = [thumbnail];
      }

      return {
        price_data: {
          currency: "inr",
          product_data: productData,
          unit_amount: Math.round(Number.parseFloat(item.course.price) * 100),
        },
        quantity: 1,
      };
    });

    const totalAmount = validCartItems.reduce(
      (sum, item) => sum + parseFloat(item.course.price),
      0,
    );

    const frontendUrl = (
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      req.headers.origin ||
      "http://localhost:5173"
    ).replace(/\/$/, "");

    if (!frontendUrl) {
      return res.status(500).json({
        success: false,
        message: "Payment configuration missing frontend URL",
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "Payment configuration missing Stripe secret key",
      });
    }

    const checkoutPayload = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-failed`,
      metadata: {
        userId: user.id.toString(),
        courseIds: validCartItems.map((i) => i.course.id.toString()).join(","),
      },
    };

    if (typeof user.email === "string" && user.email.trim().length > 0) {
      checkoutPayload.customer_email = user.email.trim();
    }

    const session = await stripe.checkout.sessions.create(checkoutPayload);

    const payment = await Payment.create({
      userId: user.id,
      amount: totalAmount,
      currency: "inr",
      stripeSessionId: session.id,
      status: "pending",
      stripeEventIds: [],
    });

    // Set many-to-many courses
    const courseIds = validCartItems.map((i) => i.course.id);
    await payment.setCourses(courseIds);

    res.status(200).json({
      success: true,
      url: session.url,
      paymentId: payment.id,
    });
  } catch (error) {
    const stripeMessage = error?.raw?.message || error?.message;
    console.error("Checkout session error:", stripeMessage);
    res.status(500).json({
      success: false,
      message: stripeMessage || "Server error",
    });
  }
};

/* ======================================================
   STRIPE WEBHOOK HANDLER
====================================================== */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event);
        break;

      case "checkout.session.expired":
        await handleSessionExpired(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log("Unhandled Stripe event:", event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
   WEBHOOK HELPERS
====================================================== */
async function handleCheckoutCompleted(event) {
  const session = event.data.object;

  const payment = await Payment.findOne({
    where: { stripeSessionId: session.id },
    include: [{ model: Course, as: "courses" }],
  });

  if (!payment) return;

  // Idempotency check
  let currentEventIds = payment.stripeEventIds || [];
  if (currentEventIds.includes(event.id)) return;

  if (payment.status === "completed") return;

  payment.status = "completed";
  payment.stripePaymentIntentId = session.payment_intent;

  currentEventIds.push(event.id);
  payment.stripeEventIds = currentEventIds;

  await payment.save();

  for (const course of payment.courses) {
    const exists = await Enrollment.findOne({
      where: {
        userId: payment.userId,
        courseId: course.id,
      },
    });

    if (!exists) {
      await Enrollment.create({
        userId: payment.userId,
        courseId: course.id,
        enrolledDate: new Date(),
      });
    }
  }

  const userCart = await Cart.findOne({ where: { userId: payment.userId } });
  if (userCart) {
    await CartItem.destroy({ where: { cartId: userCart.id } });
  }

  console.log("Payment completed & enrollment successful");
}

async function handleSessionExpired(session) {
  const payment = await Payment.findOne({
    where: { stripeSessionId: session.id },
  });

  if (!payment || payment.status !== "pending") return;

  payment.status = "failed";
  payment.failureReason = "Checkout session expired";
  await payment.save();
}

async function handlePaymentFailed(intent) {
  const payment = await Payment.findOne({
    where: { stripePaymentIntentId: intent.id },
  });

  if (!payment) return;

  payment.status = "failed";
  payment.failureReason =
    intent.last_payment_error?.message || "Payment failed";
  await payment.save();
}

/* ======================================================
   GET SESSION DETAILS (FRONTEND VERIFY)
====================================================== */
export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { user } = req;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID required",
      });
    }

    const payment = await Payment.findOne({
      where: {
        stripeSessionId: sessionId,
        userId: user.id,
      },
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "title", "thumbnail"],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment: payment.toJSON(),
    });
  } catch (error) {
    console.error("Session details error:", error);
    res.status(500).json({ success: false });
  }
};

/* ======================================================
   VERIFY SESSION & ENROLL (called by frontend after Stripe redirect)
   Handles the case where webhooks don't fire (e.g. local dev)
====================================================== */
export const verifyAndEnroll = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const { user } = req;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID required" });
    }

    // Retrieve the session from Stripe to confirm payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    const payment = await Payment.findOne({
      where: {
        stripeSessionId: sessionId,
        userId: user.id,
      },
      include: [{ model: Course, as: "courses" }],
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    // If already completed (webhook already handled it), just return success
    if (payment.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Already enrolled",
        payment: payment.toJSON(),
      });
    }

    // Mark payment as completed
    payment.status = "completed";
    payment.stripePaymentIntentId = session.payment_intent;
    await payment.save();

    // Create enrollments for each course
    for (const course of payment.courses) {
      const exists = await Enrollment.findOne({
        where: { userId: user.id, courseId: course.id },
      });
      if (!exists) {
        await Enrollment.create({
          userId: user.id,
          courseId: course.id,
          enrolledDate: new Date(),
        });
      }
    }

    // Clear the cart
    const userCart = await Cart.findOne({ where: { userId: user.id } });
    if (userCart) {
      await CartItem.destroy({ where: { cartId: userCart.id } });
    }

    console.log("✅ Frontend verify-and-enroll successful for user:", user.id);

    res.status(200).json({
      success: true,
      message: "Enrollment successful",
      payment: payment.toJSON(),
    });
  } catch (error) {
    console.error("Verify and enroll error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================
   PAYMENT HISTORY
====================================================== */
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "title", "thumbnail"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      payments: payments.map((p) => p.toJSON()),
    });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({ success: false });
  }
};

// GET - Admin: list all payments with pagination
export const getAllPayments = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const query = status ? { status } : {};

    const data = await paginate(Payment, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "user", select: "name email" },
        { path: "courses", select: "title" },
      ],
    });

    if (data.result) {
      data.result = data.result.map((p) => p.toJSON());
    }

    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
