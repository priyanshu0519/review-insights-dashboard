const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function cleanText(text: string): string {
  return text
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/!https?[^\s]*/g, '')
    .replace(/[#*_\[\]()>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidReview(text: string): boolean {
  if (text.length < 15 || text.length > 5000) return false;
  const words = text.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 3) return false;

  const skipPatterns = [
    /^(home|menu|sign in|log in|cart|wishlist|footer|header|nav)/i,
    /add to (cart|wish|bag)/i,
    /cookie|privacy policy|terms of (use|service)|copyright ©/i,
    /^(sorry|error|unavailable|loading|please wait)/i,
    /\.(jpg|png|gif|svg|webp|css|js)\b/i,
    /captcha|recaptcha/i,
    /checkout|shipping cost|order total/i,
    /\${.*}/,
    /^(showing|page|next|previous|sort by|filter)\b/i,
    /^\d+\s*(of|\/)\s*\d+$/i,
    /^(share|report|helpful|verified purchase|read more)$/i,
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(text)) return false;
  }
  return true;
}

function extractReviews(markdown: string): string[] {
  const reviews: string[] = [];
  const seen = new Set<string>();

  const addReview = (text: string) => {
    const cleaned = cleanText(text);
    const key = cleaned.slice(0, 60).toLowerCase();
    if (isValidReview(cleaned) && !seen.has(key)) {
      seen.add(key);
      reviews.push(cleaned);
    }
  };

  // Strategy 1: Paragraph blocks
  for (const block of markdown.split(/\n{2,}/)) addReview(block);

  // Strategy 2: List items
  for (const item of markdown.split(/\n[-•*]\s/)) addReview(item);

  // Strategy 3: Combined consecutive lines
  let buffer = '';
  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (buffer) { addReview(buffer); buffer = ''; }
      continue;
    }
    buffer += ' ' + trimmed;
  }
  if (buffer) addReview(buffer);

  return reviews;
}

// Build paginated review URLs for known e-commerce sites
function getReviewPageUrls(url: string, maxPages: number): string[] {
  // Amazon
  const amazonMatch = url.match(/amazon\.(\w+(?:\.\w+)?)\/.+?(?:\/dp\/|\/product\/)([A-Z0-9]{10})/i);
  if (amazonMatch) {
    const domain = amazonMatch[1];
    const asin = amazonMatch[2];
    return Array.from({ length: maxPages }, (_, i) =>
      `https://www.amazon.${domain}/product-reviews/${asin}?reviewerType=all_reviews&sortBy=recent&pageNumber=${i + 1}`
    );
  }

  // Flipkart
  const flipkartMatch = url.match(/(flipkart\.com\/.+?\/p\/[a-z0-9]+)/i);
  if (flipkartMatch) {
    const base = flipkartMatch[1];
    return Array.from({ length: maxPages }, (_, i) =>
      `https://www.${base}/product-reviews/pid?page=${i + 1}&sortOrder=MOST_RECENT`
    );
  }

  // Generic: just the original URL
  return [url];
}

async function scrapePage(apiKey: string, targetUrl: string): Promise<{ markdown: string; title: string }> {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      formats: ['markdown'],
      onlyMainContent: false,
      waitFor: 5000,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Status ${response.status}`);
  }

  return {
    markdown: data.data?.markdown || data.markdown || '',
    title: data.data?.metadata?.title || data.metadata?.title || '',
  };
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

    // Get up to 5 pages of reviews for known sites
    const pageUrls = getReviewPageUrls(formattedUrl, 5);
    let allReviews: string[] = [];
    let pageTitle = '';
    const seen = new Set<string>();

    // Scrape pages sequentially (to avoid rate limits), stop when no new reviews found
    for (let i = 0; i < pageUrls.length; i++) {
      try {
        console.log(`Scraping page ${i + 1}/${pageUrls.length}: ${pageUrls[i]}`);
        const { markdown, title } = await scrapePage(apiKey, pageUrls[i]);
        if (!pageTitle && title) pageTitle = title;

        const reviews = extractReviews(markdown);
        let newCount = 0;
        for (const r of reviews) {
          const key = r.slice(0, 60).toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            allReviews.push(r);
            newCount++;
          }
        }

        console.log(`Page ${i + 1}: found ${reviews.length} reviews, ${newCount} new`);

        // If no new reviews on this page, stop paginating
        if (newCount === 0 && i > 0) {
          console.log('No new reviews found, stopping pagination');
          break;
        }
      } catch (err) {
        console.warn(`Failed page ${i + 1}:`, err);
        // If first page fails, try original URL as fallback
        if (i === 0 && pageUrls[0] !== formattedUrl) {
          try {
            const { markdown, title } = await scrapePage(apiKey, formattedUrl);
            if (!pageTitle && title) pageTitle = title;
            const reviews = extractReviews(markdown);
            for (const r of reviews) {
              const key = r.slice(0, 60).toLowerCase();
              if (!seen.has(key)) { seen.add(key); allReviews.push(r); }
            }
          } catch (_) { /* skip */ }
        }
        break;
      }
    }

    const uniqueReviews = allReviews.slice(0, 200);
    console.log(`Total extracted: ${uniqueReviews.length} unique reviews`);

    return new Response(
      JSON.stringify({
        success: true,
        reviews: uniqueReviews,
        title: pageTitle,
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
