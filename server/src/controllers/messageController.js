import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

import { generateEmbedding } from "../services/embeddingService.js";
import { searchSimilarChunks } from "../services/retrievalService.js";
import { generateAnswer } from "../services/generationService.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required"
      });
    }

    const chat = await Chat.findById(chatId).populate("subjectId");

    if (!chat || !chat.subjectId) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }

    if (
      chat.subjectId.userId.toString() !==
      req.user.userId.toString()
    ) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }

    const userMessage = await Message.create({
      chatId: chat._id,
      role: "user",
      content: content.trim(),
      sources: []
    });

    try {
      const queryEmbedding = await generateEmbedding(
        content.trim()
      );

      const sources = await searchSimilarChunks(
        queryEmbedding,
        req.user.userId,
        5
      );

      const generationResult = await generateAnswer(
        content.trim(),
        sources
      );

      const citations = generationResult.hasAnswer
        ? sources.map((source) => ({
            documentId: source.documentId,
            documentName: source.documentName,
            pageNumber: source.pageNumber,
            chunkIndex: source.chunkIndex
          }))
        : [];

      const assistantMessage = await Message.create({
        chatId: chat._id,
        role: "assistant",
        content: generationResult.answer,
        sources: citations
      });

      await Chat.updateOne(
        {
          _id: chat._id
        },
        {
          $set: {
            updatedAt: new Date()
          }
        }
      );

      return res.status(201).json({
        userMessage,
        assistantMessage
      });
    } catch (aiError) {
      console.error("RAG processing error:", aiError);

      return res.status(502).json({
        message:
          "Unable to generate a response right now. Please try again."
      });
    }
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      message: "Failed to send message"
    });
  }
};