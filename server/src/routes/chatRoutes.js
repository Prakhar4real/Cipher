import express from "express";
import { sendMessage } from "../controllers/messageController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createChat,
  getChatsBySubject,
  getChat,
  deleteChat
} from "../controllers/chatController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createChat
);

router.get(
  "/subject/:subjectId",
  authMiddleware,
  getChatsBySubject
);

router.get(
  "/:id",
  authMiddleware,
  getChat
);

router.delete(
  "/:id",
  authMiddleware,
  deleteChat
);

router.post(
  "/:chatId/messages",
  authMiddleware,
  sendMessage
);

export default router;