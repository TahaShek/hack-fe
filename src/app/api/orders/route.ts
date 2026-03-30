import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { createOrder } from "@/services/order.service";
import { emitNotification } from "@/lib/socket-emitter";
import { z } from "zod/v4";

const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  paymentMethod: z.string().min(1, "Payment method is required"),
  deliveryMethod: z.enum(["standard", "express"]).optional().default("standard"),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const orders = await createOrder(req.user.id, parsed.data);
    console.log("[POST /api/orders] Created", orders.length, "order(s)");

    // Notify each seller about their new order
    for (const order of orders) {
      const orderData = order as unknown as { sellerId?: string; orderNumber?: string; totalAmount?: number; _id?: string };
      console.log("[POST /api/orders] Notifying seller:", orderData.sellerId, "for order:", orderData.orderNumber);
      if (orderData.sellerId) {
        emitNotification(orderData.sellerId.toString(), {
          type: "order",
          title: "New Order Received",
          message: `Order #${orderData.orderNumber || String(orderData._id).slice(-6)} — $${(orderData.totalAmount || 0).toFixed(2)}`,
          data: { orderId: String(orderData._id) },
        });
      }
    }

    return successResponse(orders, "Order(s) created successfully", 201);
  } catch (error: unknown) {
    console.error("[POST /api/orders] Error:", error);
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
