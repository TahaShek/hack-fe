import { NextResponse } from "next/server";

interface SuccessBody<T> {
  success: true;
  data: T;
  message: string;
}

interface ErrorBody {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Convert a value to a string ID. Handles MongoDB ObjectId instances,
 * plain strings, and objects with toString().
 */
function toStringId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    // MongoDB ObjectId — has a toString() that returns hex string
    if (typeof (value as { toString: () => string }).toString === "function") {
      const str = (value as { toString: () => string }).toString();
      // Only use toString result if it looks like a valid ObjectId hex string
      if (/^[a-f0-9]{24}$/.test(str)) return str;
    }
    // ObjectId may have .id property with the hex string
    const asRec = value as Record<string, unknown>;
    if (typeof asRec.id === "string" && /^[a-f0-9]{24}$/.test(asRec.id)) return asRec.id;
    // Fallback for buffer-style ObjectId
    if (asRec.buffer && typeof asRec.buffer === "object") {
      const buf = asRec.buffer as Record<string, number>;
      const bytes = Object.values(buf);
      if (bytes.length === 12) {
        return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    }
  }
  return String(value);
}

/**
 * Check if a value looks like a MongoDB ObjectId (raw or serialized)
 */
function isObjectIdLike(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return /^[a-f0-9]{24}$/.test(value);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // Check for BSON ObjectId structure
    if (obj.buffer && typeof obj.buffer === "object") return true;
    // Check for Mongoose ObjectId with toString
    if (typeof obj.toString === "function") {
      const str = obj.toString();
      if (/^[a-f0-9]{24}$/.test(str)) return true;
    }
  }
  return false;
}

/**
 * Convert Mongoose documents to plain objects to avoid circular references.
 */
function toPlainObject(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  // Mongoose document → call toObject()
  if (typeof data === "object" && typeof (data as Record<string, unknown>).toObject === "function") {
    return (data as { toObject: () => unknown }).toObject();
  }
  // Mongoose lean result arrays
  if (Array.isArray(data)) return data.map(toPlainObject);
  return data;
}

/**
 * Recursively transform MongoDB _id fields to id for frontend consumption.
 * Converts ObjectId instances to hex strings and removes raw _id.
 */
function transformIds(data: unknown, seen = new WeakSet()): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") return data;
  if (data instanceof Date) return data;
  // Handle ObjectId that's not inside an object (e.g., standalone reference)
  if (isObjectIdLike(data) && !Array.isArray(data) && typeof data === "object" && !("_id" in (data as Record<string, unknown>))) {
    return toStringId(data);
  }
  if (Array.isArray(data)) return data.map((item) => transformIds(item, seen));
  if (typeof data === "object") {
    // Prevent circular reference infinite loop
    if (seen.has(data as object)) return "[Circular]";
    seen.add(data as object);

    const obj = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "__v") continue;
      if (key === "_id") continue; // Skip _id, we'll add id instead
      // Skip Mongoose internal fields that cause circular refs
      if (key.startsWith("$") || key === "__parentArray" || key === "__parent" || key === "ownerDocument") continue;
      // Convert ObjectId references (like sellerId) to strings
      if (isObjectIdLike(value)) {
        result[key] = toStringId(value);
      } else {
        result[key] = transformIds(value, seen);
      }
    }
    // Add id from _id if not already present
    if (obj._id !== undefined && result.id === undefined) {
      result.id = toStringId(obj._id);
    }
    return result;
  }
  return data;
}

export function successResponse<T>(
  data: T,
  message = "Success",
  status = 200,
): NextResponse<SuccessBody<T>> {
  const plain = toPlainObject(data);
  const transformed = transformIds(plain) as T;
  return NextResponse.json({ success: true, data: transformed, message }, { status });
}

export function errorResponse(
  message: string,
  status = 400,
  errors?: Record<string, string[]>,
): NextResponse<ErrorBody> {
  if (status >= 500) {
    console.error(`[API Error ${status}]`, message, errors || "");
  }
  return NextResponse.json({ success: false, message, errors }, { status });
}

/**
 * Standard catch handler for API routes.
 * Logs the real error and returns a proper response.
 */
export function handleApiError(error: unknown, routeName?: string): NextResponse<ErrorBody> {
  const label = routeName ? `[API ${routeName}]` : "[API]";

  if (error instanceof Error) {
    console.error(label, error.message, error.stack?.split("\n").slice(0, 3).join("\n"));
  } else {
    const err = error as { status?: number; message?: string };
    if (err?.status && err.status < 500) {
      return errorResponse(err.message || "Error", err.status);
    }
    console.error(label, error);
  }

  const err = error as { status?: number; message?: string };
  if (err?.status) return errorResponse(err.message || "Error", err.status);
  return errorResponse("Internal server error", 500);
}
