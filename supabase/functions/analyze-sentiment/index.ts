const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const reviews: string[] = body.reviews;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Reviews array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing ' + reviews.length + ' reviews with AI...');

    // Process in batches of 10 to stay within token limits
    const batchSize = 10;
    const allPredictions: any[] = [];

    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      const numberedReviews = batch.map((r, idx) => `Review ${i + idx + 1}: "${r}"`).join('\n\n');

      const systemPrompt = `You are an expert NLP sentiment analysis engine. For each review, analyze:
1. Overall sentiment (positive/negative/neutral) with confidence score (0-1)
2. Sentiment score (-5 to +5 scale)
3. Product aspects mentioned with per-aspect sentiment

ONLY return aspects that are explicitly discussed in the review text. Common aspects include: quality, price, delivery, design, usability, performance, durability, service, comfort, cleaning, taste, safety, cooking, capacity, battery, camera, display, sound. Do NOT invent aspects not mentioned.

Be precise with confidence scores - use higher values (0.85+) only when sentiment is very clear.`;

      const response = await fetch(AI_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + LOVABLE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: numberedReviews },
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'submit_analysis',
              description: 'Submit sentiment analysis results for all reviews in the batch',
              parameters: {
                type: 'object',
                properties: {
                  results: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
                        confidence: { type: 'number', minimum: 0, maximum: 1 },
                        score: { type: 'number', minimum: -5, maximum: 5 },
                        aspects: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              aspect: { type: 'string' },
                              sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
                              confidence: { type: 'number', minimum: 0, maximum: 1 },
                              mentions: { type: 'number', minimum: 1 },
                            },
                            required: ['aspect', 'sentiment', 'confidence', 'mentions'],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ['sentiment', 'confidence', 'score', 'aspects'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['results'],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: 'function', function: { name: 'submit_analysis' } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(
            JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits to continue.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const errText = await response.text();
        console.error('AI gateway error:', status, errText);
        throw new Error('AI analysis failed with status ' + status);
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

      if (!toolCall?.function?.arguments) {
        console.error('No tool call in AI response:', JSON.stringify(aiData));
        throw new Error('AI did not return structured results');
      }

      const parsed = JSON.parse(toolCall.function.arguments);
      const results = parsed.results || [];

      for (let j = 0; j < batch.length; j++) {
        const analysis = results[j] || { sentiment: 'neutral', confidence: 0.5, score: 0, aspects: [] };
        allPredictions.push({
          text: batch[j],
          sentiment: analysis.sentiment,
          confidence: Math.round(analysis.confidence * 1000) / 1000,
          score: Math.round(analysis.score * 100) / 100,
          aspects: analysis.aspects || [],
        });
      }
    }

    // Aggregate distribution
    const distribution = { positive: 0, negative: 0, neutral: 0 };
    for (const p of allPredictions) {
      distribution[p.sentiment as 'positive' | 'negative' | 'neutral']++;
    }

    // Aggregate aspects
    const aspectAgg: Record<string, { positive: number; negative: number; neutral: number; total: number }> = {};
    for (const p of allPredictions) {
      for (const a of p.aspects) {
        const key = a.aspect.toLowerCase();
        if (!aspectAgg[key]) aspectAgg[key] = { positive: 0, negative: 0, neutral: 0, total: 0 };
        aspectAgg[key][a.sentiment as 'positive' | 'negative' | 'neutral']++;
        aspectAgg[key].total++;
      }
    }

    const aspectSummary = Object.entries(aspectAgg)
      .map(([aspect, counts]) => ({ aspect, ...counts }))
      .sort((a, b) => b.total - a.total);

    // Word frequencies (simple tokenization)
    const stopwords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'this', 'that', 'with', 'they', 'from', 'will', 'would', 'there', 'their', 'what', 'about', 'which', 'when', 'make', 'like', 'just', 'over', 'such', 'take', 'than', 'them', 'very', 'some', 'could', 'into', 'other', 'then', 'its', 'also', 'after', 'these', 'two', 'more', 'only', 'come', 'made', 'find', 'here', 'thing', 'many', 'well', 'does', 'get', 'got', 'did', 'each', 'way', 'may', 'said', 'much', 'lot', 'really', 'still', 'even', 'own', 'too', 'any', 'same', 'how', 'most', 'let', 'being', 'were', 'who', 'she', 'his', 'him', 'new', 'now', 'old', 'see', 'time', 'use', 'used', 'using', 'product', 'item', 'bought', 'buy', 'amazon', 'review', 'star', 'stars', 'rating']);
    const freq: Record<string, number> = {};
    for (const text of reviews) {
      const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w) && !/^\d+$/.test(w));
      for (const w of words) freq[w] = (freq[w] || 0) + 1;
    }
    const wordFrequencies = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    const avgConfidence = allPredictions.reduce((sum, p) => sum + p.confidence, 0) / allPredictions.length;

    console.log('AI analysis complete: ' + distribution.positive + ' positive, ' + distribution.negative + ' negative, ' + distribution.neutral + ' neutral');

    return new Response(
      JSON.stringify({
        success: true,
        predictions: allPredictions,
        distribution,
        aspectSummary,
        wordFrequencies,
        totalAnalyzed: allPredictions.length,
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
