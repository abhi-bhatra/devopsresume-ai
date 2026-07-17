import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevOps Resume Screener — Score Your Resume Instantly",
  description:
    "AI-powered resume screener for DevOps engineers, SREs, and platform teams. Upload your resume, paste a JD, get an instant score and gap analysis.",
  openGraph: {
    title: "DevOps Resume Screener",
    description: "Score your DevOps resume in seconds with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
