import ai from "../config/gemini.js";

const GENERATION_MODEL = "gemini-3.8-flash";

export const generateAnswer = async (question, sources) => {
  const sourceContext = sources
    .map(
      (source, index) => `
SOURCE ${index + 1}
Document: ${source.documentName}
Page: ${source.pageNumber}
Chunk: ${source.chunkIndex}

${source.text}
`
    )
    .join("\n");

  const prompt = `
You are the study assistant for Cipher.

Answer the user's question using ONLY the provided sources.

Rules:
1. Use only information contained in the provided sources.
2. Do not use outside knowledge.
3. Do not invent facts.
4. Do not invent citations or page numbers.
5. If the provided sources do not contain enough information to answer the question, clearly say that the provided sources do not contain enough information.
6. Give a concise and useful answer.

PROVIDED SOURCES:
${sourceContext}

USER QUESTION:
${question}
`;

  const response = await ai.models.generateContent({
    model: GENERATION_MODEL,
    contents: prompt
  });

  return {
    answer: response.text,
    hasAnswer: !response.text
      .toLowerCase()
      .includes("do not contain enough information")
  };
};