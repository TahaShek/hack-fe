import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getOrders } from "@/services/buyer.service";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    if (req.user.role !== "buyer") {
      return errorResponse("Insufficient permissions", 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || undefined;

    const result = await getOrders(req.user.id, page, limit, status);
    return successResponse(result);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
