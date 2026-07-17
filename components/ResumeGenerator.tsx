"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnalysisResult } from "@/lib/azure-openai";

interface ResumeGeneratorProps {
  result: AnalysisResult;
}

type Mode = "preview" | "edit";

export default function ResumeGenerator({ result }: ResumeGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("preview");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResume(null);

    const res = await fetch("/api/generate-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText: result.resumeText,
        jobDescription: result.jobDescription,
        gaps: result.gaps,
        missingKeywords: result.missingKeywords,
      }),
    });

    const data = await res.json();
    setGenerating(false);

    if (!res.ok) {
      setError(data.error ?? "Generation failed. Please try again.");
      return;
    }

    setResume(data.resume);
    setMode("preview");
  }

  function handleCopy() {
    if (!resume) return;
    navigator.clipboard.writeText(resume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  if (!resume) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-8 text-center space-y-5">
        <div>
          <h3 className="text-white font-semibold text-lg mb-2">Generate ATS-Friendly Resume</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            AI rewrites your resume using the job description — adding missing keywords, fixing gaps,
            and formatting it to pass ATS scanners. Then edit it and download as PDF.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {[
            "Missing keywords added",
            "Single column ATS layout",
            "Edit before downloading",
            "Download as PDF",
          ].map((f) => (
            <span key={f} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">
              {f}
            </span>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Generating...
            </span>
          ) : "Generate Resume"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-white font-semibold">ATS-Friendly Resume</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Edit if needed, then download as PDF
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit / Preview toggle */}
          <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setMode("preview")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === "preview" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                mode === "edit" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Edit
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy markdown"}
          </button>

          <button
            onClick={handlePrint}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Download PDF
          </button>

          <button
            onClick={() => { setResume(null); setError(null); }}
            className="text-xs border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Regenerate
          </button>
        </div>
      </div>

      {/* Edit mode */}
      {mode === "edit" && (
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          className="w-full h-[600px] bg-slate-800 border border-slate-700 rounded-xl p-5 text-slate-200 text-sm font-mono leading-relaxed focus:outline-none focus:border-blue-500 resize-none"
        />
      )}

      {/* Preview mode — also the print target */}
      {mode === "preview" && (
        <div
          id="resume-print"
          className="bg-white rounded-xl p-8 md:p-12 max-h-[700px] overflow-y-auto"
        >
          <div className="prose prose-slate max-w-none
            prose-h1:text-2xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:border-b prose-h1:border-gray-300 prose-h1:pb-2 prose-h1:mb-3
            prose-h2:text-sm prose-h2:font-bold prose-h2:text-gray-700 prose-h2:uppercase prose-h2:tracking-wider prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-1 prose-h2:mt-5 prose-h2:mb-2
            prose-h3:text-sm prose-h3:font-semibold prose-h3:text-gray-800 prose-h3:mt-3 prose-h3:mb-0.5
            prose-p:text-gray-700 prose-p:text-sm prose-p:leading-relaxed prose-p:my-1
            prose-ul:my-1 prose-ul:pl-4
            prose-li:text-gray-700 prose-li:text-sm prose-li:my-0.5
            prose-strong:font-semibold prose-strong:text-gray-900
            prose-em:text-gray-500 prose-em:text-xs
            prose-hr:border-gray-200 prose-hr:my-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {resume}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <p className="text-slate-600 text-xs text-center">
        AI-generated — review and fact-check before submitting to employers.
      </p>
    </div>
  );
}
