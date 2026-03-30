import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IParticipant {
  userId: Types.ObjectId;
  name: string;
  role: "buyer" | "seller" | "admin";
}

export interface ILastMessage {
  content: string;
  senderId: Types.ObjectId;
  createdAt: Date;
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: IParticipant[];
  lastMessage?: ILastMessage;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["buyer", "seller", "admin"], required: true },
  },
  { _id: false },
);

const LastMessageSchema = new Schema<ILastMessage>(
  {
    content: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false },
);

const ConversationSchema = new Schema<IConversation>(
  {
    participants: { type: [ParticipantSchema], required: true },
    lastMessage: { type: LastMessageSchema },
  },
  { timestamps: true },
);

ConversationSchema.index({ "participants.userId": 1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation as mongoose.Model<IConversation>;
