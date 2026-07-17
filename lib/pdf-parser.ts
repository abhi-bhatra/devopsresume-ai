// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse");

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText() as { text: string };
  return result.text.trim();
}
