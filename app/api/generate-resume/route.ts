import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/azure-openai";
import { adminAuth } from "@/lib/firebase-admin";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const PROMPT = `You are an expert resume writer and ATS optimization specialist. Your ONLY goal is a tight, 1-page resume that passes ATS and impresses recruiters in 6 seconds.

HARD LENGTH LIMITS — violating any of these ruins the resume:
- SUMMARY: 2–3 sentences maximum (≤50 words). Tight, keyword-rich. No fluff.
- EXPERIENCE bullets: maximum 4 bullets per role. Each bullet MUST fit on one line (≤100 characters including the dash). No wrapping bullets.
- SKILLS: One comma-separated line of the 15–18 most relevant skills. No paragraphs.
- CERTIFICATIONS: List the 3 most relevant only. Skip student awards, ambassador programs, or anything not a professional credential.
- EDUCATION: 2 lines maximum (degree + institution). No CGPA unless explicitly required.
- DO NOT include sections like "Achievements", "Other Links", "Projects", or "Socials" — they waste space.
- Total output MUST fit on one A4 page when printed at 11pt font with 15mm margins.

ATS RULES:
- Single column layout — no tables, no columns, no text boxes
- Section headers: Summary, Experience, Skills, Education, Certifications
- Standard dates: "Mon YYYY – Mon YYYY" or "Mon YYYY – Present"
- Add missing keywords naturally into bullets and summary
- Quantify every achievement with a number/percentage (use reasonable estimates if original is vague)
- Keep ALL facts accurate — never invent jobs, degrees, or skills

BULLET FORMAT — each bullet must follow: "Action verb + what you did + measurable result"
Example: "Reduced deployment time 60% by automating CI/CD pipelines across 3 product teams."
BAD (too long): "Architected and optimized CI/CD pipelines using GitHub, GitLab, Jenkins, and Azure DevOps, reducing deployment time by approximately 60% and improving release frequency across multiple product teams."
GOOD: "Cut deployment time 60% by building CI/CD pipelines across GitHub Actions, GitLab, and Jenkins."

JOB DESCRIPTION:
{jd}

ORIGINAL RESUME:
{resume}

GAPS TO FIX:
{gaps}

MISSING KEYWORDS TO ADD:
{keywords}

Output ONLY the rewritten resume in clean markdown. Start with the candidate's name as # heading. No preamble, no explanation.`;

export async function POST(req: NextRequest) {
  try {
    // Auth required — no anonymous access
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Sign in to generate a resume." }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await adminAuth().verifyIdToken(authHeader.slice(7));
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const { allowed } = await checkRateLimit(`user_${uid}`, "resumes", 5);
    if (!allowed) {
      return NextResponse.json(
        { error: "Resume generation limit reached (5/day). Try again tomorrow." },
        { status: 429 }
      );
    }

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
      max_completion_tokens: 1200,
      temperature: 0.3,
    });

    const generated = response.choices[0].message.content ?? "";
    return NextResponse.json({ resume: generated });
  } catch (err) {
    console.error("Resume generation error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
