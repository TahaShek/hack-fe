import User, { type IUser } from "@/models/User";
import Seller, { type ISeller } from "@/models/Seller";
import Admin from "@/models/Admin";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from "@/lib/auth";

interface RegisterBuyerInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface RegisterSellerInput {
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  storeDescription?: string;
  businessAddress?: {
    street: string;
    city: string;
    state: string;
    zip?: string;
    zipCode?: string;
    country: string;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: "buyer" | "seller" | "admin";
    name: string;
  };
}

export async function registerBuyer(input: RegisterBuyerInput): Promise<AuthTokens> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw { status: 409, message: "Email already registered" };
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    passwordHash,
    role: "buyer",
  });

  const payload: TokenPayload = { id: user._id.toString(), role: "buyer" };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: user._id.toString(),
      email: user.email,
      role: "buyer",
      name: user.fullName,
    },
  };
}

export async function registerSeller(input: RegisterSellerInput): Promise<AuthTokens> {
  const existing = await Seller.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw { status: 409, message: "Email already registered" };
  }

  const passwordHash = await hashPassword(input.password);
  const seller = await Seller.create({
    storeName: input.storeName,
    ownerName: input.ownerName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    passwordHash,
    storeDescription: input.storeDescription,
    businessAddress: input.businessAddress,
    bankDetails: input.bankDetails,
    role: "seller",
  });

  const payload: TokenPayload = { id: seller._id.toString(), role: "seller" };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: seller._id.toString(),
      email: seller.email,
      role: "seller",
      name: seller.storeName,
    },
  };
}

export async function loginBuyer(input: LoginInput): Promise<AuthTokens> {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash") as IUser | null;
  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }
  if (user.status === "blocked") {
    throw { status: 403, message: "Your account has been blocked" };
  }

  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const payload: TokenPayload = { id: user._id.toString(), role: "buyer" };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: user._id.toString(),
      email: user.email,
      role: "buyer",
      name: user.fullName,
    },
  };
}

export async function loginSeller(input: LoginInput): Promise<AuthTokens> {
  const seller = await Seller.findOne({ email: input.email.toLowerCase() }).select("+passwordHash") as ISeller | null;
  if (!seller) {
    throw { status: 401, message: "Invalid email or password" };
  }
  if (seller.status === "blocked") {
    throw { status: 403, message: "Your account has been blocked" };
  }

  const isMatch = await comparePassword(input.password, seller.passwordHash);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const payload: TokenPayload = { id: seller._id.toString(), role: "seller" };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: seller._id.toString(),
      email: seller.email,
      role: "seller",
      name: seller.storeName,
    },
  };
}

export async function loginAdmin(input: LoginInput): Promise<AuthTokens> {
  const admin = await Admin.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");
  if (!admin) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const isMatch = await comparePassword(input.password, admin.passwordHash);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const payload: TokenPayload = { id: admin._id.toString(), role: "admin" };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: admin._id.toString(),
      email: admin.email,
      role: "admin",
      name: "Admin",
    },
  };
}

export async function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const decoded = verifyRefreshToken(token);
    const payload: TokenPayload = { id: decoded.id, role: decoded.role };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  } catch {
    throw { status: 401, message: "Invalid or expired refresh token" };
  }
}
