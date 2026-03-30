import { connectDB } from "@/lib/db";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getCoupons, createCoupon } from "@/services/seller.service";
import { z } from "zod/v4";

const createCouponSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0, "Discount must be positive"),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(0).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const GET = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const data = await getCoupons(req.user.id, page, limit);
    return successResponse(data);
  } catch (error: unknown) {
    return handleApiError(error, "GET /seller/coupons");
  }
});

export const POST = withRole(["seller"], async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = createCouponSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const coupon = await createCoupon(req.user.id, parsed.data);
    return successResponse(coupon, "Coupon created", 201);
  } catch (error: unknown) {
    return handleApiError(error, "POST /seller/coupons");
  }
});
