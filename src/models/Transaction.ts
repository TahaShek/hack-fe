import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  buyerName: string;
  sellerName: string;
  amount: number;
  platformFee: number;
  sellerAmount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  paymentGatewayId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    buyerName: { type: String, required: true },
    sellerName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    sellerAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    paymentGatewayId: { type: String },
  },
  { timestamps: true },
);

const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction as mongoose.Model<ITransaction>;
