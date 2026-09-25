import Document from "../models/Document.js";
import Chunk from "../models/Chunk.js";

import { downloadFile } from "./storageService.js";
import { extractPdfText } from "./pdfService.js";
import { cleanText } from "./textService.js";
import { createChunks } from "./chunkService.js";
import { generateEmbedding } from "./embeddingService.js";

export const ingestDocument = async (documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  try {
    document.status = "processing";
    await document.save();

    const pdfBuffer = await downloadFile(document.storagePath);

    const result = await extractPdfText(pdfBuffer);

    const pages = result.pages.map((page) => ({
      ...page,
      text: cleanText(page.text)
    }));

    const chunks = createChunks(pages);

    if (chunks.length === 0) {
      throw new Error("No readable text found in PDF");
    }

    const chunkDocuments = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.text);

      chunkDocuments.push({
        documentId: document._id,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        embedding
      });
    }

    await Chunk.deleteMany({
      documentId: document._id
    });

    await Chunk.insertMany(chunkDocuments);

    document.status = "ready";
    await document.save();

    return {
      documentId: document._id,
      pageCount: pages.length,
      chunkCount: chunkDocuments.length,
      status: document.status
    };
  } catch (error) {
    document.status = "failed";
    await document.save();

    throw error;
  }
};