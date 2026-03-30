import { connectDB } from "@/lib/db";
import { withRole } from "@/lib/withAuth";
import { type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getDashboard } from "@/services/seller.service";

export const GET = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const data = await getDashboard(req.user.id);
    return successResponse(data);
  } catch (error: unknown) {
    return handleApiError(error, "GET /seller/dashboard");
  }
});
