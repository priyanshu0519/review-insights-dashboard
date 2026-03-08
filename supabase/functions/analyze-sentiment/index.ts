const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Sentiment Lexicon (AFINN-inspired with expanded terms) ───
const SENTIMENT_LEXICON: Record<string, number> = {
  // Strong positive (+4/+5)
  outstanding: 5, exceptional: 5, superb: 5, magnificent: 5, phenomenal: 5,
  excellent: 4, amazing: 4, fantastic: 4, wonderful: 4, brilliant: 4,
  incredible: 4, marvelous: 4, spectacular: 4, flawless: 4, perfection: 4,
  // Positive (+2/+3)
  great: 3, awesome: 3, love: 3, perfect: 3, beautiful: 3, impressive: 3,
  recommend: 3, delighted: 3, thrilled: 3, gorgeous: 3, remarkable: 3,
  good: 2, nice: 2, happy: 2, pleased: 2, satisfied: 2, enjoy: 2,
  reliable: 2, sturdy: 2, durable: 2, comfortable: 2, convenient: 2,
  smooth: 2, efficient: 2, solid: 2, premium: 2, stylish: 2,
  handy: 2, useful: 2, helpful: 2, elegant: 2, sleek: 2,
  // Mild positive (+1)
  fine: 1, okay: 1, decent: 1, adequate: 1, fair: 1, reasonable: 1,
  clean: 1, works: 1, functional: 1, acceptable: 1, sufficient: 1,
  // Mild negative (-1)
  mediocre: -1, average: -1, ordinary: -1, bland: -1, dull: -1,
  // Negative (-2/-3)
  bad: -2, poor: -2, disappointing: -2, uncomfortable: -2, difficult: -2,
  cheap: -2, flimsy: -2, slow: -2, noisy: -2, heavy: -2, overpriced: -2,
  annoying: -2, frustrating: -2, inconvenient: -2, awkward: -2,
  defective: -3, broken: -3, damaged: -3, faulty: -3, leaked: -3,
  rusted: -3, cracked: -3, unusable: -3, useless: -3, fragile: -3,
  // Strong negative (-4/-5)
  terrible: -4, horrible: -4, awful: -4, dreadful: -4, disgusting: -4,
  worst: -5, hate: -4, atrocious: -5, abysmal: -5, pathetic: -4,
  // Negators and intensifiers handled separately
  waste: -3, regret: -3, refund: -2, return: -1, complaint: -2,
  // Product-specific
  lightweight: 2, compact: 1, spacious: 2, ergonomic: 2, adjustable: 1,
  versatile: 2, innovative: 2, intuitive: 2, responsive: 2,
  scratched: -2, chipped: -2, bent: -2, wobbly: -2, loose: -2,
  sticky: -1, stiff: -1, rough: -1, sharp: -1, uneven: -2,
  delicious: 3, tasty: 2, fresh: 2, stale: -2, bitter: -1,
};

const NEGATORS = new Set(['not', 'no', 'never', 'neither', 'nor', "don't", "doesn't", "didn't", "won't", "wouldn't", "couldn't", "shouldn't", "isn't", "aren't", "wasn't", "weren't", "hardly", "barely", "scarcely']);

const INTENSIFIERS: Record<string, number> = {
  very: 1.5, really: 1.5, extremely: 2, incredibly: 2, absolutely: 2,
  highly: 1.5, totally: 1.5, completely: 1.5, utterly: 2, quite: 1.3,
  super: 1.5, truly: 1.5, remarkably: 1.5, exceptionally: 2,
  somewhat: 0.7, slightly: 0.5, barely: 0.3, hardly: 0.3,
};

// ─── Aspect Keywords ───
const ASPECT_MAP: Record<string, string[]> = {
  quality: ['quality', 'durable', 'durability', 'sturdy', 'flimsy', 'solid', 'build', 'material', 'construction', 'well-made', 'premium', 'finish', 'craftsmanship', 'robust'],
  price: ['price', 'cost', 'expensive', 'affordable', 'cheap', 'value', 'worth', 'money', 'budget', 'overpriced', 'bargain', 'deal', 'economical'],
  delivery: ['delivery', 'shipping', 'arrived', 'package', 'packaging', 'ship', 'dispatch', 'transit', 'courier', 'tracking', 'delivered', 'late', 'delayed', 'prompt'],
  design: ['design', 'look', 'looks', 'style', 'aesthetic', 'appearance', 'color', 'colour', 'sleek', 'beautiful', 'compact', 'size', 'shape', 'elegant', 'modern'],
  usability: ['easy', 'user-friendly', 'intuitive', 'comfortable', 'convenient', 'ergonomic', 'handle', 'grip', 'lightweight', 'portable', 'simple', 'practical', 'handy'],
  performance: ['performance', 'fast', 'slow', 'speed', 'powerful', 'efficient', 'effective', 'reliable', 'consistent', 'works', 'working', 'functional'],
  battery: ['battery', 'charge', 'charging', 'power', 'mah', 'rechargeable', 'backup'],
  camera: ['camera', 'photo', 'photos', 'picture', 'pictures', 'lens', 'zoom', 'megapixel', 'video', 'selfie'],
  display: ['display', 'screen', 'resolution', 'bright', 'brightness', 'hd', 'lcd', 'oled', 'amoled', 'pixels'],
  sound: ['sound', 'audio', 'speaker', 'volume', 'bass', 'noise', 'loud', 'quiet', 'music', 'treble'],
  durability: ['durable', 'lasting', 'break', 'broke', 'broken', 'rust', 'scratch', 'wear', 'tear', 'lifespan', 'longevity'],
  service: ['service', 'support', 'customer', 'warranty', 'return', 'refund', 'replacement', 'response', 'help', 'seller'],
  comfort: ['comfort', 'comfortable', 'soft', 'cushion', 'fit', 'fits', 'snug', 'tight', 'cozy'],
  cleaning: ['clean', 'cleaning', 'wash', 'dishwasher', 'stain', 'maintenance', 'care', 'hygiene'],
  taste: ['taste', 'flavor', 'delicious', 'bland', 'fresh', 'stale', 'smell', 'aroma', 'yummy'],
  safety: ['safe', 'safety', 'secure', 'hazard', 'danger', 'toxic', 'bpa', 'non-stick', 'food-grade'],
  cooking: ['cook', 'cooking', 'heat', 'heating', 'boil', 'steam', 'fry', 'bake', 'induction', 'gas', 'stove', 'flame', 'temperature'],
  capacity: ['capacity', 'volume', 'litre', 'liter', 'spacious', 'compact', 'small', 'large', 'big', 'enough', 'family'],
};

const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
  'was', 'one', 'our', 'out', 'has', 'have', 'been', 'this', 'that', 'with',
  'they', 'from', 'will', 'would', 'there', 'their', 'what', 'about', 'which',
  'when', 'make', 'like', 'just', 'over', 'such', 'take', 'than', 'them',
  'very', 'some', 'could', 'into', 'other', 'then', 'its', 'also', 'after',
  'these', 'two', 'more', 'only', 'come', 'made', 'find', 'here', 'thing',
  'many', 'well', 'does', 'get', 'got', 'did', 'each', 'way', 'may', 'said',
  'much', 'lot', 'really', 'still', 'even', 'own', 'too', 'any', 'same',
  'how', 'most', 'let', 'being', 'were', 'who', 'she', 'his', 'him', 'new',
  'now', 'old', 'see', 'time', 'use', 'used', 'using', 'product', 'item',
  'bought', 'buy', 'amazon', 'review', 'star', 'stars', 'rating',
]);

type SentimentLabel = 'positive' | 'negative' | 'neutral';

interface AspectResult {
  aspect: string;
  sentiment: SentimentLabel;
  confidence: number;
  mentions: number;
}

interface ReviewResult {
  text: string;
  sentiment: SentimentLabel;
  confidence: number;
  score: number;
  aspects: AspectResult[];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 1);
}

function analyzeSentiment(text: string): { sentiment: SentimentLabel; confidence: number; score: number } {
  const tokens = tokenize(text);
  let totalScore = 0;
  let scoredTokens = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const lexScore = SENTIMENT_LEXICON[token];

    if (lexScore !== undefined) {
      let adjustedScore = lexScore;

      // Check for negator in previous 3 words
      let negated = false;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (NEGATORS.has(tokens[j])) {
          negated = true;
          break;
        }
      }
      if (negated) adjustedScore = -adjustedScore * 0.75;

      // Check for intensifier in previous 2 words
      for (let j = Math.max(0, i - 2); j < i; j++) {
        const intensifier = INTENSIFIERS[tokens[j]];
        if (intensifier !== undefined) {
          adjustedScore = adjustedScore * intensifier;
          break;
        }
      }

      totalScore += adjustedScore;
      scoredTokens++;
    }
  }

  // Normalize score
  const normalizedScore = scoredTokens > 0 ? totalScore / Math.sqrt(scoredTokens) : 0;

  let sentiment: SentimentLabel;
  let confidence: number;

  if (normalizedScore > 0.5) {
    sentiment = 'positive';
    confidence = Math.min(0.98, 0.55 + Math.abs(normalizedScore) * 0.08);
  } else if (normalizedScore < -0.5) {
    sentiment = 'negative';
    confidence = Math.min(0.98, 0.55 + Math.abs(normalizedScore) * 0.08);
  } else {
    sentiment = 'neutral';
    confidence = 0.4 + (1 - Math.abs(normalizedScore)) * 0.2;
  }

  return { sentiment, confidence: Math.round(confidence * 1000) / 1000, score: Math.round(normalizedScore * 100) / 100 };
}

function extractAspects(text: string): AspectResult[] {
  const lower = text.toLowerCase();
  const results: AspectResult[] = [];

  for (const [aspect, keywords] of Object.entries(ASPECT_MAP)) {
    const matchedKeywords = keywords.filter(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lower);
    });

    if (matchedKeywords.length === 0) continue;

    // Get context around matched keywords and analyze sentiment
    let contextScore = 0;
    let contextTokens = 0;

    for (const kw of matchedKeywords) {
      const idx = lower.indexOf(kw);
      if (idx === -1) continue;
      const start = Math.max(0, idx - 80);
      const end = Math.min(lower.length, idx + kw.length + 80);
      const context = lower.slice(start, end);
      const { score } = analyzeSentiment(context);
      contextScore += score;
      contextTokens++;
    }

    const avgScore = contextTokens > 0 ? contextScore / contextTokens : 0;
    let sentiment: SentimentLabel;
    let confidence: number;

    if (avgScore > 0.3) {
      sentiment = 'positive';
      confidence = Math.min(0.95, 0.55 + Math.abs(avgScore) * 0.06);
    } else if (avgScore < -0.3) {
      sentiment = 'negative';
      confidence = Math.min(0.95, 0.55 + Math.abs(avgScore) * 0.06);
    } else {
      sentiment = 'neutral';
      confidence = 0.4 + (1 - Math.abs(avgScore)) * 0.15;
    }

    results.push({
      aspect,
      sentiment,
      confidence: Math.round(confidence * 1000) / 1000,
      mentions: matchedKeywords.length,
    });
  }

  return results.sort((a, b) => b.mentions - a.mentions);
}

function getWordFrequencies(texts: string[]): Array<{ word: string; count: number }> {
  const freq: Record<string, number> = {};
  for (const text of texts) {
    const words = tokenize(text).filter(w => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviews } = await req.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Reviews array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${reviews.length} reviews...`);

    // Analyze each review
    const predictions: ReviewResult[] = reviews.map((text: string) => {
      const { sentiment, confidence, score } = analyzeSentiment(text);
      const aspects = extractAspects(text);
      return { text, sentiment, confidence, score, aspects };
    });

    // Aggregate distribution
    const distribution = { positive: 0, negative: 0, neutral: 0 };
    for (const p of predictions) distribution[p.sentiment]++;

    // Aggregate aspects across all reviews
    const aspectAgg: Record<string, { positive: number; negative: number; neutral: number; total: number }> = {};
    for (const p of predictions) {
      for (const a of p.aspects) {
        if (!aspectAgg[a.aspect]) aspectAgg[a.aspect] = { positive: 0, negative: 0, neutral: 0, total: 0 };
        aspectAgg[a.aspect][a.sentiment]++;
        aspectAgg[a.aspect].total++;
      }
    }

    const aspectSummary = Object.entries(aspectAgg)
      .map(([aspect, counts]) => ({ aspect, ...counts }))
      .sort((a, b) => b.total - a.total);

    // Word frequencies
    const wordFrequencies = getWordFrequencies(reviews);

    // Average confidence
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    console.log(`Analysis complete: ${distribution.positive} positive, ${distribution.negative} negative, ${distribution.neutral} neutral`);

    return new Response(
      JSON.stringify({
        success: true,
        predictions,
        distribution,
        aspectSummary,
        wordFrequencies,
        totalAnalyzed: predictions.length,
        averageConfidence: Math.round(avgConfidence * 1000) / 1000,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
