import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface ScrapeUrlProps {
  onAnalyze: (reviews: string[]) => void;
  isLoading: boolean;
}

const ScrapeUrl = ({ onAnalyze, isLoading }: ScrapeUrlProps) => {
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [status, setStatus] = useState<{ type: "info" | "error" | "success"; message: string } | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) return;
    setScraping(true);
    setStatus({ type: "info", message: "Scraping product page..." });

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("scrape-reviews", {
        body: { url: url.trim() },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Scraping failed");

      const reviews: string[] = data.reviews || [];
      if (reviews.length === 0) {
        setStatus({ type: "error", message: "No reviews found on this page. Try a product page with customer reviews." });
        return;
      }

      setStatus({ type: "success", message: `Found ${reviews.length} text blocks — running sentiment analysis...` });
      onAnalyze(reviews);
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setScraping(false);
    }
  };

  const busy = scraping || isLoading;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Product URL</label>
        <Input
          type="url"
          placeholder="https://www.amazon.com/dp/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Paste a product URL from Amazon, Best Buy, Walmart, or any e-commerce site.
        </p>
      </div>
      <Button onClick={handleScrape} disabled={!url.trim() || busy} className="w-full">
        {busy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Globe className="mr-2 h-4 w-4" />
        )}
        {scraping ? "Scraping page..." : isLoading ? "Analyzing reviews..." : "Scrape & Analyze"}
      </Button>
      {status && (
        <div
          className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
            status.type === "error"
              ? "bg-destructive/10 text-destructive"
              : status.type === "success"
              ? "bg-sentiment-positive/10 text-sentiment-positive"
              : "bg-accent text-accent-foreground"
          }`}
        >
          {status.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};

export default ScrapeUrl;
