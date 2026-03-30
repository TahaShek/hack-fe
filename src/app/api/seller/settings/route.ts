import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getSettings, updateSettings } from "@/services/seller.service";
import { z } from "zod/v4";

const updateSettingsSchema = z.object({
  storeName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  storeDescription: z.string().optional(),
  storeLogoUrl: z.string().url().optional(),
  businessAddress: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zipCode: z.string().min(1),
      country: z.string().min(1),
    })
    .optional(),
});

export const GET = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const data = await getSettings(req.user.id);
    return successResponse(data);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});

export const PUT = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const seller = await updateSettings(req.user.id, parsed.data);
    return successResponse(seller, "Settings updated");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
});
