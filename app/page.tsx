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
  const { user, logout, getToken } = useAuth();
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

    const token = await getToken();
    const res = await fetch("/api/analyze", {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    <main className="min-h-screen bg-slate-900">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-slate-800 max-w-6xl mx-auto">
        <span className="text-white font-bold text-lg tracking-tight">Screen My Resume</span>
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
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        {/* Hero */}
        <div className="text-center py-16 pb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            AI-Powered · Free to Use
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
            Know exactly why your resume<br className="hidden md:block" /> isn&apos;t getting callbacks
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Paste any job description. Get an instant score, ATS compatibility check, keyword gaps, and a rewritten resume — tailored to the role. Free.
          </p>
          <a
            href="#upload-form"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Score My Resume — it&apos;s free
          </a>
        </div>

        {/* Stats bar */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl grid grid-cols-3 divide-x divide-slate-700 mb-12">
          {[
            { label: "Any Role", sub: "works for any industry & level" },
            { label: "ATS Compatible Output", sub: "optimized for applicant tracking" },
            { label: "Instant Results", sub: "analysis in under 30 seconds" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center">
              <div className="text-white font-bold text-sm md:text-base">{stat.label}</div>
              <div className="text-slate-500 text-xs mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-12">
          <h2 className="text-center text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Upload Resume", desc: "Drop your PDF, we extract the text securely — nothing is stored." },
              { step: "2", title: "Paste Job Description", desc: "Any role, any industry, any level. The more detail, the better the match." },
              { step: "3", title: "Get Your Score", desc: "ATS score, keyword gaps, strengths, and actionable fixes — instantly." },
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

        {/* Free vs Signed In */}
        <div className="mb-12">
          <h2 className="text-center text-slate-400 text-sm font-semibold uppercase tracking-wider mb-6">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white text-sm mb-4">Free (no account)</h3>
              <ul className="space-y-2.5">
                {[
                  "Match score & grade",
                  "Keyword gap analysis",
                  "Strengths & gaps breakdown",
                  "ATS compatibility check",
                  "Extracted profile view",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Signed in */}
            <div className="bg-slate-800/40 border border-blue-500/50 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-4">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Free sign-up</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-4">Free account (sign up)</h3>
              <ul className="space-y-2.5">
                {[
                  "Everything above",
                  "Download full PDF report",
                  "AI-generated ATS-friendly resume",
                  "Resume rewritten with missing keywords",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {!user && (
                <button
                  onClick={() => setShowAuth(true)}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Create free account
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upload form */}
        <div id="upload-form" className="scroll-mt-6">
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
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-800 py-8 text-center">
          <p className="text-slate-500 text-sm">
            Built by{" "}
            <a
              href="https://fieldnoteswithabhinav.beehiiv.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Abhinav Sharma, Microsoft MVP
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
