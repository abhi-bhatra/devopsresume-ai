import jsPDF from "jspdf";
import { AnalysisResult } from "./azure-openai";

type RGB = [number, number, number];

const DARK: RGB = [15, 23, 42];
const CARD: RGB = [30, 41, 59];
const WHITE: RGB = [241, 245, 249];
const MUTED: RGB = [100, 116, 139];
const BLUE: RGB = [59, 130, 246];
const GREEN: RGB = [16, 185, 129];
const RED: RGB = [239, 68, 68];
const YELLOW: RGB = [234, 179, 8];
const AMBER: RGB = [245, 158, 11];

function scoreColor(score: number): RGB {
  if (score >= 80) return GREEN;
  if (score >= 60) return YELLOW;
  if (score >= 40) return [249, 115, 22];
  return RED;
}

function wrap(pdf: jsPDF, text: string, x: number, maxWidth: number, lineHeight: number): number {
  const lines = pdf.splitTextToSize(text, maxWidth);
  pdf.text(lines, x, 0);
  return lines.length * lineHeight;
}

export async function downloadResultsAsPDF(result: AnalysisResult) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 14;
  const contentW = W - margin * 2;
  let y = 0;

  function newPage() {
    pdf.addPage();
    y = 14;
    pdf.setFillColor(...DARK);
    pdf.rect(0, 0, 210, 297, "F");
  }

  function checkY(needed: number) {
    if (y + needed > 280) newPage();
  }

  function sectionTitle(label: string) {
    checkY(10);
    pdf.setFontSize(7);
    pdf.setTextColor(...MUTED);
    pdf.setFont("helvetica", "bold");
    pdf.text(label.toUpperCase(), margin, y);
    y += 6;
  }

  function card(height: number, drawFn: () => void) {
    checkY(height + 4);
    pdf.setFillColor(...CARD);
    pdf.roundedRect(margin, y, contentW, height, 2, 2, "F");
    const savedY = y;
    y += 5;
    drawFn();
    y = savedY + height + 4;
  }

  function tag(text: string, x: number, tagY: number, color: number[]) {
    pdf.setFontSize(6.5);
    const tw = pdf.getTextWidth(text) + 4;
    pdf.setFillColor(color[0], color[1], color[2], 0.2);
    pdf.roundedRect(x, tagY - 3.5, tw, 5, 1, 1, "F");
    pdf.setTextColor(...color as [number, number, number]);
    pdf.text(text, x + 2, tagY);
    return tw + 2;
  }

  // ── Page 1 background ──────────────────────────────────────────────
  pdf.setFillColor(...DARK);
  pdf.rect(0, 0, 210, 297, "F");
  y = 14;

  // Header bar
  pdf.setFillColor(...BLUE);
  pdf.rect(0, 0, 210, 10, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.text("screenmyresume.site", margin, 6.5);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Generated ${new Date().toLocaleDateString()}`, W - margin, 6.5, { align: "right" });
  y = 18;

  // Title
  pdf.setFontSize(18);
  pdf.setTextColor(...WHITE);
  pdf.setFont("helvetica", "bold");
  pdf.text("Resume Analysis Report", margin, y);
  y += 12;

  // ── Score card ────────────────────────────────────────────────────
  const col = scoreColor(result.overallScore);
  card(36, () => {
    // Score circle
    pdf.setDrawColor(...col);
    pdf.setLineWidth(1.5);
    pdf.circle(margin + 16, y + 8, 10, "S");
    pdf.setFontSize(14);
    pdf.setTextColor(...col);
    pdf.setFont("helvetica", "bold");
    pdf.text(String(result.overallScore), margin + 16, y + 9.5, { align: "center" });
    pdf.setFontSize(6);
    pdf.setTextColor(...MUTED);
    pdf.text("/100", margin + 16, y + 14, { align: "center" });

    // Grade + fit
    pdf.setFontSize(22);
    pdf.setTextColor(...col);
    pdf.text(result.grade, margin + 34, y + 11);

    pdf.setFontSize(8);
    pdf.setTextColor(...WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.text(result.rolefit, margin + 46, y + 7);

    // Summary
    pdf.setFontSize(7.5);
    pdf.setTextColor(...WHITE);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(result.summary, contentW - 60);
    pdf.text(lines, margin + 46, y + 13);
  });

  // ── Section scores ────────────────────────────────────────────────
  sectionTitle("Section Scores");
  const scoreEntries = [
    ["Technical Skills", result.sectionScores.skills],
    ["Experience Match", result.sectionScores.experience],
    ["Keyword Density", result.sectionScores.keywords],
    ["Resume Format", result.sectionScores.format],
  ] as const;

  card(scoreEntries.length * 9 + 6, () => {
    scoreEntries.forEach(([label, val]) => {
      pdf.setFontSize(7.5);
      pdf.setTextColor(...WHITE);
      pdf.setFont("helvetica", "normal");
      pdf.text(label, margin + 3, y);
      pdf.setTextColor(...scoreColor(val));
      pdf.text(String(val), W - margin - 3, y, { align: "right" });

      const barW = contentW - 6;
      pdf.setFillColor(51, 65, 85);
      pdf.roundedRect(margin + 3, y + 1.5, barW, 2.5, 1, 1, "F");
      pdf.setFillColor(...scoreColor(val));
      pdf.roundedRect(margin + 3, y + 1.5, barW * (val / 100), 2.5, 1, 1, "F");
      y += 9;
    });
  });

  // ── Keywords ──────────────────────────────────────────────────────
  sectionTitle("Keywords");
  card(28, () => {
    pdf.setFontSize(7);
    pdf.setTextColor(...GREEN);
    pdf.setFont("helvetica", "bold");
    pdf.text("MATCHED", margin + 3, y);
    y += 5;
    let kx = margin + 3;
    result.matchedKeywords.forEach((kw) => {
      if (kx + pdf.getTextWidth(kw) + 8 > W - margin) { kx = margin + 3; y += 6; }
      kx += tag(kw, kx, y, [16, 185, 129]);
    });
    y += 7;
    pdf.setTextColor(...RED);
    pdf.setFont("helvetica", "bold");
    pdf.text("MISSING", margin + 3, y);
    y += 5;
    kx = margin + 3;
    result.missingKeywords.forEach((kw) => {
      if (kx + pdf.getTextWidth(kw) + 8 > W - margin) { kx = margin + 3; y += 6; }
      kx += tag(kw, kx, y, [239, 68, 68]);
    });
  });

  // ── Three columns: Strengths / Gaps / Recs ────────────────────────
  checkY(60);
  const colW = (contentW - 6) / 3;
  const sections = [
    { label: "Strengths", items: result.strengths, color: GREEN, icon: "+" },
    { label: "Gaps", items: result.gaps, color: RED, icon: "!" },
    { label: "Recommendations", items: result.recommendations, color: BLUE, icon: ">" },
  ];

  const startY = y;
  let maxH = 0;
  sections.forEach((sec, i) => {
    const cx = margin + i * (colW + 3);
    let cy = startY + 5;
    pdf.setFillColor(...CARD);
    pdf.roundedRect(cx, startY, colW, 55, 2, 2, "F");
    pdf.setFontSize(7);
    pdf.setTextColor(...sec.color as [number, number, number]);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${sec.icon} ${sec.label.toUpperCase()}`, cx + 3, cy);
    cy += 5;
    sec.items.forEach((item) => {
      pdf.setFontSize(6.5);
      pdf.setTextColor(...WHITE);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(`• ${item}`, colW - 6);
      pdf.text(lines, cx + 3, cy);
      cy += lines.length * 4 + 1.5;
    });
    maxH = Math.max(maxH, cy - startY);
  });
  y = startY + 58;

  // ── Page 2: ATS Profile ───────────────────────────────────────────
  if (result.profile) {
    newPage();
    pdf.setFontSize(14);
    pdf.setTextColor(...WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.text("What ATS Sees", margin, y);
    y += 10;

    const p = result.profile;

    // ATS Score
    sectionTitle("ATS Compatibility");
    const atsCol = scoreColor(p.atsScore);
    card(p.atsIssues.length * 6 + 18, () => {
      pdf.setFontSize(20);
      pdf.setTextColor(...atsCol);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(p.atsScore), margin + 3, y + 8);
      pdf.setFontSize(7);
      pdf.setTextColor(...MUTED);
      pdf.text("/100 ATS Score", margin + 14, y + 8);
      y += 12;
      p.atsIssues.forEach((issue) => {
        pdf.setFontSize(7);
        pdf.setTextColor(...RED);
        pdf.text(`! ${issue}`, margin + 3, y);
        y += 6;
      });
      if (p.atsIssues.length === 0) {
        pdf.setTextColor(...GREEN);
        pdf.text("No major ATS parsing issues detected.", margin + 3, y);
      }
    });

    // Contact info
    sectionTitle("Contact Information");
    card(22, () => {
      const fields = [
        ["Name", p.name], ["Email", p.email],
        ["Phone", p.phone], ["LinkedIn", p.linkedin],
      ];
      fields.forEach(([label, val], i) => {
        const cx = margin + 3 + (i % 2) * (contentW / 2);
        const cy = y + Math.floor(i / 2) * 9;
        pdf.setFontSize(6.5);
        pdf.setTextColor(...MUTED);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(label).toUpperCase(), cx, cy);
        pdf.setFont("helvetica", "normal");
        if (val) {
          pdf.setTextColor(...WHITE);
          pdf.text(String(val), cx, cy + 4);
        } else {
          pdf.setTextColor(...RED);
          pdf.text("Not found", cx, cy + 4);
        }
      });
    });

    // Experience
    if (p.experience.length > 0) {
      sectionTitle("Work Experience");
      card(p.experience.length * 10 + 6, () => {
        p.experience.forEach((job) => {
          pdf.setFontSize(7.5);
          pdf.setTextColor(...WHITE);
          pdf.setFont("helvetica", "bold");
          pdf.text(job.title, margin + 6, y);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(...MUTED);
          pdf.text(`${job.company}${job.duration ? "  ·  " + job.duration : ""}`, margin + 6, y + 4);
          pdf.setFillColor(...BLUE);
          pdf.circle(margin + 3, y - 0.5, 1, "F");
          y += 10;
        });
      });
    }

    // Education
    if (p.education.length > 0) {
      sectionTitle("Education");
      card(p.education.length * 10 + 6, () => {
        p.education.forEach((edu) => {
          pdf.setFontSize(7.5);
          pdf.setTextColor(...WHITE);
          pdf.setFont("helvetica", "bold");
          pdf.text(edu.degree, margin + 6, y);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(...MUTED);
          pdf.text(`${edu.institution}${edu.year ? "  ·  " + edu.year : ""}`, margin + 6, y + 4);
          pdf.setFillColor(168, 85, 247);
          pdf.circle(margin + 3, y - 0.5, 1, "F");
          y += 10;
        });
      });
    }

    // Skills
    if (p.skills.length > 0) {
      sectionTitle("Detected Skills");
      checkY(20);
      const skillStartY = y;
      pdf.setFillColor(...CARD);
      pdf.roundedRect(margin, skillStartY, contentW, 22, 2, 2, "F");
      y += 5;
      let sx = margin + 3;
      p.skills.forEach((skill) => {
        if (sx + pdf.getTextWidth(skill) + 8 > W - margin) { sx = margin + 3; y += 7; }
        sx += tag(skill, sx, y, [100, 116, 139]);
      });
      y = skillStartY + 24;
    }

    // Certifications
    if (p.certifications.length > 0) {
      sectionTitle("Certifications");
      checkY(20);
      const certStartY = y;
      pdf.setFillColor(...CARD);
      pdf.roundedRect(margin, certStartY, contentW, 16, 2, 2, "F");
      y += 5;
      let cx2 = margin + 3;
      p.certifications.forEach((cert) => {
        if (cx2 + pdf.getTextWidth(cert) + 8 > W - margin) { cx2 = margin + 3; y += 7; }
        cx2 += tag(cert, cx2, y, [245, 158, 11]);
      });
      y = certStartY + 18;
    }
  }

  // Footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(6.5);
    pdf.setTextColor(...MUTED);
    pdf.text(`Page ${i} of ${totalPages}  ·  screenmyresume.site`, W / 2, 292, { align: "center" });
  }

  pdf.save(`resume-report-${Date.now()}.pdf`);
}
