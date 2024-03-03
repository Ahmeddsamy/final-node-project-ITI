import cartModel from "../../../../DB/models/cart.model.js";
import orderModel from "../../../../DB/models/order.model.js";
import userModel from "../../../../DB/models/user.model.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.stripeSecret);

// Create Order
export const createOrder = async (req, res) => {
  try {
    const userId = req.userID; // Extract userId from the token
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the user's cart
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const paymentMethod = req.body.paymentMethod; // Assuming payment method is sent in the request body

    let paymentIntentId = null;
    let stripeClientSecret = null;

    if (paymentMethod === "onlinePayment") {
      // Create a Stripe payment intent for online payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: cart.priceAfterDiscount * 100,
        currency: "usd",
      });
      paymentIntentId = paymentIntent.id;
      stripeClientSecret = paymentIntent.client_secret;
    }

    // Create a new order with details from the cart
    const newOrder = new orderModel({
      userId,
      products: cart.products,
      totalAmount: cart.priceAfterDiscount,
      address: user.addresses[0], // Assuming we use the first address
      paymentMethod,
      stripePaymentIntentId: paymentIntentId, // Store the Stripe payment intent ID if online payment
    });

    await newOrder.save();

    // Clear the user's cart after order is created
    await cartModel.findByIdAndDelete(cart._id);

    const response = {
      message: "Order Placed Successfully",
      order: newOrder,
    };

    if (paymentMethod === "onlinePayment") {
      // Include Stripe client secret in the response for online payments
      response.stripeClientSecret = stripeClientSecret;
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Order
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Gett User Orders
// Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userID; // Assuming userID is set in the request, similar to your other controllers

    // Find the user to ensure they exist
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all orders by userId
    const orders = await orderModel.find({ userId }).populate({
      path: 'products.productId',
      model: 'Product' // Ensure this matches your Product model name
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    // Return the found orders to the client
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
