import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "buyer";
  status: "active" | "blocked" | "suspended";
  avatar?: string;
  addresses: IAddress[];
  wishlist: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["buyer"], default: "buyer" },
    status: { type: String, enum: ["active", "blocked", "suspended"], default: "active" },
    avatar: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User as mongoose.Model<IUser>;
