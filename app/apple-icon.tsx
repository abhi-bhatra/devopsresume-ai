import { ImageResponse } from "next/og";
import { CheckmarkBadge } from "./_brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <CheckmarkBadge size={180} radius={40} />
      </div>
    ),
    { ...size }
  );
}
