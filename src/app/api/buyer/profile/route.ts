import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withAuth, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getProfile, updateProfile } from "@/services/buyer.service";
import { z } from "zod/v4";

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  avatar: z.string().url().optional(),
  addresses: z
    .array(
      z.object({
        fullName: z.string().min(1),
        phone: z.string().min(10),
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        zipCode: z.string().min(1),
        country: z.string().min(1),
        isDefault: z.boolean().optional().default(false),
      })
    )
    .optional(),
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    if (req.user.role !== "buyer") {
      return errorResponse("Insufficient permissions", 403);
    }
    const profile = await getProfile(req.user.id);
    return successResponse(profile);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    if (req.user.role !== "buyer") {
      return errorResponse("Insufficient permissions", 403);
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const profile = await updateProfile(req.user.id, parsed.data);
    return successResponse(profile, "Profile updated");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest) => Promise<Response>;
