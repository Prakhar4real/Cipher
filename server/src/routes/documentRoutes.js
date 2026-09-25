import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../config/upload.js";
import {
  uploadDocument,
  getDocumentsBySubject,
  getDocument,
  deleteDocument
} from "../controllers/documentController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  uploadDocument
);

router.get(
  "/subject/:subjectId",
  authMiddleware,
  getDocumentsBySubject
);

router.get(
  "/:id",
  authMiddleware,
  getDocument
);

router.delete(
  "/:id",
  authMiddleware,
  deleteDocument
);

export default router;