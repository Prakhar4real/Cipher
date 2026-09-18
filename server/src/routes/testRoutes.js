import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route",
    userId: req.user.userId
  });
});

export default router;