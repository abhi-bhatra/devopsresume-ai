// Shared social preview card, rendered by both opengraph-image.tsx and
// twitter-image.tsx via next/og's ImageResponse. Not a route file (`_` prefix).

import { BRAND, CheckmarkBadge } from "./_brand";

const KEYWORDS = ["Kubernetes", "Terraform", "AWS", "CI/CD", "Python"];
const SCORE = 92;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SocialCard() {
  const offset = CIRCUMFERENCE * (1 - SCORE / 100);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BRAND.bg,
        padding: "64px 72px",
      }}
    >
      {/* Brand row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <CheckmarkBadge size={56} radius={14} />
        <span style={{ color: "white", fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>
          Screen My Resume
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.35)",
            color: BRAND.accentBlue,
            fontSize: 16,
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: 999,
          }}
        >
          AI-Powered · Free
        </div>
      </div>

      {/* Main content row */}
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 56, fontWeight: 900, color: "white", lineHeight: 1.08, letterSpacing: -1.5, display: "flex" }}>
            Know why your resume isn&apos;t getting callbacks
          </div>
          <div style={{ fontSize: 22, color: BRAND.slateText, marginTop: 20, lineHeight: 1.4, display: "flex" }}>
            Instant ATS score, keyword gap analysis &amp; a rewritten resume — free.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
            {KEYWORDS.map((k) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  background: "rgba(52,211,153,0.12)",
                  border: "1px solid rgba(52,211,153,0.35)",
                  color: BRAND.accentEmerald,
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                {k}
              </div>
            ))}
          </div>
        </div>

        {/* Score gauge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", width: 220, height: 220 }}>
          <svg width={220} height={220} viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={RADIUS} stroke={BRAND.slateBorder} strokeWidth="14" fill="none" />
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              stroke={BRAND.accentEmerald}
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={`${offset}`}
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "white", display: "flex" }}>{SCORE}</div>
            <div style={{ fontSize: 16, color: BRAND.slateText, fontWeight: 600, display: "flex" }}>ATS Score</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", color: BRAND.slateFooter, fontSize: 18 }}>
        <span>screenmyresume.site</span>
        <span>Free · No credit card required</span>
      </div>
    </div>
  );
}
