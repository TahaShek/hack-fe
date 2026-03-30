import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { blockUser, suspendUser, activateUser } from "@/services/admin.service";
import { z } from "zod/v4";

const actionSchema = z.object({
  action: z.enum(["block", "suspend", "activate"]),
  role: z.enum(["buyer", "seller"]).default("buyer"),
});

export const PUT = withRole(["admin"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid action. Must be 'block', 'suspend', or 'activate'", 422);
    }

    let user;
    switch (parsed.data.action) {
      case "block":
        user = await blockUser(id, parsed.data.role);
        break;
      case "suspend":
        user = await suspendUser(id, parsed.data.role);
        break;
      case "activate":
        user = await activateUser(id, parsed.data.role);
        break;
    }

    return successResponse(user, `User ${parsed.data.action}ed successfully`);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
