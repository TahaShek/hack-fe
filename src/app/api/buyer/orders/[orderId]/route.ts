import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getOrderById } from "@/services/buyer.service";

export const GET = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    if (req.user.role !== "buyer") {
      return errorResponse("Insufficient permissions", 403);
    }
    const params = (context as { params: Promise<{ orderId: string }> })?.params;
    const { orderId } = await params;
    const order = await getOrderById(req.user.id, orderId);
    return successResponse(order);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ orderId: string }> }) => Promise<Response>;
