import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getDashboard } from "@/services/admin.service";

export const GET = withRole(["admin"], async (_req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const data = await getDashboard();
    return successResponse(data);
  } catch (error: unknown) {
    return handleApiError(error, "GET /admin/dashboard");
  }
});
