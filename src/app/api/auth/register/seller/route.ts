import { type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { registerSeller } from "@/services/auth.service";
import { z } from "zod/v4";

const registerSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  storeDescription: z.string().optional(),
  businessAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
  }).optional(),
  bankDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return errorResponse("Validation failed", 422, errors);
    }

    const result = await registerSeller(parsed.data);

    const response = successResponse(result, "Registration successful", 201);
    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("[Seller Register Error]", JSON.stringify(error, Object.getOwnPropertyNames(error as object), 2));
    console.error("[Seller Register Error Raw]", error);
    const err = error as { status?: number; message?: string; code?: number; name?: string; errors?: Record<string, unknown> };
    if (err.status) {
      return errorResponse(err.message || "Error", err.status);
    }
    // MongoDB duplicate key error
    if (err.code === 11000) {
      return errorResponse("Email already registered", 409);
    }
    // Mongoose validation error
    if (err.name === "ValidationError" && err.errors) {
      const messages = Object.values(err.errors).map((e) => (e as { message?: string }).message || String(e));
      return errorResponse(`Validation failed: ${messages.join(", ")}`, 422);
    }
    return errorResponse(err.message || "Internal server error", 500);
  }
}
