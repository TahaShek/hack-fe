import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getProduct } from "@/services/product.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await getProduct(id);
    return successResponse(product);
  } catch (error: unknown) {
    return handleApiError(error, "GET /products/:id");
  }
}
