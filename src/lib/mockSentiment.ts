import type {
  SentimentLabel,
  SentimentPrediction,
  AnalysisResult,
  WordFrequency,
  ModelMetricsData,
  AspectSentiment,
} from "./types";

// Comprehensive aspect keywords grouped by category
const ASPECT_KEYWORDS: Record<string, string[]> = {
  quality: ["quality", "durable", "durability", "sturdy", "flimsy", "solid", "build", "material", "construction", "well-made", "cheap", "premium"],
  price: ["price", "cost", "expensive", "affordable", "cheap", "value", "worth", "money", "budget", "overpriced", "bargain", "deal"],
  delivery: ["delivery", "shipping", "arrived", "package", "packaging", "ship", "dispatch", "transit", "courier", "tracking"],
  design: ["design", "look", "looks", "style", "aesthetic", "appearance", "color", "colour", "sleek", "beautiful", "ugly", "compact", "size", "shape"],
  usability: ["easy", "use", "user-friendly", "intuitive", "comfortable", "convenient", "ergonomic", "handle", "grip", "lightweight", "heavy", "portable"],
  performance: ["performance", "fast", "slow", "speed", "powerful", "efficient", "works", "function", "effective", "reliable", "consistent"],
  battery: ["battery", "charge", "charging", "power", "mah", "rechargeable"],
  camera: ["camera", "photo", "photos", "picture", "pictures", "lens", "zoom", "megapixel", "video"],
  display: ["display", "screen", "resolution", "bright", "brightness", "hd", "lcd", "oled", "amoled"],
  sound: ["sound", "audio", "speaker", "volume", "bass", "noise", "loud", "quiet", "music"],
  durability: ["durable", "lasting", "break", "broke", "broken", "rust", "scratch", "wear", "tear", "lifespan"],
  service: ["service", "support", "customer", "warranty", "return", "refund", "replacement", "response", "help"],
  taste: ["taste", "flavor", "delicious", "bland", "fresh", "stale", "smell", "aroma"],
  comfort: ["comfort", "comfortable", "soft", "cushion", "fit", "fits", "snug", "tight", "loose"],
  cleaning: ["clean", "cleaning", "wash", "dishwasher", "stain", "maintenance", "care"],
};

const POSITIVE_WORDS = [
  "great", "excellent", "amazing", "love", "perfect", "best", "fantastic", "wonderful", 
  "good", "happy", "awesome", "superb", "outstanding", "brilliant", "impressive",
  "recommend", "satisfied", "pleased", "nice", "beautiful", "premium", "solid",
  "sturdy", "reliable", "fast", "smooth", "comfortable", "easy", "convenient",
  "durable", "delicious", "fresh", "effective", "efficient", "worth",
];

const NEGATIVE_WORDS = [
  "bad", "terrible", "worst", "hate", "broken", "poor", "awful", "horrible",
  "disappointing", "waste", "cheap", "flimsy", "useless", "defective", "damaged",
  "slow", "uncomfortable", "difficult", "overpriced", "fragile", "leaked",
  "stale", "bland", "unreliable", "faulty", "rusted", "scratched", "ugly",
  "heavy", "loud", "noisy", "regret", "return", "refund",
];

const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her",
  "was", "one", "our", "out", "has", "have", "been", "this", "that", "with",
  "they", "from", "will", "would", "there", "their", "what", "about", "which",
  "when", "make", "like", "just", "over", "such", "take", "than", "them",
  "very", "some", "could", "into", "other", "then", "its", "also", "after",
  "these", "two", "more", "only", "come", "made", "find", "here", "thing",
  "many", "well", "does", "get", "got", "use", "used", "using", "did",
  "each", "way", "may", "said", "much", "lot", "really", "still", "even",
  "own", "too", "any", "same", "how", "most", "let", "been", "being",
  "were", "who", "she", "his", "him", "new", "now", "old", "see", "time",
]);

function detectSentiment(text: string): { sentiment: SentimentLabel; confidence: number } {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/);
  
  let posScore = 0;
  let negScore = 0;
  
  for (const w of words) {
    if (POSITIVE_WORDS.includes(w)) posScore++;
    if (NEGATIVE_WORDS.includes(w)) negScore++;
  }

  if (posScore > negScore) {
    const confidence = Math.min(0.95, 0.65 + (posScore - negScore) * 0.05 + Math.random() * 0.1);
    return { sentiment: "positive", confidence };
  }
  if (negScore > posScore) {
    const confidence = Math.min(0.95, 0.65 + (negScore - posScore) * 0.05 + Math.random() * 0.1);
    return { sentiment: "negative", confidence };
  }
  return { sentiment: "neutral", confidence: 0.45 + Math.random() * 0.2 };
}

function extractAspects(text: string): AspectSentiment[] {
  const lower = text.toLowerCase();
  const found: AspectSentiment[] = [];

  for (const [aspect, keywords] of Object.entries(ASPECT_KEYWORDS)) {
    const matched = keywords.some((kw) => lower.includes(kw));
    if (!matched) continue;

    // Determine sentiment around this aspect by checking nearby words
    const sentimentContext = keywords.reduce((ctx, kw) => {
      const idx = lower.indexOf(kw);
      if (idx === -1) return ctx;
      // Get surrounding 60 chars
      const start = Math.max(0, idx - 30);
      const end = Math.min(lower.length, idx + kw.length + 30);
      return ctx + " " + lower.slice(start, end);
    }, "");

    const posHits = POSITIVE_WORDS.filter((w) => sentimentContext.includes(w)).length;
    const negHits = NEGATIVE_WORDS.filter((w) => sentimentContext.includes(w)).length;

    let sentiment: SentimentLabel = "neutral";
    let confidence = 0.5 + Math.random() * 0.15;
    if (posHits > negHits) {
      sentiment = "positive";
      confidence = 0.7 + Math.random() * 0.2;
    } else if (negHits > posHits) {
      sentiment = "negative";
      confidence = 0.7 + Math.random() * 0.2;
    }

    found.push({ aspect, sentiment, confidence });
  }

  // NO random fallback — only return aspects actually found in the text
  return found;
}

function getWordFrequencies(text: string): WordFrequency[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
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
