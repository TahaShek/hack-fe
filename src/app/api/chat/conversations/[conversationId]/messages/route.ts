import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getMessages, sendMessage } from "@/services/chat.service";
import { z } from "zod/v4";

const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  type: z.enum(["text", "image"]).optional().default("text"),
  imageUrl: z.string().url().optional(),
  userName: z.string().min(1, "Sender name is required"),
});

export const GET = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ conversationId: string }> })?.params;
    const { conversationId } = await params;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const data = await getMessages(req.user.id, conversationId, page, limit);
    return successResponse(data);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ conversationId: string }> }) => Promise<Response>;

export const POST = withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ conversationId: string }> })?.params;
    const { conversationId } = await params;

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const message = await sendMessage(
      req.user.id,
      req.user.role,
      parsed.data.userName,
      conversationId,
      parsed.data.content,
      parsed.data.type,
      parsed.data.imageUrl
    );

    return successResponse(message, "Message sent", 201);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ conversationId: string }> }) => Promise<Response>;
