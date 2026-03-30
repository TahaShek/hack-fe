import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface ISearchLog extends Document {
  _id: Types.ObjectId;
  query: string;
  userId?: Types.ObjectId;
  resultCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SearchLogSchema = new Schema<ISearchLog>(
  {
    query: { type: String, required: true, index: true, trim: true, lowercase: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    resultCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const SearchLog =
  mongoose.models.SearchLog || mongoose.model<ISearchLog>("SearchLog", SearchLogSchema);

export default SearchLog as mongoose.Model<ISearchLog>;
