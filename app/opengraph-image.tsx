import { ImageResponse } from "next/og";
import { SocialCard } from "./_social-card";

export const alt = "Screen My Resume — Free AI Resume Screener";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<SocialCard />, { ...size });
}
