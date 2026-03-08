import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import ReviewInput from "@/components/ReviewInput";
import CsvUpload from "@/components/CsvUpload";
import ScrapeUrl from "@/components/ScrapeUrl";
import SentimentResult from "@/components/SentimentResult";
import SentimentDistributionChart from "@/components/SentimentDistributionChart";
import AspectSentimentChart from "@/components/AspectSentimentChart";
import WordFrequencyChart from "@/components/WordFrequencyChart";
import AnalysisMetrics from "@/components/AnalysisMetrics";
import { analyzeSingleReview, analyzeCsvReviews, analyzeScrapedReviews, fetchAnalysisHistory } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { MessageSquareText, FileUp, Globe, TrendingUp, AlertCircle, History, Clock, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalysisHistory().then(setHistory).catch(console.error);
  }, []);

  const refreshHistory = () => {
    fetchAnalysisHistory().then(setHistory).catch(console.error);
  };

  const handleSingleReview = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyzeSingleReview(text);
      setResult(res);
      refreshHistory();
      toast({ title: "Analysis Complete", description: "AI-powered sentiment analysis done." });
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
      refreshHistory();
      toast({ title: "Analysis Complete", description: `${res.totalAnalyzed} reviews analyzed with AI.` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrape = async (reviews: string[], url: string, title: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyzeScrapedReviews(reviews, url, title);
      setResult(res);
      refreshHistory();
      toast({ title: "Analysis Complete", description: `${res.totalAnalyzed} scraped reviews analyzed with AI.` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (session: any) => {
    setResult({
      predictions: session.predictions || [],
      distribution: session.distribution || { positive: 0, negative: 0, neutral: 0 },
      aspectSummary: session.aspect_summary || [],
      wordFrequencies: session.word_frequencies || [],
      totalAnalyzed: session.total_analyzed || 0,
      averageConfidence: Number(session.average_confidence) || 0,
    });
    setError(null);
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

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4 animate-pulse">
            <Brain className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-primary">AI is analyzing your reviews... This may take a moment.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 rounded-xl bg-accent/60 p-4">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
              <p className="text-sm font-medium text-accent-foreground">
                Analyzed <span className="font-bold">{result.totalAnalyzed}</span> review{result.totalAnalyzed !== 1 ? "s" : ""}
                {" · "}Avg confidence: <span className="font-mono font-bold">{(result.averageConfidence * 100).toFixed(1)}%</span>
                {hasAspects && ` · ${result.aspectSummary.length} aspects detected`}
                {" · "}<span className="text-xs opacity-70">Powered by AI</span>
              </p>
            </div>

            <AnalysisMetrics
              totalAnalyzed={result.totalAnalyzed}
              averageConfidence={result.averageConfidence}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              {result.predictions.length === 1 && (
                <SentimentResult prediction={result.predictions[0]} />
              )}
              <SentimentDistributionChart distribution={result.distribution} />
            </div>

            <div className={`grid gap-6 ${hasAspects ? "lg:grid-cols-2" : ""}`}>
              {hasAspects && (
                <AspectSentimentChart aspectSummary={result.aspectSummary} />
              )}
              <WordFrequencyChart wordFrequencies={result.wordFrequencies} />
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4" />
                Analysis History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {history.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadFromHistory(session)}
                    className="flex w-full items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{session.title || "Untitled"}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="capitalize">{session.source_type}</span>
                        <span>·</span>
                        <span>{session.total_analyzed} reviews</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2 text-xs">
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-green-700 dark:text-green-400">
                        {(session.distribution as any)?.positive || 0}+
                      </span>
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-red-700 dark:text-red-400">
                        {(session.distribution as any)?.negative || 0}−
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
