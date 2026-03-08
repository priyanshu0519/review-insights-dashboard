import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import ReviewInput from "@/components/ReviewInput";
import CsvUpload from "@/components/CsvUpload";
import ScrapeUrl from "@/components/ScrapeUrl";
import SentimentResult from "@/components/SentimentResult";
import SentimentDistributionChart from "@/components/SentimentDistributionChart";
import AspectSentimentChart from "@/components/AspectSentimentChart";
import WordFrequencyChart from "@/components/WordFrequencyChart";
import AnalysisMetrics from "@/components/AnalysisMetrics";
import { analyzeSingleReview, analyzeCsvReviews, scrapeAndAnalyze } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { MessageSquareText, FileUp, Globe, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSingleReview = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyzeSingleReview(text);
      setResult(res);
      toast({ title: "Analysis Complete", description: "Review sentiment analyzed successfully." });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvReviews = async (reviews: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyzeCsvReviews(reviews);
      setResult(res);
      toast({ title: "Analysis Complete", description: `${res.totalAnalyzed} reviews analyzed.` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrape = async (reviews: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyzeCsvReviews(reviews);
      setResult(res);
      toast({ title: "Analysis Complete", description: `${res.totalAnalyzed} scraped reviews analyzed.` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const hasAspects = result && result.aspectSummary.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Input Section */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="mb-4 grid w-full max-w-lg grid-cols-3">
                <TabsTrigger value="single" className="gap-1.5 text-xs sm:text-sm">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Single</span> Review
                </TabsTrigger>
                <TabsTrigger value="csv" className="gap-1.5 text-xs sm:text-sm">
                  <FileUp className="h-3.5 w-3.5" />
                  CSV Upload
                </TabsTrigger>
                <TabsTrigger value="scrape" className="gap-1.5 text-xs sm:text-sm">
                  <Globe className="h-3.5 w-3.5" />
                  Scrape URL
                </TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="mt-0 max-w-2xl">
                <ReviewInput onAnalyze={handleSingleReview} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="csv" className="mt-0 max-w-2xl">
                <CsvUpload onAnalyze={handleCsvReviews} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="scrape" className="mt-0 max-w-2xl">
                <ScrapeUrl onAnalyze={handleScrape} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <div className="flex items-center gap-3 rounded-xl bg-accent/60 p-4">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
              <p className="text-sm font-medium text-accent-foreground">
                Analyzed <span className="font-bold">{result.totalAnalyzed}</span> review{result.totalAnalyzed !== 1 ? "s" : ""}
                {" · "}Avg confidence: <span className="font-mono font-bold">{(result.averageConfidence * 100).toFixed(1)}%</span>
                {hasAspects && ` · ${result.aspectSummary.length} aspects detected`}
              </p>
            </div>

            {/* Metrics */}
            <AnalysisMetrics
              totalAnalyzed={result.totalAnalyzed}
              averageConfidence={result.averageConfidence}
            />

            {/* Primary Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {result.predictions.length === 1 && (
                <SentimentResult prediction={result.predictions[0]} />
              )}
              <SentimentDistributionChart distribution={result.distribution} />
            </div>

            {/* Detailed Charts */}
            <div className={`grid gap-6 ${hasAspects ? "lg:grid-cols-2" : ""}`}>
              {hasAspects && (
                <AspectSentimentChart aspectSummary={result.aspectSummary} />
              )}
              <WordFrequencyChart wordFrequencies={result.wordFrequencies} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
