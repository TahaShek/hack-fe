import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { initiatePayment } from "@/services/payment.service";
import { z } from "zod/v4";

const initiateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = initiateSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const result = await initiatePayment(req.user.id, parsed.data);
    return successResponse(result, "Payment initiated", 201);
  } catch (error: unknown) {
    return handleApiError(error, "POST /payment/initiate");
  }
});
