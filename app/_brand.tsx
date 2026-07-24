// Shared brand constants for icon/opengraph-image routes.
// Prefixed with `_` so Next.js does not treat this as a route file.

export const BRAND = {
  gradientFrom: "#2563eb", // blue-600
  gradientTo: "#10b981", // emerald-500
  bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", // slate-900 -> slate-800
  accentBlue: "#60a5fa",
  accentEmerald: "#34d399",
  slateBorder: "#334155",
  slateText: "#94a3b8",
  slateFooter: "#64748b",
};

export function CheckmarkBadge({ size, radius }: { size: number; radius: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${BRAND.gradientFrom} 0%, ${BRAND.gradientTo} 100%)`,
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path
          d="M4 12.5L9.5 18L20 6"
          stroke="white"
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
