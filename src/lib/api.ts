import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "./types";

function parseResult(data: any): AnalysisResult {
  return {
    predictions: data.predictions,
    distribution: data.distribution,
    aspectSummary: data.aspectSummary,
    wordFrequencies: data.wordFrequencies,
    totalAnalyzed: data.totalAnalyzed,
    averageConfidence: data.averageConfidence,
  };
}

async function saveSession(
  result: AnalysisResult,
  sourceType: string,
  sourceUrl?: string,
  title?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("analysis_sessions").insert([{
      user_id: user.id,
      source_type: sourceType,
      source_url: sourceUrl || null,
      title: title || null,
      total_analyzed: result.totalAnalyzed,
      average_confidence: result.averageConfidence,
      distribution: result.distribution as any,
      aspect_summary: result.aspectSummary as any,
      word_frequencies: result.wordFrequencies as any,
      predictions: result.predictions as any,
    }]);
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

export async function analyzeSingleReview(text: string): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
    body: { reviews: [text] },
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  const result = parseResult(data);
  await saveSession(result, "single", undefined, text.slice(0, 100));
  return result;
}

export async function analyzeCsvReviews(reviews: string[]): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
    body: { reviews },
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  const result = parseResult(data);
  await saveSession(result, "csv", undefined, `CSV Upload (${reviews.length} reviews)`);
  return result;
}

export async function scrapeAndAnalyze(url: string): Promise<{ reviews: string[]; title: string }> {
  const { data, error } = await supabase.functions.invoke("scrape-reviews", {
    body: { url },
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Scraping failed");

  return {
    reviews: data.reviews || [],
    title: data.title || "",
  };
}

export async function analyzeScrapedReviews(
  reviews: string[],
  sourceUrl: string,
  title: string
): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
    body: { reviews },
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  const result = parseResult(data);
  await saveSession(result, "scrape", sourceUrl, title || sourceUrl);
  return result;
}

export async function fetchAnalysisHistory() {
  const { data, error } = await supabase
    .from("analysis_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function deleteAnalysisSession(id: string) {
  const { error } = await supabase
    .from("analysis_sessions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
