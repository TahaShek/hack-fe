import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function POST() {
  try {
    const response = successResponse(null, "Logged out successfully");
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
