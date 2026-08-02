import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const balance = await stripe.balance.retrieve();
    console.log("✅ Stripe Connected");
    console.log(balance);
  } catch (err) {
    console.error("❌ Stripe Error");
    console.error(err);
  }
}

test();