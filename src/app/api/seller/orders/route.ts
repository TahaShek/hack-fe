import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getOrders } from "@/services/seller.service";

export const GET = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await getOrders(req.user.id, page, limit, status, search);
    return successResponse(data);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
