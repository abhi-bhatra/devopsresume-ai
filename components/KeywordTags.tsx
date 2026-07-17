"use client";

interface KeywordTagsProps {
  matched: string[];
  missing: string[];
}

export default function KeywordTags({ matched, missing }: KeywordTagsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
          Matched Keywords
        </h4>
        <div className="flex flex-wrap gap-2">
          {matched.map((kw) => (
            <span
              key={kw}
              className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium"
            >
              {kw}
            </span>
          ))}
          {matched.length === 0 && (
            <span className="text-slate-500 text-sm">None found</span>
          )}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
          Missing Keywords
        </h4>
        <div className="flex flex-wrap gap-2">
          {missing.map((kw) => (
            <span
              key={kw}
              className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs font-medium"
            >
              {kw}
            </span>
          ))}
          {missing.length === 0 && (
            <span className="text-slate-500 text-sm">Nothing missing</span>
          )}
        </div>
      </div>
    </div>
  );
}
