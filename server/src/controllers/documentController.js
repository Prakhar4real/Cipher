import Document from "../models/Document.js";
import Subject from "../models/Subject.js";
import {
  uploadFile,
  deleteFile
} from "../services/storageService.js";
import { ingestDocument } from "../services/ingestionService.js";

export const uploadDocument = async (req, res) => {
  try {
    const { subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        message: "Subject ID is required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required"
      });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      userId: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found"
      });
    }

    const filePath = `${req.user.userId}/${subjectId}/${Date.now()}-${req.file.originalname}`;

    await uploadFile(
      req.file.buffer,
      filePath,
      req.file.mimetype
    );

    const document = await Document.create({
      name: req.file.originalname,
      subjectId,
      storagePath: filePath,
      status: "uploaded"
    });

    await ingestDocument(document._id);

    const processedDocument = await Document.findById(
      document._id
    );

    return res.status(201).json({
      message: "Document uploaded and processed successfully",
      document: processedDocument
    });
  } catch (error) {
    console.error(
      "Upload document error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const getDocumentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findOne({
      _id: subjectId,
      userId: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found"
      });
    }

    const documents = await Document.find({
      subjectId
    }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      documents
    });
  } catch (error) {
    console.error(
      "Get documents error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(
      req.params.id
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    const subject = await Subject.findOne({
      _id: document.subjectId,
      userId: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    return res.status(200).json({
      document
    });
  } catch (error) {
    console.error(
      "Get document error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(
      req.params.id
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    const subject = await Subject.findOne({
      _id: document.subjectId,
      userId: req.user.userId
    });

    if (!subject) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    await deleteFile(document.storagePath);

    await Document.findByIdAndDelete(document._id);

    return res.status(200).json({
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error(
      "Delete document error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};