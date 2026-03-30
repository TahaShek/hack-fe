import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { handleChatbot } from "@/services/ai.service";
import { z } from "zod/v4";

const chatbotSchema = z.object({
  message: z.string().min(1, "Message is required"),
  context: z
    .object({
      orderId: z.string().optional(),
    })
    .optional(),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = chatbotSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Message is required", 422);
    }

    const result = await handleChatbot({
      message: parsed.data.message,
      userId: req.user.id,
      context: parsed.data.context,
    });

    return successResponse(result);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
