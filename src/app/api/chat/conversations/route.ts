import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getConversations, createConversation } from "@/services/chat.service";
import { z } from "zod/v4";

const createConversationSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  participantRole: z.enum(["buyer", "seller", "admin"]),
  participantName: z.string().min(1, "Participant name is required"),
  userName: z.string().min(1, "Your name is required"),
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const conversations = await getConversations(req.user.id);
    return successResponse(conversations);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = createConversationSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const conversation = await createConversation(
      req.user.id,
      req.user.role,
      parsed.data.userName,
      parsed.data.participantId,
      parsed.data.participantRole,
      parsed.data.participantName
    );

    return successResponse(conversation, "Conversation created", 201);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
