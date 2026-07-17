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

const ANALYSIS_PROMPT = `You are an expert DevOps/SRE/Platform Engineering recruiter and technical hiring manager with 10+ years of experience.

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
  "matchedKeywords": [<up to 10 matched tech keywords>],
  "missingKeywords": [<up to 10 important missing keywords from JD>],
  "gaps": [<3-5 specific gap statements, e.g. "No Terraform experience mentioned">],
  "strengths": [<3-5 specific strength statements>],
  "recommendations": [<3-5 actionable improvement tips>],
  "summary": "<2-3 sentence overall assessment>",
  "rolefit": "<one of: Strong Fit | Good Fit | Partial Fit | Poor Fit>"
}

Be honest and specific. Focus on DevOps/SRE/Platform Engineering signals: Kubernetes, CI/CD, IaC, cloud providers, observability, incident management, SLOs.`;

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
