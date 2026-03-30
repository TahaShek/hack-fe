import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getCategories } from "@/services/product.service";

export async function GET() {
  try {
    await connectDB();
    const categories = await getCategories();
    return successResponse(categories);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}
