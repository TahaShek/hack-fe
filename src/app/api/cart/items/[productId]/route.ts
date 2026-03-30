import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { updateQuantity, removeItem } from "@/services/cart.service";
import { z } from "zod/v4";

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
});

export const PUT = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ productId: string }> })?.params;
    const { productId } = await params;

    const body = await req.json();
    const parsed = updateQuantitySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Quantity must be a non-negative integer", 422);
    }

    const cart = await updateQuantity(req.user.id, productId, parsed.data.quantity);
    return successResponse(cart, "Cart updated");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ productId: string }> }) => Promise<Response>;

export const DELETE = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ productId: string }> })?.params;
    const { productId } = await params;

    const cart = await removeItem(req.user.id, productId);
    return successResponse(cart, "Item removed from cart");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ productId: string }> }) => Promise<Response>;
