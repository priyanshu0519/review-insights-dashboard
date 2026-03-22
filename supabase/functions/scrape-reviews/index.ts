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
    .replace(/\\\\/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isActualReview(text: string): boolean {
  if (text.length < 20 || text.length > 5000) return false;
  const words = text.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 4) return false;

  const skipPatterns = [
    /^(home|menu|sign in|log in|cart|wishlist|footer|header|nav|hello)/i,
    /add to (cart|wish|bag)/i,
    /cookie|privacy policy|terms of (use|service)|copyright/i,
    /\.(jpg|png|gif|svg|webp|css|js)\b/i,
    /captcha|recaptcha/i,
    /checkout|shipping cost|order total/i,
    /^(showing|page|next|previous|sort by|filter)\b/i,
    /^\d+\s*(of|\/)\s*\d+$/i,
    /^(share|report|helpful|verified purchase|read more|show all)$/i,
    // Navigation / UI elements
    /sign up|create.*account|new customer|become a seller/i,
    /notification|preferences|customer care|advertise|download app/i,
    /my profile|my orders|gift cards|rewards/i,
    // Product listings / ads
    /\d+%\s*OFF|₹\s*\d+.*₹\s*\d+|hot deal|bestseller/i,
    /!Image\s/i,
    /AD\\?\s/i,
    // E-commerce boilerplate
    /select (delivery|your) location/i,
    /delivering to|update location/i,
    /fulfilled by|sold by/i,
    /cash on.*delivery/i,
    /add to cart|buy now|add to wishlist/i,
    /return(s|able)|refund|replacement|warranty/i,
    /eligible for (free )?replacement/i,
    /contact us|about us|careers|press|corporate/i,
    /payments|shipping|cancellation/i,
    /flipkart internet|registered office/i,
    /telephone:|tel:/i,
    /explore more|similar items|compare with/i,
    /ratings and reviews|based on \d+.*ratings/i,
    /features customers loved/i,
    /questions and answers/i,
    /be the first to ask/i,
    /no questions.*available/i,
    // Category / department lists
    /select the department/i,
    /all categories/i,
    /account & lists|returns.*orders/i,
    // Amazon specific boilerplate
    /wish list|wish from any/i,
    /your (account|orders|recommendations|prime)/i,
    /to move between items/i,
    /main content.*about this item/i,
    /click to see full view/i,
    /visit the.*store/i,
    /tap on the category/i,
    /360.*view|videos.*reviews/i,
    // Generic product titles (not reviews)
    /^\w+\s+(women|men|kids|boys|girls)\s+(regular|slim|skinny|straight|flared)/i,
    /^(KOTTY|NOVIO|KASHIAN|MERCEL|RIFA|zayla|cnw|GUTI|DENIM|PINKLIT|Dollfashion|Zaristaa|3BUTTERFLIES|FLYING MACHINE|silver threads|LEMON FRESH|LTA)\b/i,
    // Price ranges
    /^Rs\.\s*\d+/i,
    /^₹\s*\d+/i,
    // Short non-review phrases
    /^(features|description|and more|classic|stylish|easy care|regular fit|clean look)$/i,
    /^cargo\s*style/i,
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(text)) return false;
  }

  // Check it has some opinion/sentiment words or looks like natural language
  const hasOpinionIndicators = /good|great|nice|bad|worst|best|love|hate|awesome|terrible|excellent|amazing|poor|decent|okay|fine|happy|disappointed|recommend|perfect|waste|worth|quality|comfortable|beautiful|ugly|fast|slow|broke|works|stopped|issue|problem|satisfied|unsatisfied|better|worse|fantastic|horrible|outstanding|mediocre|superb|awful|delighted|annoyed|pleased|frustr/i.test(text);
  const hasReviewPattern = /bought|purchased|using|ordered|received|delivered|arrived|tried|tested|experience|product|item|service/i.test(text);
  const isLongEnough = words.length >= 8;

  return hasOpinionIndicators || hasReviewPattern || isLongEnough;
}

function extractReviews(markdown: string): string[] {
  const reviews: string[] = [];
  const seen = new Set<string>();

  const addReview = (text: string) => {
    const cleaned = cleanText(text);
    const key = cleaned.slice(0, 80).toLowerCase();
    if (isActualReview(cleaned) && !seen.has(key)) {
      seen.add(key);
      reviews.push(cleaned);
    }
  };

  // Split by paragraph blocks
  for (const block of markdown.split(/\n{2,}/)) addReview(block);

  // Split by list items
  for (const item of markdown.split(/\n[-•*]\s/)) addReview(item);

  // Combine consecutive lines
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

function getReviewPageUrls(url: string, maxPages: number): string[] {
  // Amazon - handle various URL formats
  const amazonMatch = url.match(/amazon\.(\w+(?:\.\w+)?)\/(?:.*?\/)?(?:dp|product|gp\/product)\/([A-Z0-9]{10})/i);
  if (amazonMatch) {
    const domain = amazonMatch[1];
    const asin = amazonMatch[2];
    return Array.from({ length: maxPages }, (_, i) =>
      `https://www.amazon.${domain}/product-reviews/${asin}?reviewerType=all_reviews&sortBy=recent&pageNumber=${i + 1}`
    );
  }

  // Flipkart - try to get the reviews page
  const flipkartMatch = url.match(/(flipkart\.com\/.+?\/p\/[a-z0-9]+)/i);
  if (flipkartMatch) {
    const base = flipkartMatch[1];
    return Array.from({ length: maxPages }, (_, i) =>
      `https://www.${base}&page=${i + 1}`
    );
  }

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

    const pageUrls = getReviewPageUrls(formattedUrl, 5);
    let allReviews: string[] = [];
    let pageTitle = '';
    const seen = new Set<string>();

    for (let i = 0; i < pageUrls.length; i++) {
      try {
        console.log(`Scraping page ${i + 1}/${pageUrls.length}: ${pageUrls[i]}`);
        const { markdown, title } = await scrapePage(apiKey, pageUrls[i]);
        if (!pageTitle && title) pageTitle = title;

        const reviews = extractReviews(markdown);
        let newCount = 0;
        for (const r of reviews) {
          const key = r.slice(0, 80).toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            allReviews.push(r);
            newCount++;
          }
        }

        console.log(`Page ${i + 1}: found ${reviews.length} reviews, ${newCount} new`);

        if (newCount === 0 && i > 0) {
          console.log('No new reviews found, stopping pagination');
          break;
        }
      } catch (err) {
        console.warn(`Failed page ${i + 1}:`, err);
        if (i === 0 && pageUrls[0] !== formattedUrl) {
          try {
            const { markdown, title } = await scrapePage(apiKey, formattedUrl);
            if (!pageTitle && title) pageTitle = title;
            const reviews = extractReviews(markdown);
            for (const r of reviews) {
              const key = r.slice(0, 80).toLowerCase();
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
