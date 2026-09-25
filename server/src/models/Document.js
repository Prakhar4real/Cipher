import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    storagePath: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "ready", "failed"],
      default: "uploaded"
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;