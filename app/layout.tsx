import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Screen My Resume — Free AI Resume Screener",
  description: "Upload your resume, paste any job description, and get an instant ATS score, keyword gap analysis, strengths, gaps, and actionable recommendations. Free. Works for any role.",
  keywords: ["resume screener", "ATS checker", "resume score", "ATS score", "resume analyzer", "job application", "resume keywords", "ATS friendly resume"],
  metadataBase: new URL("https://www.screenmyresume.site"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Screen My Resume — Free AI Resume Screener",
    description: "Get your resume scored against any job description in seconds. ATS compatibility check, keyword gap analysis, and actionable fixes.",
    url: "https://www.screenmyresume.site",
    siteName: "Screen My Resume",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Screen My Resume — Free AI Resume Screener",
    description: "Upload your resume, paste a JD, get an instant ATS score and gap analysis. Free.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "Screen My Resume",
                "url": "https://www.screenmyresume.site",
                "description": "Free AI-powered resume screener. Upload your resume, paste a job description, get ATS score, keyword gaps, and resume rewriting.",
                "applicationCategory": "BusinessApplication",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                "operatingSystem": "Web",
              }),
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
