"use client";

import { useState, useRef, DragEvent } from "react";
import { AnalysisResult } from "@/lib/azure-openai";
import ResultsPanel from "@/components/ResultsPanel";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";

const EXAMPLE_JD = `We are looking for a Senior Product Manager to join our growing team.

Requirements:
- 5+ years of product management experience
- Proven track record of launching successful products
- Strong analytical skills and data-driven decision making
- Experience working with cross-functional teams (Engineering, Design, Marketing)
- Excellent written and verbal communication skills
- Familiarity with agile methodologies and product roadmap planning
- Experience with user research and A/B testing
- Background in SaaS products preferred`;

export default function Home() {
  const { user, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else setError("Only PDF files are supported.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !jd.trim()) return;

    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("resume", file);
    form.append("jd", jd);

    const res = await fetch("/api/analyze", { method: "POST", body: form });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Analysis failed. Please try again.");
      return;
    }

    setResult(data);
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-900 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <ResultsPanel
            result={result}
            user={user}
            onSignIn={() => setShowAuth(true)}
            onReset={() => { setResult(null); setFile(null); setJd(""); }}
          />
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-12">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <div className="max-w-3xl mx-auto">
        {/* Nav */}
        <div className="flex justify-end mb-6">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">{user.email ?? user.displayName}</span>
              <button
                onClick={() => logout()}
                className="text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            AI-Powered · Free to Use
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Screen My Resume
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Upload your resume, paste any job description — get an instant score,
            keyword gap analysis, and actionable recommendations. Works for any role.
          </p>
          <p className="text-slate-500 text-sm mt-3">
            Built by{" "}
            <a
              href="https://fieldnoteswithabhinav.beehiiv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Abhinav Sharma
            </a>
            , Microsoft MVP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PDF Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragging
                ? "border-blue-400 bg-blue-500/10"
                : file
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-slate-600 hover:border-slate-500 bg-slate-800/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div>
                <div className="text-emerald-400 text-3xl mb-2">✓</div>
                <p className="text-emerald-300 font-semibold">{file.name}</p>
                <p className="text-slate-500 text-sm mt-1">
                  {(file.size / 1024).toFixed(0)} KB · Click to change
                </p>
              </div>
            ) : (
              <div>
                <div className="text-slate-500 text-4xl mb-3">↑</div>
                <p className="text-slate-300 font-medium">
                  Drop your resume here or{" "}
                  <span className="text-blue-400">click to browse</span>
                </p>
                <p className="text-slate-500 text-sm mt-1">PDF only · Max 5MB</p>
              </div>
            )}
          </div>

          {/* JD Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Job Description
              </label>
              <button
                type="button"
                onClick={() => setJd(EXAMPLE_JD)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Load example JD
              </button>
            </div>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here — requirements, tech stack, responsibilities..."
              rows={10}
              className="w-full bg-slate-800/60 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <p className="text-slate-500 text-xs mt-1">
              {jd.length} characters · More detail = better analysis
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || !jd.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Analyzing with AI...
              </span>
            ) : (
              "Screen My Resume"
            )}
          </button>

          <p className="text-center text-slate-600 text-xs">
            Your resume is analyzed in memory and never stored.
          </p>
        </form>

        {/* How it works */}
        <div className="mt-16 border-t border-slate-800 pt-10">
          <h2 className="text-center text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Upload Resume", desc: "Drop your PDF resume. We extract text securely — nothing is stored." },
              { step: "2", title: "Paste JD", desc: "Add the job description. The more detail, the more accurate the match." },
              { step: "3", title: "Get Your Score", desc: "AI scores skills, experience, keywords, and format. See your gaps instantly." },
            ].map((s) => (
              <div key={s.step} className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{s.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
