import Stripe from "stripe";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

interface InitiatePaymentInput {
  orderId: string;
  paymentMethod: string;
}

export async function initiatePayment(userId: string, input: InitiatePaymentInput) {
  if (!mongoose.Types.ObjectId.isValid(input.orderId)) {
    throw { status: 400, message: "Invalid order ID" };
  }

  const order = await Order.findOne({ _id: input.orderId, buyerId: userId });
  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  if (order.paymentStatus === "completed") {
    throw { status: 400, message: "Order already paid" };
  }

  // Check if a pending transaction already exists for this order (prevents double-init)
  const existingTransaction = await Transaction.findOne({
    orderId: order._id,
    buyerId: userId,
    status: "pending",
  });

  if (existingTransaction?.paymentGatewayId) {
    // Retrieve existing PaymentIntent from Stripe
    try {
      const existingPI = await stripe.paymentIntents.retrieve(existingTransaction.paymentGatewayId);
      if (existingPI.status !== "canceled" && existingPI.status !== "succeeded") {
        return {
          transactionId: existingTransaction._id,
          clientSecret: existingPI.client_secret,
          paymentIntentId: existingPI.id,
          amount: order.totalAmount,
          currency: "usd",
          status: "pending",
        };
      }
    } catch {
      // Existing PI invalid, create a new one below
    }
  }

  // Create Stripe PaymentIntent (amount in cents)
  const amountInCents = Math.round(order.totalAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    payment_method_types: ["card"],
    metadata: {
      orderId: String(order._id),
      buyerId: userId,
      orderNumber: order.orderNumber || "",
    },
  });

  const platformFee = Math.round(order.totalAmount * 0.05 * 100) / 100;

  const transaction = await Transaction.create({
    orderId: order._id,
    buyerId: userId,
    sellerId: order.sellerId,
    buyerName: order.buyerName,
    sellerName: order.sellerName,
    amount: order.totalAmount,
    platformFee,
    sellerAmount: order.totalAmount - platformFee,
    status: "pending",
    paymentMethod: input.paymentMethod,
    paymentGatewayId: paymentIntent.id,
  });

  return {
    transactionId: transaction._id,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: order.totalAmount,
    currency: "usd",
    status: "pending",
  };
}

export async function confirmPayment(
  userId: string,
  paymentIntentId: string
) {
  const transaction = await Transaction.findOne({
    paymentGatewayId: paymentIntentId,
    buyerId: userId,
  });

  if (!transaction) {
    throw { status: 404, message: "Transaction not found" };
  }

  if (transaction.status === "completed") {
    throw { status: 400, message: "Payment already confirmed" };
  }

  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw { status: 400, message: `Payment not successful. Status: ${paymentIntent.status}` };
  }

  transaction.status = "completed";
  await transaction.save();

  // Update order payment status
  await Order.updateOne(
    { _id: transaction.orderId },
    { paymentStatus: "completed", orderStatus: "confirmed" }
  );

  return {
    transactionId: transaction._id,
    orderId: transaction.orderId,
    status: "completed",
    message: "Payment confirmed successfully",
  };
}

export async function getPaymentStatus(userId: string, orderId: string) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw { status: 400, message: "Invalid order ID" };
  }

  const order = await Order.findOne({ _id: orderId, buyerId: userId }).select(
    "orderNumber paymentStatus paymentMethod totalAmount"
  );

  if (!order) {
    throw { status: 404, message: "Order not found" };
  }

  const transaction = await Transaction.findOne({ orderId: order._id })
    .sort({ createdAt: -1 })
    .lean();

  return {
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    amount: order.totalAmount,
    transaction: transaction
      ? {
          id: transaction._id,
          status: transaction.status,
          reference: transaction.paymentGatewayId,
          createdAt: transaction.createdAt,
        }
      : null,
  };
}
