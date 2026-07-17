import { AzureOpenAI } from "openai";

export function getOpenAIClient() {
  return new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: "2024-08-01-preview",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-5-1",
  });
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  yearsEstimate: number | null;
}

export interface Education {
  degree: string;
  institution: string;
  year: string | null;
}

export interface ExtractedProfile {
  name: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  skills: string[];
  certifications: string[];
  experience: WorkExperience[];
  education: Education[];
  totalYearsExperience: number | null;
  atsScore: number;
  atsIssues: string[];
}

export interface AnalysisResult {
  resumeText: string;
  jobDescription: string;
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
  profile: ExtractedProfile;
}

const ANALYSIS_PROMPT = `You are an expert recruiter and ATS system analyst with 10+ years of experience across all industries and job functions.

Analyze the resume against the job description below and return a single structured JSON response.

RESUME:
{resume}

JOB DESCRIPTION:
{jd}

Return ONLY valid JSON matching this exact schema:
{
  "overallScore": <0-100, how well this resume matches the JD>,
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
  "rolefit": "<one of: Strong Fit | Good Fit | Partial Fit | Poor Fit>",
  "profile": {
    "name": "<full name or null if not found>",
    "email": "<email address or null>",
    "phone": "<phone number or null>",
    "linkedin": "<linkedin URL or handle or null>",
    "skills": [<list of all technical and soft skills explicitly mentioned>],
    "certifications": [<list of certifications, licenses, or credentials>],
    "experience": [
      {
        "title": "<job title>",
        "company": "<company name>",
        "duration": "<e.g. Jan 2020 – Mar 2023>",
        "yearsEstimate": <numeric years in this role, or null>
      }
    ],
    "education": [
      {
        "degree": "<degree and field e.g. B.S. Computer Science>",
        "institution": "<university or school name>",
        "year": "<graduation year or null>"
      }
    ],
    "totalYearsExperience": <sum of all work experience years as a number, or null>,
    "atsScore": <0-100, how ATS-parseable is this resume — deduct points for: missing contact info, no clear section headers, skills buried in paragraphs, tables or columns that break parsing, missing dates, image-based content>,
    "atsIssues": [<list of specific ATS parsing problems found, e.g. "No email address found", "Skills not in a dedicated section", "Missing employment dates">]
  }
}

Be honest and specific. Tailor analysis entirely to the role in the JD.`;

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
    max_completion_tokens: 2500,
    temperature: 0.3,
  });

  const content = response.choices[0].message.content ?? "{}";
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as AnalysisResult;
}
