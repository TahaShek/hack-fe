import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getWishlist } from "@/services/buyer.service";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    if (req.user.role !== "buyer") {
      return errorResponse("Insufficient permissions", 403);
    }
    const wishlist = await getWishlist(req.user.id);
    return successResponse(wishlist);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
