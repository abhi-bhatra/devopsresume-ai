import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/azure-openai";

export const maxDuration = 60;

const PROMPT = `You are an expert resume writer and ATS optimization specialist.

Rewrite the resume below to be fully ATS-friendly and tailored to the job description. Follow these strict rules:

RULES:
- Single column layout only — no tables, no text boxes, no columns
- Use plain section headers: Summary, Experience, Skills, Education, Certifications
- Add missing keywords from the job description naturally into the content
- Quantify achievements where the original has unquantified results (use reasonable estimates if needed)
- Keep ALL factual information accurate — do not invent jobs, companies, degrees, or skills not in the original
- Remove decorative elements, icons, or special characters that ATS cannot parse
- Use standard date format: "Month Year – Month Year" or "Month Year – Present"
- List skills in a dedicated Skills section as comma-separated values
- Output clean markdown that can be copied directly

JOB DESCRIPTION:
{jd}

ORIGINAL RESUME:
{resume}

GAPS TO FIX:
{gaps}

MISSING KEYWORDS TO ADD:
{keywords}

Output the rewritten resume in clean markdown. Start directly with the candidate's name as a heading.`;

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, gaps, missingKeywords } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Missing resume or job description." }, { status: 400 });
    }

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-5-1",
      messages: [
        {
          role: "user",
          content: PROMPT
            .replace("{jd}", jobDescription)
            .replace("{resume}", resumeText)
            .replace("{gaps}", (gaps as string[]).join("\n"))
            .replace("{keywords}", (missingKeywords as string[]).join(", ")),
        },
      ],
      max_completion_tokens: 3000,
      temperature: 0.4,
    });

    const generated = response.choices[0].message.content ?? "";
    return NextResponse.json({ resume: generated });
  } catch (err) {
    console.error("Resume generation error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
