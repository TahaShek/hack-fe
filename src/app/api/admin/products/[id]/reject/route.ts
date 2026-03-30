import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { rejectProduct } from "@/services/admin.service";

export const PUT = withRole(["admin"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = body.reason;
    } catch {
      // No body is fine
    }

    const product = await rejectProduct(id, reason);
    return successResponse(product, "Product rejected");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
