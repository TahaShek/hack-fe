import { connectDB } from "@/lib/db";
import { withRole } from "@/lib/withAuth";
import { type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getDashboard } from "@/services/seller.service";

export const GET = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const data = await getDashboard(req.user.id);
    return successResponse(data);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
