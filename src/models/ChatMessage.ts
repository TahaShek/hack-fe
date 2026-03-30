import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IChatMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image";
  imageUrl?: string;
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image"], default: "text" },
    imageUrl: { type: String },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date },
  },
  { timestamps: true },
);

const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessage as mongoose.Model<IChatMessage>;
