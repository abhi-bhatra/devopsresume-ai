"use client";

interface SectionScoresProps {
  scores: {
    skills: number;
    experience: number;
    keywords: number;
    format: number;
  };
}

function barColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

const labels: Record<string, string> = {
  skills: "Technical Skills",
  experience: "Experience Match",
  keywords: "Keyword Density",
  format: "Resume Format",
};

export default function SectionScores({ scores }: SectionScoresProps) {
  return (
    <div className="space-y-3">
      {Object.entries(scores).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">{labels[key] ?? key}</span>
            <span className="font-semibold text-white">{value}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${barColor(value)}`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
