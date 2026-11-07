import Subject from "../models/Subject.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const createSubject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Subject name is required"
      });
    }

    const subject = await Subject.create({
      name,
      userId: req.user.userId
    });

    return res.status(201).json({
      message: "Subject created successfully",
      subject
    });
  } catch (error) {
    console.error("Create subject error:", error.message);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({
      userId: req.user.userId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      subjects
    });
  } catch (error) {
    console.error("Get subjects error:", error.message);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found"
      });
    }

    return res.status(200).json({
      subject
    });
  } catch (error) {
    console.error("Get subject error:", error.message);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Subject name is required"
      });
    }

    const subject = await Subject.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      {
        name
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found"
      });
    }

    return res.status(200).json({
      message: "Subject updated successfully",
      subject
    });
  } catch (error) {
    console.error("Update subject error:", error.message);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found"
      });
    }

    // Find all chats belonging to this subject
    const chats = await Chat.find({
      subjectId: subject._id
    }).select("_id");

    const chatIds = chats.map((chat) => chat._id);

    // Delete all messages belonging to those chats
    if (chatIds.length > 0) {
      await Message.deleteMany({
        chatId: { $in: chatIds }
      });
    }

    // Delete all chats belonging to this subject
    await Chat.deleteMany({
      subjectId: subject._id
    });

    // Finally, delete the subject
    await Subject.deleteOne({
      _id: subject._id
    });

    return res.status(200).json({
      message: "Subject and associated chats and messages deleted successfully"
    });
  } catch (error) {
    console.error("Delete subject error:", error);

    return res.status(500).json({
      message: "Failed to delete subject"
    });
  }
};