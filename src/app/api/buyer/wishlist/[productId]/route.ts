import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { addToWishlist, removeFromWishlist } from "@/services/buyer.service";

export const POST = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    if (req.user.role !== "buyer") {
      return errorResponse("Insufficient permissions", 403);
    }
    const params = (context as { params: Promise<{ productId: string }> })?.params;
    const { productId } = await params;
    const result = await addToWishlist(req.user.id, productId);
    return successResponse(result, "Added to wishlist", 201);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ productId: string }> }) => Promise<Response>;

export const DELETE = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    if (req.user.role !== "buyer") {
      return errorResponse("Insufficient permissions", 403);
    }
    const params = (context as { params: Promise<{ productId: string }> })?.params;
    const { productId } = await params;
    const result = await removeFromWishlist(req.user.id, productId);
    return successResponse(result, "Removed from wishlist");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ productId: string }> }) => Promise<Response>;
