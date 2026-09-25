const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 200;

const splitText = (text) => {
  const chunks = [];

  let start = 0;

  while (start < text.length) {
    let end = start + CHUNK_SIZE;

    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }

    // 1. Prefer a paragraph boundary.
    let boundary = text.lastIndexOf("\n\n", end);

    // 2. If no paragraph boundary is available,
    //    prefer a sentence boundary.
    if (boundary <= start) {
      const sentenceBoundary = Math.max(
        text.lastIndexOf(". ", end),
        text.lastIndexOf("? ", end),
        text.lastIndexOf("! ", end)
      );

      if (sentenceBoundary > start) {
        boundary = sentenceBoundary + 1;
      }
    }

    // 3. If no sentence boundary is available,
    //    prefer a word boundary.
    if (boundary <= start) {
      const wordBoundary = text.lastIndexOf(" ", end);

      if (wordBoundary > start) {
        boundary = wordBoundary;
      }
    }

    // 4. Last resort: hard character boundary.
    if (boundary <= start) {
      boundary = end;
    }

    const chunk = text.slice(start, boundary).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = boundary - CHUNK_OVERLAP;

    if (start < 0) {
      start = 0;
    }
  }

  return chunks;
};

export const createChunks = (pages) => {
  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const pageChunks = splitText(page.text);

    for (const text of pageChunks) {
      chunks.push({
        pageNumber: page.pageNumber,
        chunkIndex,
        text
      });

      chunkIndex++;
    }
  }

  return chunks;
};