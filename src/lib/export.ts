import type { AnalysisResult } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportCsv(result: AnalysisResult) {
  const rows: string[][] = [];

  // Header
  rows.push(["Review Text", "Sentiment", "Confidence", "Score", "Aspects"]);

  // Predictions
  result.predictions.forEach((p) => {
    const aspects = p.aspects.map((a) => `${a.aspect}:${a.sentiment}`).join("; ");
    rows.push([
      `"${p.text.replace(/"/g, '""')}"`,
      p.sentiment,
      (p.confidence * 100).toFixed(1) + "%",
      String(p.score),
      aspects,
    ]);
  });

  // Summary section
  rows.push([]);
  rows.push(["--- Summary ---"]);
  rows.push(["Total Analyzed", String(result.totalAnalyzed)]);
  rows.push(["Average Confidence", (result.averageConfidence * 100).toFixed(1) + "%"]);
  rows.push(["Positive", String(result.distribution.positive)]);
  rows.push(["Negative", String(result.distribution.negative)]);
  rows.push(["Neutral", String(result.distribution.neutral)]);

  // Aspects
  if (result.aspectSummary.length > 0) {
    rows.push([]);
    rows.push(["--- Aspect Summary ---"]);
    rows.push(["Aspect", "Positive", "Negative", "Neutral", "Total"]);
    result.aspectSummary.forEach((a) => {
      rows.push([a.aspect, String(a.positive), String(a.negative), String(a.neutral), String(a.total)]);
    });
  }

  // Word frequencies
  if (result.wordFrequencies.length > 0) {
    rows.push([]);
    rows.push(["--- Top Keywords ---"]);
    rows.push(["Word", "Count"]);
    result.wordFrequencies.slice(0, 20).forEach((w) => {
      rows.push([w.word, String(w.count)]);
    });
  }

  const csv = rows.map((r) => r.join(",")).join("\n");
  download(csv, "sentiment-analysis-report.csv", "text/csv");
}

export function exportPdf(result: AnalysisResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Sentiment Analysis Report", pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 14;

  // Summary metrics
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y);
  y += 8;

  const total = result.distribution.positive + result.distribution.negative + result.distribution.neutral;
  const dominant =
    result.distribution.positive >= result.distribution.negative &&
    result.distribution.positive >= result.distribution.neutral
      ? "Positive"
      : result.distribution.negative >= result.distribution.positive &&
        result.distribution.negative >= result.distribution.neutral
      ? "Negative"
      : "Mixed";

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Reviews Analyzed", String(result.totalAnalyzed)],
      ["Overall Sentiment", dominant],
      ["Model Accuracy", (result.averageConfidence * 100).toFixed(1) + "%"],
      ["Positive Reviews", String(result.distribution.positive)],
      ["Negative Reviews", String(result.distribution.negative)],
      ["Neutral Reviews", String(result.distribution.neutral)],
    ],
    theme: "grid",
    headStyles: { fillColor: [55, 80, 160], fontSize: 10 },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Aspect summary
  if (result.aspectSummary.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Aspect-Based Sentiment", 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Aspect", "Positive", "Negative", "Neutral", "Total"]],
      body: result.aspectSummary
        .filter((a) => a.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((a) => [
          a.aspect.charAt(0).toUpperCase() + a.aspect.slice(1),
          String(a.positive),
          String(a.negative),
          String(a.neutral),
          String(a.total),
        ]),
      theme: "grid",
      headStyles: { fillColor: [55, 80, 160], fontSize: 10 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Top keywords
  if (result.wordFrequencies.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Top Keywords", 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Word", "Frequency"]],
      body: result.wordFrequencies.slice(0, 15).map((w) => [w.word, String(w.count)]),
      theme: "grid",
      headStyles: { fillColor: [55, 80, 160], fontSize: 10 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Sample reviews
  if (result.predictions.length > 0) {
    if (y > 200) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Review Details", 14, y);
    y += 8;

    const reviewRows = result.predictions.slice(0, 50).map((p) => [
      p.text.length > 80 ? p.text.slice(0, 80) + "…" : p.text,
      p.sentiment.charAt(0).toUpperCase() + p.sentiment.slice(1),
      (p.confidence * 100).toFixed(1) + "%",
      p.aspects.map((a) => `${a.aspect}: ${a.sentiment}`).join(", ") || "-",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Review", "Sentiment", "Confidence", "Aspects"]],
      body: reviewRows,
      theme: "grid",
      headStyles: { fillColor: [55, 80, 160], fontSize: 10 },
      styles: { fontSize: 8, cellWidth: "wrap" },
      columnStyles: { 0: { cellWidth: 80 } },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save("sentiment-analysis-report.pdf");
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
