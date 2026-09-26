import Chat from "../models/Chat.js";
import Subject from "../models/Subject.js";
import Message from "../models/Message.js";

const verifySubjectOwnership = async (subjectId, userId) => {
  return Subject.findOne({
    _id: subjectId,
    userId
  });
};

const verifyChatOwnership = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return null;
  }

  const subject = await Subject.findOne({
    _id: chat.subjectId,
    userId
  });

  if (!subject) {
    return null;
  }

  return chat;
};

export const createChat = async (req, res) => {
  try {
    const { subjectId, title } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        message: "Subject ID is required"
      });
    }

    const subject = await verifySubjectOwnership(
      subjectId,
      req.user.userId
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found"
      });
    }

    const chat = await Chat.create({
      subjectId,
      title: title?.trim() || "New Chat"
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error("Create chat error:", error);

    return res.status(500).json({
      message: "Failed to create chat"
    });
  }
};

export const getChatsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await verifySubjectOwnership(
      subjectId,
      req.user.userId
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found"
      });
    }

    const chats = await Chat.find({
      subjectId
    }).sort({
      updatedAt: -1
    });

    return res.status(200).json(chats);
  } catch (error) {
    console.error("Get chats error:", error);

    return res.status(500).json({
      message: "Failed to fetch chats"
    });
  }
};

export const getChat = async (req, res) => {
  try {
    const chat = await verifyChatOwnership(
      req.params.id,
      req.user.userId
    );

    if (!chat || !chat.subjectId) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }

    const messages = await Message.find({
      chatId: chat._id
    }).sort({
      createdAt: 1
    });

    return res.status(200).json({
      chat: {
        _id: chat._id,
        title: chat.title,
        subjectId: chat.subjectId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      },
      messages
    });
  } catch (error) {
    console.error("Get chat error:", error);

    return res.status(500).json({
      message: "Failed to fetch chat"
    });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await verifyChatOwnership(
      req.params.id,
      req.user.userId
    );

    if (!chat || !chat.subjectId) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }

    await Message.deleteMany({
      chatId: chat._id
    });

    await Chat.deleteOne({
      _id: chat._id
    });

    return res.status(200).json({
      message: "Chat deleted successfully"
    });
  } catch (error) {
    console.error("Delete chat error:", error);

    return res.status(500).json({
      message: "Failed to delete chat"
    });
  }
};