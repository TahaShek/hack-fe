import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getDashboard } from "@/services/admin.service";

export const GET = withRole(["admin"], async (_req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const data = await getDashboard();
    return successResponse(data);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
