import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { verifyAccessToken } from "@/lib/auth";
import { getRecommendations } from "@/services/ai.service";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Optional auth -- extract user if token present
    let userId: string | undefined;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = verifyAccessToken(authHeader.slice(7));
        userId = decoded.id;
      } catch {
        // No auth is fine for this endpoint
      }
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const recommendations = await getRecommendations(userId, productId, limit);
    return successResponse(recommendations);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) return errorResponse(err.message || "Error", err.status);
    return errorResponse("Internal server error", 500);
  }
}
