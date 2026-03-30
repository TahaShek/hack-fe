import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import Seller from "@/models/Seller";
import { comparePassword, hashPassword } from "@/lib/auth";
import { z } from "zod/v4";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const PUT = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Password must be at least 8 characters", 422);
    }

    const seller = await Seller.findById(req.user.id);
    if (!seller) {
      return errorResponse("Seller not found", 404);
    }

    const isMatch = await comparePassword(parsed.data.currentPassword, seller.passwordHash);
    if (!isMatch) {
      return errorResponse("Current password is incorrect", 400);
    }

    seller.passwordHash = await hashPassword(parsed.data.newPassword);
    await seller.save();

    return successResponse(null, "Password changed successfully");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
