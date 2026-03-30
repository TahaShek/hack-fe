import { type NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, type TokenPayload } from "@/lib/auth";
import { errorResponse } from "@/lib/apiResponse";
import type { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends NextRequest {
  user: TokenPayload & JwtPayload;
}

type RouteHandler = (
  req: NextRequest,
  context?: Record<string, unknown>,
) => Promise<NextResponse>;

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  context?: Record<string, unknown>,
) => Promise<NextResponse>;

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export function withAuth(handler: AuthenticatedHandler): RouteHandler {
  return async (req: NextRequest, context?: Record<string, unknown>) => {
    const token = extractToken(req);
    if (!token) {
      return errorResponse("Authentication required", 401);
    }

    try {
      const decoded = verifyAccessToken(token);
      (req as AuthenticatedRequest).user = decoded;
      return handler(req as AuthenticatedRequest, context);
    } catch {
      return errorResponse("Invalid or expired token", 401);
    }
  };
}

export function withRole(
  roles: Array<"buyer" | "seller" | "admin">,
  handler: AuthenticatedHandler,
): RouteHandler {
  return withAuth(async (req: AuthenticatedRequest, context?: Record<string, unknown>) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse("Insufficient permissions", 403);
    }
    return handler(req, context);
  });
}
