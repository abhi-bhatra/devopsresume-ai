import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { analyzeResume } from "@/lib/azure-openai";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const jobDescription = formData.get("jd") as string | null;

    if (!file || !jobDescription) {
      return NextResponse.json(
        { error: "Resume file and job description are required." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = await extractTextFromPDF(buffer);

    if (resumeText.length < 100) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. Try a text-based PDF." },
        { status: 422 }
      );
    }

    const result = await analyzeResume(resumeText, jobDescription.trim());
    return NextResponse.json({ ...result, resumeText, jobDescription: jobDescription.trim() });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
