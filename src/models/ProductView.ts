import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IProductView extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  category: string;
  viewCount: number;
  lastViewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductViewSchema = new Schema<IProductView>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    category: { type: String, required: true },
    viewCount: { type: Number, default: 1 },
    lastViewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

ProductViewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const ProductView =
  mongoose.models.ProductView || mongoose.model<IProductView>("ProductView", ProductViewSchema);

export default ProductView as mongoose.Model<IProductView>;
