import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject
} from "../controllers/subjectController.js";

const router = express.Router();

router.post("/", authMiddleware, createSubject);
router.get("/", authMiddleware, getSubjects);
router.get("/:id", authMiddleware, getSubject);
router.put("/:id", authMiddleware, updateSubject);
router.delete("/:id", authMiddleware, deleteSubject);

export default router;