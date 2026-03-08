import { mockAnalyzeSingle, mockAnalyzeCsv } from "./mockSentiment";
import type { AnalysisResult } from "./types";

// Toggle this to switch from mock to real API
const USE_MOCK = true;
const API_BASE = "http://localhost:8000";

export async function analyzeSingleReview(text: string): Promise<AnalysisResult> {
  if (USE_MOCK) return mockAnalyzeSingle(text);

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review: text }),
  });
  if (!res.ok) throw new Error("API request failed");
  return res.json();
}

export async function analyzeCsvReviews(reviews: string[]): Promise<AnalysisResult> {
  if (USE_MOCK) return mockAnalyzeCsv(reviews);

  const res = await fetch(`${API_BASE}/predict/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviews }),
  });
  if (!res.ok) throw new Error("API request failed");
  return res.json();
}
