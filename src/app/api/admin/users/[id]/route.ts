import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import User from "@/models/User";
import Seller from "@/models/Seller";
import { z } from "zod/v4";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["buyer", "seller", "admin"]).optional(),
  status: z.enum(["active", "blocked", "suspended"]).optional(),
});

export const PUT = withRole(["admin"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid user data", 422);
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name) updateData.fullName = parsed.data.name;
    if (parsed.data.email) updateData.email = parsed.data.email;
    if (parsed.data.status) updateData.status = parsed.data.status;

    // Try updating in User collection first, then Seller
    let user = await User.findByIdAndUpdate(id, updateData, { new: true })?.select("-passwordHash");
    if (!user) {
      const sellerUpdate: Record<string, unknown> = {};
      if (parsed.data.name) sellerUpdate.ownerName = parsed.data.name;
      if (parsed.data.email) sellerUpdate.email = parsed.data.email;
      if (parsed.data.status) sellerUpdate.status = parsed.data.status;

      const seller = await Seller.findByIdAndUpdate(id, sellerUpdate, { new: true })?.select("-passwordHash");
      if (!seller) {
        return errorResponse("User not found", 404);
      }
      return successResponse(seller, "User updated successfully");
    }

    return successResponse(user, "User updated successfully");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
