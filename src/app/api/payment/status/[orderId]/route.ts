import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getPaymentStatus } from "@/services/payment.service";

export const GET = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ orderId: string }> })?.params;
    const { orderId } = await params;

    const result = await getPaymentStatus(req.user.id, orderId);
    return successResponse(result);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ orderId: string }> }) => Promise<Response>;
