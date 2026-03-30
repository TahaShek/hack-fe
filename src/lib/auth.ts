import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Read secrets lazily so dotenv/Next.js can load .env.local first
function getAccessSecret() { return process.env.JWT_ACCESS_SECRET || "access-secret-dev"; }
function getRefreshSecret() { return process.env.JWT_REFRESH_SECRET || "refresh-secret-dev"; }
function getAccessExpiry() { return process.env.JWT_ACCESS_EXPIRY || "15m"; }
function getRefreshExpiry() { return process.env.JWT_REFRESH_EXPIRY || "7d"; }

export interface TokenPayload {
  id: string;
  role: "buyer" | "seller" | "admin";
}

export function generateAccessToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: getAccessExpiry() as unknown as SignOptions["expiresIn"] };
  return jwt.sign({ ...payload }, getAccessSecret(), opts);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: getRefreshExpiry() as unknown as SignOptions["expiresIn"] };
  return jwt.sign({ ...payload }, getRefreshSecret(), opts);
}

export function verifyAccessToken(token: string): TokenPayload & JwtPayload {
  return jwt.verify(token, getAccessSecret()) as TokenPayload & JwtPayload;
}

export function verifyRefreshToken(token: string): TokenPayload & JwtPayload {
  return jwt.verify(token, getRefreshSecret()) as TokenPayload & JwtPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
