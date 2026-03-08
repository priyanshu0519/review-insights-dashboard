export type SentimentLabel = "positive" | "negative" | "neutral";

export interface AspectSentiment {
  aspect: string;
  sentiment: SentimentLabel;
  confidence: number;
  mentions?: number;
}

export interface SentimentPrediction {
  text: string;
  sentiment: SentimentLabel;
  confidence: number;
  score: number;
  aspects: AspectSentiment[];
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
}

export interface AspectSummary {
  aspect: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface AnalysisResult {
  predictions: SentimentPrediction[];
  distribution: SentimentDistribution;
  aspectSummary: AspectSummary[];
  wordFrequencies: WordFrequency[];
  totalAnalyzed: number;
  averageConfidence: number;
}
