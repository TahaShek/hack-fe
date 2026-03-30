import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { emitNotification } from "@/lib/socket-emitter";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import { z } from "zod/v4";

const updateStatusSchema = z.object({
  status: z.enum(["confirmed", "packed", "shipped", "delivered", "cancelled"]),
  action: z.enum(["refund", "cancel", "return"]).optional(),
});

export const PUT = withRole(["admin"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ orderId: string }> })?.params;
    const { orderId } = await params;

    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid status", 422);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = parsed.data.status;

    // Handle refund action
    if (parsed.data.action === "refund") {
      order.paymentStatus = "refunded";
      await Transaction.updateMany(
        { orderId: order._id },
        { status: "refunded" }
      );
    }

    await order.save();

    // Notify buyer
    const buyerId = order.buyerId?.toString();
    if (buyerId) {
      const actionMessages: Record<string, string> = {
        refund: `Your order #${order.orderNumber} has been refunded`,
        cancel: `Your order #${order.orderNumber} has been cancelled by admin`,
        return: `Your return request for order #${order.orderNumber} has been processed`,
      };
      emitNotification(buyerId, {
        type: "order",
        title: parsed.data.action
          ? `Order ${parsed.data.action.charAt(0).toUpperCase() + parsed.data.action.slice(1)}`
          : "Order Updated",
        message: actionMessages[parsed.data.action || ""] || `Order #${order.orderNumber} status changed to ${parsed.data.status}`,
        data: { orderId, status: parsed.data.status },
      });
    }

    // Notify seller
    const sellerId = order.sellerId?.toString();
    if (sellerId) {
      emitNotification(sellerId, {
        type: "order",
        title: "Admin Order Update",
        message: `Order #${order.orderNumber} status changed from ${previousStatus} to ${parsed.data.status}`,
        data: { orderId, status: parsed.data.status },
      });
    }

    return successResponse(order, "Order status updated");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ orderId: string }> }) => Promise<Response>;
