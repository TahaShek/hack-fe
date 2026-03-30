import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getCart } from "@/services/cart.service";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const cart = await getCart(req.user.id);
    return successResponse(cart);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
