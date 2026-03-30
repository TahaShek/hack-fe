import { type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { withRole, type AuthenticatedRequest } from "@/lib/withAuth";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Comment is required").max(2000),
});

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDB();
    const { id: productId } = await params;

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(reviews);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
};

export const POST = withRole(["buyer"], async (
  req: AuthenticatedRequest,
  context?: Record<string, unknown>
) => {
  try {
    await connectDB();
    const { id: productId } = await (context as { params: Promise<{ id: string }> }).params;
    const userId = req.user.id;

    // Validate request body
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 400, fieldErrors);
    }

    const { rating, comment } = parsed.data;

    // Check user has a delivered order containing this product
    const deliveredOrder = await Order.findOne({
      buyerId: userId,
      orderStatus: "delivered",
      "items.productId": productId,
    });

    if (!deliveredOrder) {
      return errorResponse(
        "You can only review products from delivered orders",
        403
      );
    }

    // Check user hasn't already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return errorResponse("You have already reviewed this product", 409);
    }

    // Get user info for the review
    const user = await User.findById(userId).select("fullName avatar");
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Create the review
    const review = await Review.create({
      productId,
      userId,
      userName: user.fullName,
      userAvatar: user.avatar,
      rating,
      comment,
    });

    // Update product rating and reviewCount
    const allReviews = await Review.find({ productId }).select("rating").lean();
    const totalRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverage = Math.round((totalRatings / allReviews.length) * 10) / 10;

    await Product.updateOne(
      { _id: productId },
      { rating: newAverage, reviewCount: allReviews.length }
    );

    return successResponse(review, "Review submitted successfully", 201);
  } catch (error: unknown) {
    // Handle MongoDB duplicate key error (unique index on productId+userId)
    const mongoErr = error as { code?: number; message?: string; status?: number };
    if (mongoErr.code === 11000) {
      return errorResponse("You have already reviewed this product", 409);
    }
    if (mongoErr.status) return errorResponse(mongoErr.message || "Error", mongoErr.status);
    console.error("[Reviews POST] Error:", error);
    return errorResponse("Internal server error", 500);
  }
});
