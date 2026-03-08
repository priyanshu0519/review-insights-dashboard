const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function cleanText(text: string): string {
  return text
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove image references
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/!https?[^\s]*/g, '')
    // Remove markdown artifacts
    .replace(/[#*_\[\]()>|]/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidReview(text: string): boolean {
  if (text.length < 25 || text.length > 2000) return false;
  
  // Must contain at least 4 real words
  const words = text.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 4) return false;

  // Skip if mostly URLs or codes
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 0) return false;

  // Skip navigation/UI text patterns
  const skipPatterns = [
    /^(home|kitchen|cookware|pots|pans|menu|sign in|log in|cart|wishlist)/i,
    /add to (cart|wish|bag)/i,
    /^(click|tap|select|choose|browse|view|see|shop)/i,
    /cookie|privacy|terms|copyright|trademark/i,
    /^(sorry|error|unavailable|loading|please wait)/i,
    /\.jpg|\.png|\.gif|\.svg|\.webp|\.css|\.js/i,
    /^(image|video|photo) (not|is|player)/i,
    /captcha|recaptcha/i,
    /payment.*encrypt|security.*system/i,
    /ships? in product/i,
    /quantity:\d/i,
    /initial (monthly )?payment/i,
    /checkout|shipping cost|order total/i,
    /\${.*}/,  // Template variables
    /CB\d{9}/,  // Amazon image codes
    /ref=|ref_=/i,
    /asin=/i,
    /node=\d/i,
    /encoding=UTF/i,
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(text)) return false;
  }

  // Must have some sentence-like structure (contains common English words)
  const hasRealContent = /\b(the|this|that|is|are|was|were|have|has|very|good|bad|great|nice|love|best|worst|product|quality|price|buy|bought|use|used|recommend|review|star|rating|excellent|terrible|amazing|disappointed|happy|satisfied|perfect|broken|works|working|received|delivered|material|durable|sturdy|cheap|expensive|worth|value)\b/i.test(text);
  
  return hasRealContent;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping product reviews from:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = data.data?.markdown || data.markdown || '';
    const title = data.data?.metadata?.title || data.metadata?.title || '';

    // Split into blocks and clean
    const blocks = markdown.split(/\n{2,}|\n-\s/);
    const reviews: string[] = [];

    for (const block of blocks) {
      const cleaned = cleanText(block);
      if (isValidReview(cleaned)) {
        reviews.push(cleaned);
      }
    }

    // Also try splitting by single newlines for review sections
    if (reviews.length < 3) {
      const lines = markdown.split('\n');
      for (const line of lines) {
        const cleaned = cleanText(line);
        if (isValidReview(cleaned) && !reviews.includes(cleaned)) {
          reviews.push(cleaned);
        }
      }
    }

    // Deduplicate
    const uniqueReviews = [...new Set(reviews)].slice(0, 100);

    console.log(`Extracted ${uniqueReviews.length} clean review blocks from ${formattedUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        reviews: uniqueReviews,
        title,
        url: formattedUrl,
        totalExtracted: uniqueReviews.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape reviews';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
