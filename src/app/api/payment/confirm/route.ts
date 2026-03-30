import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { confirmPayment } from "@/services/payment.service";
import { z } from "zod/v4";

const confirmSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Payment intent ID is required", 422);
    }

    const result = await confirmPayment(req.user.id, parsed.data.paymentIntentId);

    return successResponse(result, "Payment confirmed");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
