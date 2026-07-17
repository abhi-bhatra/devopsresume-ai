import { AzureOpenAI } from "openai";

export function getOpenAIClient() {
  return new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: "2024-08-01-preview",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-5-1",
  });
}

export interface AnalysisResult {
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  sectionScores: {
    skills: number;
    experience: number;
    keywords: number;
    format: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  gaps: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
  rolefit: string;
}

const ANALYSIS_PROMPT = `You are an expert recruiter and hiring manager with 10+ years of experience across all industries and job functions.

Analyze the resume against the job description below and return a structured JSON response.

RESUME:
{resume}

JOB DESCRIPTION:
{jd}

Return ONLY valid JSON matching this exact schema:
{
  "overallScore": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "sectionScores": {
    "skills": <0-100>,
    "experience": <0-100>,
    "keywords": <0-100>,
    "format": <0-100>
  },
  "matchedKeywords": [<up to 10 keywords from the resume that match the JD>],
  "missingKeywords": [<up to 10 important keywords from the JD missing in the resume>],
  "gaps": [<3-5 specific gap statements based on the JD requirements>],
  "strengths": [<3-5 specific strength statements based on the resume>],
  "recommendations": [<3-5 actionable tips to improve the resume for this role>],
  "summary": "<2-3 sentence overall assessment>",
  "rolefit": "<one of: Strong Fit | Good Fit | Partial Fit | Poor Fit>"
}

Be honest and specific. Tailor your analysis entirely to the role described in the job description — do not assume any particular industry or job function.`;

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-5-1",
    messages: [
      {
        role: "user",
        content: ANALYSIS_PROMPT.replace("{resume}", resumeText).replace(
          "{jd}",
          jobDescription
        ),
      },
    ],
    max_completion_tokens: 1500,
    temperature: 0.3,
  });

  const content = response.choices[0].message.content ?? "{}";
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as AnalysisResult;
}
