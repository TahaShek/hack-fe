import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { updateCoupon, deleteCoupon } from "@/services/seller.service";
import { z } from "zod/v4";

const updateCouponSchema = z.object({
  code: z.string().min(3).optional(),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const PUT = withRole(["seller"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    const body = await req.json();
    const parsed = updateCouponSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const coupon = await updateCoupon(req.user.id, id, parsed.data);
    return successResponse(coupon, "Coupon updated");
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;

export const DELETE = withRole(["seller"], async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
  try {
    await connectDB();
    const params = (context as { params: Promise<{ id: string }> })?.params;
    const { id } = await params;

    const result = await deleteCoupon(req.user.id, id);
    return successResponse(result);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}) as (req: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
