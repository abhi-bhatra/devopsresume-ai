import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Screen My Resume — AI Resume Screener for Any Role",
  description:
    "AI-powered resume screener. Upload your resume, paste a job description, and get an instant score, keyword gap analysis, and actionable recommendations.",
  openGraph: {
    title: "Screen My Resume — AI Resume Screener",
    description: "Score your resume against any job description in seconds",
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
      <body className={`${inter.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
