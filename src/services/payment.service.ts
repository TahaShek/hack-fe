import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";
import crypto from "crypto";

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

  // Reuse existing pending transaction if one exists
  const existingTransaction = await Transaction.findOne({
    orderId: order._id,
    buyerId: userId,
    status: "pending",
  });

  if (existingTransaction) {
    return {
      transactionId: existingTransaction._id,
      paymentId: existingTransaction.paymentGatewayId,
      amount: order.totalAmount,
      currency: "usd",
      status: "pending",
    };
  }

  // Generate sandbox payment ID
  const paymentId = `pay_${crypto.randomBytes(12).toString("hex")}`;
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
    paymentGatewayId: paymentId,
  });

  return {
    transactionId: transaction._id,
    paymentId,
    amount: order.totalAmount,
    currency: "usd",
    status: "pending",
  };
}

export async function confirmPayment(
  userId: string,
  paymentId: string
) {
  const transaction = await Transaction.findOne({
    paymentGatewayId: paymentId,
    buyerId: userId,
  });

  if (!transaction) {
    throw { status: 404, message: "Transaction not found" };
  }

  if (transaction.status === "completed") {
    throw { status: 400, message: "Payment already confirmed" };
  }

  // Sandbox mode — auto-approve payment
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
