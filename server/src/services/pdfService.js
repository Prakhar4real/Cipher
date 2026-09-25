import { PDFParse } from "pdf-parse";

export const extractPdfText = async (pdfBuffer) => {
  const parser = new PDFParse({
    data: pdfBuffer
  });

  try {
    const result = await parser.getText();

    const pages = result.pages.map((page) => ({
      pageNumber: page.num,
      text: page.text
    }));

    return {
      pageCount: result.total,
      pages
    };
  } finally {
    await parser.destroy();
  }
};