import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { updateOrderStatus } from "@/services/seller.service";
import { emitNotification } from "@/lib/socket-emitter";
import { z } from "zod/v4";

const updateStatusSchema = z.object({
  status: z.enum(["confirmed", "packed", "shipped", "delivered"]),
  trackingId: z.string().optional(),
});

export const PUT = withRole(["seller"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid status value", 422);
    }

    const order = await updateOrderStatus(req.user.id, id, parsed.data.status, parsed.data.trackingId);

    // Emit real-time notification to buyer
    const orderData = order as unknown as { buyerId?: string; orderNumber?: string; _id?: string };
    if (orderData.buyerId) {
      const statusMessages: Record<string, string> = {
        confirmed: "Your order has been confirmed by the seller",
        packed: "Your order has been packed and is ready for shipping",
        shipped: `Your order has been shipped${parsed.data.trackingId ? ` (Tracking: ${parsed.data.trackingId})` : ""}`,
        delivered: "Your order has been delivered",
      };
      emitNotification(orderData.buyerId.toString(), {
        type: "order",
        title: `Order #${orderData.orderNumber || String(orderData._id).slice(-6)} — ${parsed.data.status}`,
        message: statusMessages[parsed.data.status] || `Order status updated to ${parsed.data.status}`,
        data: { orderId: id, status: parsed.data.status },
      });
    }

    return successResponse(order, "Order status updated");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
