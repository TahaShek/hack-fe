import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true },
);

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin as mongoose.Model<IAdmin>;
