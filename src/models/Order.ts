import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IOrderItem {
  productId: Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variants: Map<string, string>;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  buyerId: Types.ObjectId;
  buyerName: string;
  sellerId: Types.ObjectId;
  sellerName: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  orderStatus: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  trackingId?: string;
  estimatedDeliveryDate?: Date;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  couponApplied?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    variants: { type: Map, of: String, default: new Map() },
  },
  { _id: false },
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerName: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    sellerName: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    deliveryMethod: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingId: { type: String },
    estimatedDeliveryDate: { type: Date },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    couponApplied: { type: String },
  },
  { timestamps: true },
);

const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order as mongoose.Model<IOrder>;
