const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function cleanText(text: string): string {
  return text
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/!https?[^\s]*/g, '')
    .replace(/!Image\b/gi, '')
    .replace(/[#*_\[\]()>|]/g, '')
    .replace(/\\\\/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isJunkContent(text: string): boolean {
  const junk = [
    /sign (up|in)|create.*account|new customer|become a seller/i,
    /notification|customer care|advertise|download app/i,
    /my (profile|orders|account)|gift cards|rewards|wishlist/i,
    /select (delivery|your|the department)|delivering to|update location/i,
    /add to (cart|wish|bag)|buy now|add to wishlist/i,
    /account & lists|returns.*orders/i,
    /fulfilled by|sold by|cash on.*delivery/i,
    /return(s|able|ing)|refund|replacement|warranty|eligible for/i,
    /contact us|about us|careers|press|corporate|registered office/i,
    /payments|shipping|cancellation|telephone:|tel:/i,
    /cookie|privacy policy|terms of (use|service)|copyright/i,
    /\d+%\s*OFF|₹\s*\d+.*₹\s*\d+|hot deal|bestseller/i,
    /to move between items|click to see|visit the.*store/i,
    /tap on the category|360.*view|all categories/i,
    /explore more|similar items|compare with/i,
    /ratings and reviews|based on \d+.*ratings/i,
    /features customers loved|questions and answers/i,
    /be the first to (ask|review)|no questions.*available/i,
    /show all reviews|see more product details/i,
    /looking for something.*web address|go back to.*home page/i,
    /report (an )?issue|your recently viewed/i,
    /subscribe & save|manage your content/i,
    /image (not available|unavailable)/i,
    /view or edit your browsing/i,
    /back to top|get to know us/i,
    /scalable cloud|audio books|movies.*tv.*celebrities/i,
    /make money with|product safety alerts/i,
    /instagram|recalls and product/i,
    /^sorry,? there was a problem/i,
    /^›|^---/,
    /we (work hard|don't (know|share))|your security/i,
    /payment security|encrypts your information/i,
    /credit card details|sell your information/i,
    /after viewing product detail/i,
    /navigate back to pages/i,
    /^(brand|operating system|memory|screen size|resolution)\s/i,
  ];
  for (const p of junk) if (p.test(text)) return true;
  return false;
}

function isProductDescription(text: string): boolean {
  // Product feature descriptions (manufacturer copy)
  const descPatterns = [
    /^[A-Z][A-Z\s]+—/,  // "DYNAMIC ISLAND COMES TO IPHONE 15 —"
    /^(classic|stylish|easy care|regular fit|clean look|featuring a|designed with|made from|with a regular)/i,
    /these (women's|men's|jeans|pants|shirts)/i,
    /comfortably at the natural waistline/i,
    /machine wash/i,
    /high-quality (denim|fabric|material)/i,
  ];
  for (const p of descPatterns) if (p.test(text)) return true;
  return false;
}

function isActualReview(text: string): boolean {
  if (text.length < 15 || text.length > 3000) return false;
  const words = text.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 3) return false;
  if (isJunkContent(text)) return false;
  if (isProductDescription(text)) return false;

  // Must contain personal opinion/experience language
  const firstPerson = /\b(i |i'|my |me |we |our |i've|i'd|i'm|mine)\b/i.test(text);
  const opinion = /\b(good|great|nice|bad|worst|best|love|hate|awesome|terrible|excellent|amazing|poor|decent|okay|fine|happy|disappointed|recommend|perfect|waste|worth|comfortable|beautiful|ugly|fantastic|horrible|outstanding|mediocre|superb|awful|pleased|annoyed|impressed|overpriced|solid|reliable|smooth|rough|sturdy|flimsy|genuine|fake|sucks|loved|dislike|enjoy|delighted)\b/i.test(text);
  const experience = /\b(bought|purchased|ordered|received|delivered|arrived|tried|tested|using|used|works|working|stopped|broke|broken|damaged)\b/i.test(text);
  const emoji = /[😀-🙏👍👎💯❤️🔥⭐🌟😍😡😢😊😤😭🙄👌👏💪🎉✨😎😐😑😂🤣🥰🥺🤮🤢😋🤔]/u.test(text);
  const rating = /\b\d\s*\/\s*5\b|\b\d\s*out of\s*5\b|\bstars?\b|\b★/i.test(text);

  return firstPerson || opinion || experience || emoji || rating;
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

  for (const block of markdown.split(/\n{2,}/)) addReview(block);
  for (const item of markdown.split(/\n[-•*]\s/)) addReview(item);

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
  const amazonMatch = url.match(/amazon\.(\w+(?:\.\w+)?)\/(?:.*?\/)?(?:dp|product|gp\/product)\/([A-Z0-9]{10})/i);
  if (amazonMatch) {
    const domain = amazonMatch[1];
    const asin = amazonMatch[2];
    const urls = [url];
    for (let i = 1; i <= Math.min(maxPages - 1, 4); i++) {
      urls.push(`https://www.amazon.${domain}/product-reviews/${asin}?reviewerType=all_reviews&sortBy=recent&pageNumber=${i}`);
    }
    return urls;
  }

  const flipkartMatch = url.match(/(flipkart\.com\/.+?\/p\/[a-z0-9]+)/i);
  if (flipkartMatch) {
    const base = flipkartMatch[1];
    return [url, ...Array.from({ length: maxPages - 1 }, (_, i) =>
      `https://www.${base}&page=${i + 2}`
    )];
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
  if (!response.ok) throw new Error(data.error || `Status ${response.status}`);

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
    const allReviews: string[] = [];
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
        if (newCount === 0 && i > 0) { console.log('No new reviews, stopping'); break; }
      } catch (err) {
        console.warn(`Failed page ${i + 1}:`, err);
        if (i === 0) break;
        continue;
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
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to scrape reviews' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
