import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.json({
    message: "Cipher API is running"
  });
});

const PORT = process.env.PORT || 5000;

// Start the application
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Cipher server running on port ${PORT}`);
  });
};

startServer();