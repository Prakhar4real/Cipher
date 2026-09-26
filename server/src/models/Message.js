import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    sources: [
  {
    _id: false,

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document"
    },

    documentName: {
      type: String,
      required: true
    },

    pageNumber: {
      type: Number,
      required: true
    },

    chunkIndex: {
      type: Number,
      required: true
    }
  }
]
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;