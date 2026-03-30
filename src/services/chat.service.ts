import Conversation from "@/models/Conversation";
import ChatMessage from "@/models/ChatMessage";
import mongoose from "mongoose";

export async function getConversations(userId: string) {
  const conversations = await Conversation.find({
    "participants.userId": new mongoose.Types.ObjectId(userId),
  })
    .sort({ updatedAt: -1 })
    .lean();

  // Get unread counts and map fields for frontend
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await ChatMessage.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: new mongoose.Types.ObjectId(userId) },
        seen: false,
      });
      return {
        ...conv,
        id: conv._id?.toString(),
        unreadCount,
        participants: conv.participants.map((p) => ({
          ...p,
          id: (p as unknown as Record<string, unknown>).userId?.toString(),
        })),
      };
    })
  );

  return conversationsWithUnread;
}

export async function createConversation(
  userId: string,
  userRole: "buyer" | "seller" | "admin",
  userName: string,
  participantId: string,
  participantRole: "buyer" | "seller" | "admin",
  participantName: string
) {
  // Check if conversation already exists between these two users
  const existing = await Conversation.findOne({
    $and: [
      { "participants.userId": new mongoose.Types.ObjectId(userId) },
      { "participants.userId": new mongoose.Types.ObjectId(participantId) },
    ],
  });

  if (existing) {
    return existing;
  }

  const conversation = await Conversation.create({
    participants: [
      { userId: new mongoose.Types.ObjectId(userId), role: userRole, name: userName },
      { userId: new mongoose.Types.ObjectId(participantId), role: participantRole, name: participantName },
    ],
  });

  return conversation;
}

export async function getMessages(
  userId: string,
  conversationId: string,
  page = 1,
  limit = 50
) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw { status: 400, message: "Invalid conversation ID" };
  }

  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": new mongoose.Types.ObjectId(userId),
  });

  if (!conversation) {
    throw { status: 404, message: "Conversation not found" };
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    ChatMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ChatMessage.countDocuments({ conversationId }),
  ]);

  return messages.reverse().map((m) => ({
    ...m,
    id: m._id?.toString(),
    senderId: m.senderId?.toString(),
    conversationId: m.conversationId?.toString(),
  }));
}

export async function sendMessage(
  userId: string,
  userRole: "buyer" | "seller" | "admin",
  userName: string,
  conversationId: string,
  content: string,
  type: "text" | "image" = "text",
  imageUrl?: string
) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw { status: 400, message: "Invalid conversation ID" };
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": new mongoose.Types.ObjectId(userId),
  });

  if (!conversation) {
    throw { status: 404, message: "Conversation not found" };
  }

  const message = await ChatMessage.create({
    conversationId,
    senderId: new mongoose.Types.ObjectId(userId),
    senderName: userName,
    content,
    type,
    imageUrl,
    seen: false,
  });

  // Update conversation's last message
  conversation.lastMessage = {
    content,
    senderId: new mongoose.Types.ObjectId(userId),
    createdAt: new Date(),
  };
  await conversation.save();

  return message;
}

export async function markAsSeen(userId: string, conversationId: string) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw { status: 400, message: "Invalid conversation ID" };
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    "participants.userId": new mongoose.Types.ObjectId(userId),
  });

  if (!conversation) {
    throw { status: 404, message: "Conversation not found" };
  }

  await ChatMessage.updateMany(
    {
      conversationId,
      senderId: { $ne: new mongoose.Types.ObjectId(userId) },
      seen: false,
    },
    { seen: true, seenAt: new Date() }
  );

  return { message: "Messages marked as seen" };
}
