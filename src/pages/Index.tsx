import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InputSection from "@/components/InputSection";
import MetricCards from "@/components/MetricCards";
import SentimentDistributionChart from "@/components/SentimentDistributionChart";
import AspectSentimentChart from "@/components/AspectSentimentChart";
import AspectInsights from "@/components/AspectInsights";
import TopKeywords from "@/components/TopKeywords";
import SampleReviews from "@/components/SampleReviews";
import AnalysisHistory from "@/components/AnalysisHistory";
import ModelEvaluation from "@/components/ModelEvaluation";
import ExportButtons from "@/components/ExportButtons";
import { analyzeSingleReview, analyzeCsvReviews, analyzeScrapedReviews, fetchAnalysisHistory } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { Brain, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      toast({ title: "Analysis Complete", description: `${res.totalAnalyzed} reviews analyzed.` });
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
      toast({ title: "Analysis Complete", description: `${res.totalAnalyzed} scraped reviews analyzed.` });
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
      <div className="space-y-6">
        {/* Input */}
        <InputSection
          onSingleReview={handleSingleReview}
          onCsvReviews={handleCsvReviews}
          onScrape={handleScrape}
          isLoading={isLoading}
        />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-xl bg-primary/10 p-5 animate-pulse-glow">
            <Brain className="h-6 w-6 text-primary" />
            <p className="text-sm font-semibold text-primary">AI is analyzing your reviews…</p>
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
            {/* Export */}
            <div className="flex justify-end">
              <ExportButtons result={result} />
            </div>
            {/* Metric Cards */}
            <MetricCards
              distribution={result.distribution}
              totalAnalyzed={result.totalAnalyzed}
              averageConfidence={result.averageConfidence}
            />

            {/* Charts Row 1: Pie + Aspect Insights */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SentimentDistributionChart distribution={result.distribution} />
              {hasAspects ? (
                <AspectInsights aspectSummary={result.aspectSummary} />
              ) : (
                <TopKeywords wordFrequencies={result.wordFrequencies} />
              )}
            </div>

            {/* Charts Row 2: Bar Chart + Keywords */}
            <div className="grid gap-6 lg:grid-cols-2">
              {hasAspects && <AspectSentimentChart aspectSummary={result.aspectSummary} />}
              {hasAspects ? (
                <TopKeywords wordFrequencies={result.wordFrequencies} />
              ) : null}
            </div>

            {/* Row 3: Sample Reviews + Model Evaluation */}
            <div className="grid gap-6 lg:grid-cols-2">
              <SampleReviews predictions={result.predictions} />
              <ModelEvaluation predictions={result.predictions} distribution={result.distribution} />
            </div>
          </div>
        )}

        {/* History */}
        <AnalysisHistory
          history={history}
          onLoad={loadFromHistory}
          onDelete={(id) => setHistory((prev) => prev.filter((s) => s.id !== id))}
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
