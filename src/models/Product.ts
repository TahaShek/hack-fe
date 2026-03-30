import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IVariantOption {
  value: string;
  price?: number;
  stock: number;
}

export interface IProductVariant {
  name: string;
  type: "size" | "color" | "material" | "custom";
  options: IVariantOption[];
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  sellerId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  variants: IProductVariant[];
  skuCode: string;
  stockQuantity: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  isFlagged: boolean;
  tags: string[];
  status: "pending" | "approved" | "rejected";
  purchases: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const VariantOptionSchema = new Schema<IVariantOption>(
  {
    value: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["size", "color", "material", "custom"], required: true },
    options: { type: [VariantOptionSchema], default: [] },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number },
    variants: { type: [ProductVariantSchema], default: [] },
    skuCode: { type: String, required: true, unique: true, trim: true },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    purchases: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product as mongoose.Model<IProduct>;
