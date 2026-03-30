import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { confirmPayment } from "@/services/payment.service";
import { z } from "zod/v4";

const confirmSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = confirmSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Payment ID is required", 422);
    }

    const result = await confirmPayment(req.user.id, parsed.data.paymentId);

    return successResponse(result, "Payment confirmed");
  } catch (error: unknown) {
    return handleApiError(error, "POST /payment/confirm");
  }
});
