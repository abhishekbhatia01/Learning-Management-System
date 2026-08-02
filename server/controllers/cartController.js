import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import User from "../model/User.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Course,
              as: "course",
              attributes: { exclude: ["description"] },
              include: [
                {
                  model: User,
                  as: "instructor",
                  attributes: ["id", "name", "email", "role"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty.",
        cart: { items: [] },
      });
    }

    const cartJson = cart.toJSON();

    if (!cartJson.items || cartJson.items.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "Cart is empty.", cart: cartJson, total: 0 });
    }

    const totalPrice = cartJson.items.reduce(
      (sum, item) => sum + parseFloat(item.course?.price || 0),
      0
    );

    res.status(200).json({
      success: true,
      message: "Fetched cart items",
      cart: cartJson,
      totalAmount: totalPrice,
    });
  } catch (error) {
    console.error("Get Cart Error: ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error : ${error.message}` });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const enrolledCourse = await Enrollment.findOne({
      where: {
        userId,
        courseId,
      },
    });

    if (enrolledCourse) {
      return res.status(400).json({
        success: false,
        message: "You already enrolled in this course.",
      });
    }

    // Get or create cart for the user
    const [cart] = await Cart.findOrCreate({
      where: { userId },
    });

    // Check current cart items count
    const itemsCount = await CartItem.count({ where: { cartId: cart.id } });
    if (itemsCount >= 4) {
      return res.status(400).json({
        success: false,
        message: "Maximum 4 courses allowed in cart at a time.",
      });
    }

    // Check if course already in cart
    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        courseId,
      },
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Course already in cart",
      });
    }

    await CartItem.create({
      cartId: cart.id,
      courseId,
    });

    return res.status(201).json({
      success: true,
      message: "Course added to cart successfully",
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({
      success: false,
      message: `Server Error: ${error.message}`,
    });
  }
};

// DELETE - student
export const removeFromCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found." });
    }

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        courseId,
      },
    });

    if (!cartItem) {
      return res.status(400).json({ message: "Course not in cart" });
    }

    await cartItem.destroy();

    // Fetch the updated cart to return it
    const updatedCart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Course,
              as: "course",
              attributes: { exclude: ["description"] },
            },
          ],
        },
      ],
    });

    res.status(200).json({
      message: "Course removed from cart",
      cart: updatedCart ? updatedCart.toJSON() : { items: [] },
    });
  } catch (error) {
    console.error("Remove from Cart Error: ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error : ${error.message}` });
  }
};
