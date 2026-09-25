import Chunk from "../models/Chunk.js";
import Subject from "../models/Subject.js";
import Document from "../models/Document.js";

const VECTOR_INDEX_NAME = "vector_index";

export const searchSimilarChunks = async (
  queryEmbedding,
  userId,
  limit = 5
) => {
  const subjects = await Subject.find({
    userId
  }).select("_id");

  const subjectIds = subjects.map((subject) => subject._id);

  const documents = await Document.find({
    subjectId: { $in: subjectIds }
  }).select("_id");

  const documentIds = documents.map((document) => document._id);

  if (documentIds.length === 0) {
    return [];
  }

  const numCandidates = Math.max(limit * 10, 50);

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates,
        limit,
        filter: {
          documentId: {
            $in: documentIds
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        documentId: 1,
        pageNumber: 1,
        chunkIndex: 1,
        text: 1,
        score: {
          $meta: "vectorSearchScore"
        }
      }
    }
  ]);

  return results;
};