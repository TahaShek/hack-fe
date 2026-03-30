import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IBusinessAddress {
  street: string;
  city: string;
  state: string;
  zip?: string;
  zipCode?: string;
  country: string;
}

export interface IBankDetails {
  bankName?: string;
  accountNumber: string;
  routingNumber: string;
  accountHolder?: string;
}

export interface ISeller extends Document {
  _id: Types.ObjectId;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "seller";
  status: "active" | "blocked" | "suspended";
  businessAddress: IBusinessAddress;
  bankDetails: IBankDetails;
  storeLogoUrl?: string;
  storeDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessAddressSchema = new Schema<IBusinessAddress>(
  {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  { _id: false },
);

const BankDetailsSchema = new Schema<IBankDetails>(
  {
    bankName: { type: String },
    accountNumber: { type: String },
    routingNumber: { type: String },
    accountHolder: { type: String },
  },
  { _id: false },
);

const SellerSchema = new Schema<ISeller>(
  {
    storeName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["seller"], default: "seller" },
    status: { type: String, enum: ["active", "blocked", "suspended"], default: "active" },
    businessAddress: { type: BusinessAddressSchema },
    bankDetails: { type: BankDetailsSchema, select: false },
    storeLogoUrl: { type: String },
    storeDescription: { type: String },
  },
  { timestamps: true },
);

const Seller = mongoose.models.Seller || mongoose.model<ISeller>("Seller", SellerSchema);

export default Seller as mongoose.Model<ISeller>;
