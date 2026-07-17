"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { AnalysisResult } from "@/lib/azure-openai";
import ScoreGauge from "./ScoreGauge";
import SectionScores from "./SectionScores";
import KeywordTags from "./KeywordTags";
import ProfilePanel from "./ProfilePanel";
import { downloadResultsAsPDF } from "@/lib/download-pdf";
import ResumeGenerator from "./ResumeGenerator";

interface ResultsPanelProps {
  result: AnalysisResult;
  user: User | null;
  onSignIn: () => void;
  onReset: () => void;
}

function ListSection({
  title,
  items,
  color,
  icon,
}: {
  title: string;
  items: string[];
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700">
      <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${color}`}>
        {icon} {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-300">
            <span className="mt-0.5 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Tab = "score" | "ats" | "generate";

// Google/GitHub users are always verified; email/password users must verify
function isVerified(user: User | null): boolean {
  if (!user) return false;
  const isEmailProvider = user.providerData.some(p => p.providerId === "password");
  return isEmailProvider ? user.emailVerified : true;
}

export default function ResultsPanel({ result, user, onSignIn, onReset }: ResultsPanelProps) {
  const [tab, setTab] = useState<Tab>("score");
  const [downloading, setDownloading] = useState(false);

  const verified = isVerified(user);

  async function handleDownload() {
    setDownloading(true);
    await downloadResultsAsPDF(result);
    setDownloading(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
        <button
          onClick={onReset}
          className="text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          Analyze another
        </button>
      </div>

      {/* Premium features — always visible */}
      {user && !verified && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-yellow-400 text-lg shrink-0">✉</span>
          <div>
            <p className="text-yellow-300 text-sm font-medium">Verify your email to unlock premium features</p>
            <p className="text-yellow-500 text-xs mt-0.5">Check your inbox for a verification link from Firebase.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <button
          onClick={verified ? handleDownload : onSignIn}
          disabled={downloading}
          className={`relative rounded-xl p-4 text-left border transition-all ${
            verified
              ? "bg-slate-800/60 hover:bg-slate-700/60 border-slate-700 hover:border-blue-500/50"
              : "bg-slate-800/40 border-slate-700 hover:border-blue-500/40"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {!verified && (
            <span className="absolute top-3 right-3 text-slate-500 text-xs bg-slate-700 px-2 py-0.5 rounded-full">
              🔒 Free sign-in
            </span>
          )}
          <p className="text-white font-semibold text-sm mb-1">
            {downloading ? "Generating PDF..." : "Download PDF Report"}
          </p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Save your full analysis — score, keywords, gaps, and ATS breakdown — as a shareable PDF.
          </p>
        </button>

        <button
          onClick={verified ? () => setTab("generate") : onSignIn}
          className={`relative rounded-xl p-4 text-left border transition-all ${
            verified
              ? "bg-slate-800/60 hover:bg-slate-700/60 border-slate-700 hover:border-blue-500/50"
              : "bg-slate-800/40 border-slate-700 hover:border-blue-500/40"
          }`}
        >
          {!verified && (
            <span className="absolute top-3 right-3 text-slate-500 text-xs bg-slate-700 px-2 py-0.5 rounded-full">
              🔒 Free sign-in
            </span>
          )}
          <p className="text-white font-semibold text-sm mb-1">Generate ATS-Friendly Resume</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            AI rewrites your resume to fix gaps, add missing keywords, and pass ATS filters.
          </p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("score")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "score" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Match Score
        </button>
        <button
          onClick={() => setTab("ats")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "ats" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          What ATS Sees
          {result.profile?.atsScore !== undefined && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              result.profile.atsScore >= 80 ? "bg-emerald-500/30 text-emerald-300" :
              result.profile.atsScore >= 60 ? "bg-yellow-500/30 text-yellow-300" :
              "bg-red-500/30 text-red-300"
            }`}>
              {result.profile.atsScore}
            </span>
          )}
        </button>
        {verified && (
          <button
            onClick={() => setTab("generate")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "generate" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            ATS Resume
          </button>
        )}
      </div>

      {/* Captured content */}
      <div id="results-capture" className="space-y-6 bg-slate-900 p-2 rounded-xl">
        {tab === "score" && (
          <>
            {/* Score + Summary */}
            <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="shrink-0">
                <ScoreGauge
                  score={result.overallScore}
                  grade={result.grade}
                  rolefit={result.rolefit}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Summary
                </h3>
                <p className="text-slate-200 leading-relaxed">{result.summary}</p>
                <div className="mt-4">
                  <SectionScores scores={result.sectionScores} />
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700">
              <KeywordTags
                matched={result.matchedKeywords}
                missing={result.missingKeywords}
              />
            </div>

            {/* Strengths / Gaps / Recommendations */}
            <div className="grid md:grid-cols-3 gap-4">
              <ListSection title="Strengths" items={result.strengths} color="text-emerald-400" icon="+" />
              <ListSection title="Gaps" items={result.gaps} color="text-red-400" icon="!" />
              <ListSection title="Recommendations" items={result.recommendations} color="text-blue-400" icon=">" />
            </div>
          </>
        )}

        {tab === "ats" && result.profile && (
          <ProfilePanel profile={result.profile} />
        )}

        {tab === "generate" && verified && (
          <ResumeGenerator result={result} />
        )}
      </div>


      {/* Newsletter CTA */}
      <div className="text-center">
        <a
          href="https://fieldnoteswithabhinav.beehiiv.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-300 text-xs underline underline-offset-2 transition-colors"
        >
          Subscribe to Field Notes With Abhinav for career insights →
        </a>
      </div>
    </div>
  );
}
