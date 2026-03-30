import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { refreshToken } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const cookieToken = req.cookies.get("refreshToken")?.value;
    let bodyToken: string | undefined;

    try {
      const body = await req.json();
      bodyToken = body.refreshToken;
    } catch {
      // No body provided, use cookie
    }

    const token = cookieToken || bodyToken;
    if (!token) {
      return errorResponse("Refresh token required", 401);
    }

    const result = await refreshToken(token);

    const response = successResponse(result, "Token refreshed");
    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status) {
      return errorResponse(err.message || "Error", err.status);
    }
    return errorResponse("Internal server error", 500);
  }
}
