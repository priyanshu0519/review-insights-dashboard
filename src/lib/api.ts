import { supabase } from "@/integrations/supabase/client";
import type { AnalysisResult } from "./types";

export async function analyzeSingleReview(text: string): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
    body: { reviews: [text] },
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  return {
    predictions: data.predictions,
    distribution: data.distribution,
    aspectSummary: data.aspectSummary,
    wordFrequencies: data.wordFrequencies,
    totalAnalyzed: data.totalAnalyzed,
    averageConfidence: data.averageConfidence,
  };
}

export async function analyzeCsvReviews(reviews: string[]): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
    body: { reviews },
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Analysis failed");

  return {
    predictions: data.predictions,
    distribution: data.distribution,
    aspectSummary: data.aspectSummary,
    wordFrequencies: data.wordFrequencies,
    totalAnalyzed: data.totalAnalyzed,
    averageConfidence: data.averageConfidence,
  };
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
