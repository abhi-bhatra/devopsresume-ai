"use client";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  rolefit: string;
}

function gradeColor(grade: string): string {
  const map: Record<string, string> = {
    A: "text-emerald-400",
    B: "text-green-400",
    C: "text-yellow-400",
    D: "text-orange-400",
    F: "text-red-400",
  };
  return map[grade] ?? "text-slate-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function fitBadge(fit: string): string {
  const map: Record<string, string> = {
    "Strong Fit": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "Good Fit": "bg-green-500/20 text-green-300 border-green-500/30",
    "Partial Fit": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "Poor Fit": "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return map[fit] ?? "bg-slate-700 text-slate-300 border-slate-600";
}

export default function ScoreGauge({ score, grade, rolefit }: ScoreGaugeProps) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={score >= 80 ? "#10b981" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444"}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-4xl font-black ${gradeColor(grade)}`}>{grade}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${fitBadge(rolefit)}`}>
          {rolefit}
        </span>
      </div>
    </div>
  );
}
