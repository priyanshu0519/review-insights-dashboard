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
  // Relaxed: minimum 15 chars, max 5000
  if (text.length < 15 || text.length > 5000) return false;

  const words = text.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 3) return false;

  // Skip navigation/UI junk only
  const skipPatterns = [
    /^(home|menu|sign in|log in|cart|wishlist|footer|header|nav)/i,
    /add to (cart|wish|bag)/i,
    /cookie|privacy policy|terms of (use|service)|copyright ©/i,
    /^(sorry|error|unavailable|loading|please wait)/i,
    /\.(jpg|png|gif|svg|webp|css|js)\b/i,
    /captcha|recaptcha/i,
    /checkout|shipping cost|order total/i,
    /\${.*}/,
    /^(showing|page|next|previous|sort by|filter)/i,
    /^\d+\s*(of|\/)\s*\d+$/i,
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(text)) return false;
  }

  return true;
}

// Try to get the reviews-specific URL for Amazon/Flipkart
function getReviewsUrl(url: string): string[] {
  const urls = [url];

  // Amazon: redirect to all reviews page
  const amazonMatch = url.match(/amazon\.\w+.*?\/(dp|product)\/([A-Z0-9]{10})/i);
  if (amazonMatch) {
    const asin = amazonMatch[2];
    const domain = url.match(/amazon\.(\w+(\.\w+)?)/)?.[0] || 'amazon.com';
    urls.unshift(`https://www.${domain}/product-reviews/${asin}/ref=cm_cr_dp_d_show_all_btm?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber=1`);
  }

  // Flipkart: redirect to reviews page
  const flipkartMatch = url.match(/flipkart\.com.*?\/p\/(itm[a-z0-9]+)/i);
  if (flipkartMatch) {
    urls.unshift(`${url.split('?')[0]}/product-reviews/${flipkartMatch[1]}?page=1&sortOrder=MOST_RECENT`);
  }

  return urls;
}

async function scrapeUrl(apiKey: string, targetUrl: string): Promise<{ markdown: string; title: string }> {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: targetUrl,
      formats: ['markdown'],
      onlyMainContent: false, // Get full page to capture all reviews
      waitFor: 5000, // Wait longer for dynamic content to load
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return {
    markdown: data.data?.markdown || data.markdown || '',
    title: data.data?.metadata?.title || data.metadata?.title || '',
  };
}

function extractReviews(markdown: string): string[] {
  const reviews: string[] = [];

  // Strategy 1: Split by double newlines (paragraph blocks)
  const blocks = markdown.split(/\n{2,}/);
  for (const block of blocks) {
    const cleaned = cleanText(block);
    if (isValidReview(cleaned)) {
      reviews.push(cleaned);
    }
  }

  // Strategy 2: Split by list markers
  const listItems = markdown.split(/\n[-•*]\s/);
  for (const item of listItems) {
    const cleaned = cleanText(item);
    if (isValidReview(cleaned) && !reviews.includes(cleaned)) {
      reviews.push(cleaned);
    }
  }

  // Strategy 3: Split by single newlines and combine short consecutive lines
  const lines = markdown.split('\n');
  let buffer = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (buffer) {
        const cleaned = cleanText(buffer);
        if (isValidReview(cleaned) && !reviews.includes(cleaned)) {
          reviews.push(cleaned);
        }
        buffer = '';
      }
      continue;
    }
    buffer += ' ' + trimmed;
  }
  if (buffer) {
    const cleaned = cleanText(buffer);
    if (isValidReview(cleaned) && !reviews.includes(cleaned)) {
      reviews.push(cleaned);
    }
  }

  // Strategy 4: Look for review-like patterns (star ratings followed by text)
  const reviewPatterns = markdown.match(/(?:★{1,5}|⭐{1,5}|\d(?:\.\d)?\s*(?:out of|\/)\s*5|(?:\d\s*)?stars?)\s*[:\-–—]?\s*(.{20,}?)(?=\n(?:★|⭐|\d(?:\.\d)?\s*(?:out of|\/)|$))/gi);
  if (reviewPatterns) {
    for (const match of reviewPatterns) {
      const cleaned = cleanText(match);
      if (isValidReview(cleaned) && !reviews.includes(cleaned)) {
        reviews.push(cleaned);
      }
    }
  }

  return reviews;
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

    const urlsToTry = getReviewsUrl(formattedUrl);
    let allReviews: string[] = [];
    let pageTitle = '';

    // Try each URL (reviews page first, then product page)
    for (const targetUrl of urlsToTry) {
      try {
        console.log('Trying URL:', targetUrl);
        const { markdown, title } = await scrapeUrl(apiKey, targetUrl);
        if (!pageTitle && title) pageTitle = title;

        const reviews = extractReviews(markdown);
        console.log(`Found ${reviews.length} reviews from ${targetUrl}`);

        for (const r of reviews) {
          if (!allReviews.includes(r)) {
            allReviews.push(r);
          }
        }

        // If we got a good number from the reviews page, stop
        if (allReviews.length >= 15) break;
      } catch (err) {
        console.warn(`Failed to scrape ${targetUrl}:`, err);
      }
    }

    // Deduplicate by similarity (remove near-duplicates)
    const uniqueReviews = allReviews
      .filter((review, i, arr) => {
        const short = review.slice(0, 50).toLowerCase();
        return !arr.slice(0, i).some(prev => prev.slice(0, 50).toLowerCase() === short);
      })
      .slice(0, 150);

    console.log(`Extracted ${uniqueReviews.length} total unique reviews`);

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
