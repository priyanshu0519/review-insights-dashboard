import type {
  SentimentLabel,
  SentimentPrediction,
  AnalysisResult,
  WordFrequency,
  ModelMetricsData,
  AspectSentiment,
} from "./types";

const ASPECTS = ["battery", "camera", "price", "delivery", "quality", "design", "performance", "display"];

const POSITIVE_WORDS = ["great", "excellent", "amazing", "love", "perfect", "best", "fantastic", "wonderful", "good", "happy"];
const NEGATIVE_WORDS = ["bad", "terrible", "worst", "hate", "broken", "poor", "awful", "horrible", "disappointing", "waste"];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectSentiment(text: string): { sentiment: SentimentLabel; confidence: number } {
  const lower = text.toLowerCase();
  const posCount = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
  const negCount = NEGATIVE_WORDS.filter((w) => lower.includes(w)).length;

  if (posCount > negCount) return { sentiment: "positive", confidence: 0.7 + Math.random() * 0.25 };
  if (negCount > posCount) return { sentiment: "negative", confidence: 0.7 + Math.random() * 0.25 };
  return { sentiment: "neutral", confidence: 0.5 + Math.random() * 0.3 };
}

function extractAspects(text: string): AspectSentiment[] {
  const lower = text.toLowerCase();
  const found: AspectSentiment[] = [];
  for (const aspect of ASPECTS) {
    if (lower.includes(aspect)) {
      found.push({
        aspect,
        sentiment: randomChoice<SentimentLabel>(["positive", "negative", "neutral"]),
        confidence: 0.6 + Math.random() * 0.35,
      });
    }
  }
  if (found.length === 0) {
    const picked = ASPECTS.slice(0, 2 + Math.floor(Math.random() * 3));
    for (const aspect of picked) {
      found.push({
        aspect,
        sentiment: randomChoice<SentimentLabel>(["positive", "negative", "neutral"]),
        confidence: 0.6 + Math.random() * 0.35,
      });
    }
  }
  return found;
}

function getWordFrequencies(text: string): WordFrequency[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }));
}

const MODEL_METRICS: ModelMetricsData = {
  accuracy: 0.872,
  precision: 0.856,
  recall: 0.841,
  f1Score: 0.848,
  confusionMatrix: [
    [842, 45, 23],
    [38, 756, 31],
    [19, 52, 694],
  ],
  labels: ["Positive", "Negative", "Neutral"],
};

function analyzeSingle(text: string): SentimentPrediction {
  const { sentiment, confidence } = detectSentiment(text);
  return { text, sentiment, confidence, aspects: extractAspects(text) };
}

export async function mockAnalyzeSingle(text: string): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
  const prediction = analyzeSingle(text);
  return {
    predictions: [prediction],
    distribution: {
      positive: prediction.sentiment === "positive" ? 1 : 0,
      negative: prediction.sentiment === "negative" ? 1 : 0,
      neutral: prediction.sentiment === "neutral" ? 1 : 0,
    },
    wordFrequencies: getWordFrequencies(text),
    modelMetrics: MODEL_METRICS,
  };
}

export async function mockAnalyzeCsv(reviews: string[]): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
  const predictions = reviews.map(analyzeSingle);
  const distribution = { positive: 0, negative: 0, neutral: 0 };
  for (const p of predictions) distribution[p.sentiment]++;
  const allText = reviews.join(" ");
  return {
    predictions,
    distribution,
    wordFrequencies: getWordFrequencies(allText),
    modelMetrics: MODEL_METRICS,
  };
}
