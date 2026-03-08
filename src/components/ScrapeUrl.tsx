import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2 } from "lucide-react";

interface ScrapeUrlProps {
  onAnalyze: (reviews: string[]) => void;
  isLoading: boolean;
}

const ScrapeUrl = ({ onAnalyze, isLoading }: ScrapeUrlProps) => {
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) return;
    setScraping(true);
    setStatus("Scraping product page...");

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("scrape-reviews", {
        body: { url: url.trim() },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Scraping failed");

      const reviews: string[] = data.reviews || [];
      if (reviews.length === 0) {
        setStatus("No reviews found on this page. Try a product page with reviews.");
        return;
      }

      setStatus(`Found ${reviews.length} text blocks. Analyzing...`);
      onAnalyze(reviews);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setScraping(false);
    }
  };

  const busy = scraping || isLoading;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://www.amazon.com/product/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Paste a product URL from Amazon, Best Buy, or any e-commerce site with reviews.
      </p>
      <Button onClick={handleScrape} disabled={!url.trim() || busy} className="w-full">
        {busy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Globe className="mr-2 h-4 w-4" />
        )}
        {scraping ? "Scraping..." : isLoading ? "Analyzing..." : "Scrape & Analyze Reviews"}
      </Button>
      {status && (
        <p className={`text-sm ${status.startsWith("Error") ? "text-destructive" : "text-muted-foreground"}`}>
          {status}
        </p>
      )}
    </div>
  );
};

export default ScrapeUrl;
