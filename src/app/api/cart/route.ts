import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getCart } from "@/services/cart.service";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const cart = await getCart(req.user.id);
    return successResponse(cart);
  } catch (error: unknown) {
    return handleApiError(error, "GET /cart");
  }
});
