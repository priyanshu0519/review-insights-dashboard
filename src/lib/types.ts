export type SentimentLabel = "positive" | "negative" | "neutral";

export interface AspectSentiment {
  aspect: string;
  sentiment: SentimentLabel;
  confidence: number;
}

export interface SentimentPrediction {
  text: string;
  sentiment: SentimentLabel;
  confidence: number;
  aspects: AspectSentiment[];
}

export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface ModelMetricsData {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  labels: string[];
}

export interface AnalysisResult {
  predictions: SentimentPrediction[];
  distribution: SentimentDistribution;
  wordFrequencies: WordFrequency[];
  modelMetrics: ModelMetricsData;
}
