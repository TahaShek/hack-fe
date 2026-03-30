import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { requestReturn } from "@/services/buyer.service";
import { z } from "zod/v4";

const returnSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export const POST = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    if (req.user.role !== "buyer") {
      return errorResponse("Insufficient permissions", 403);
    }

    const params = (context as { params: Promise<{ orderId: string }> })?.params;
    const { orderId } = await params;

    const body = await req.json();
    const parsed = returnSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Reason is required (min 10 characters)", 422);
    }

    const order = await requestReturn(req.user.id, orderId, parsed.data.reason);
    return successResponse(order, "Return request submitted");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ orderId: string }> }) => Promise<Response>;
