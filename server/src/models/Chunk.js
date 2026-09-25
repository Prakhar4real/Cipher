import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true
    },

    pageNumber: {
      type: Number,
      required: true,
      min: 1
    },

    chunkIndex: {
      type: Number,
      required: true,
      min: 0
    },

    text: {
      type: String,
      required: true,
      trim: true
    },

    embedding: {
      type: [Number],
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Chunk = mongoose.model("Chunk", chunkSchema);

export default Chunk;