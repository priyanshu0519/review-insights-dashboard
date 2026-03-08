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
import ModelMetrics from "@/components/ModelMetrics";
import ConfusionMatrix from "@/components/ConfusionMatrix";
import { analyzeSingleReview, analyzeCsvReviews } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { MessageSquareText, FileUp, Globe, TrendingUp } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSingleReview = async (text: string) => {
    setIsLoading(true);
    try {
      const res = await analyzeSingleReview(text);
      setResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvReviews = async (reviews: string[]) => {
    setIsLoading(true);
    try {
      const res = await analyzeCsvReviews(reviews);
      setResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  const totalReviews = result
    ? result.distribution.positive + result.distribution.negative + result.distribution.neutral
    : 0;

  const hasAspects = result?.predictions.some((p) => p.aspects.length > 0);

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
                <ScrapeUrl onAnalyze={handleCsvReviews} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary banner */}
            <div className="flex items-center gap-3 rounded-xl bg-accent/60 p-4">
              <TrendingUp className="h-5 w-5 text-accent-foreground" />
              <p className="text-sm font-medium text-accent-foreground">
                Analyzed <span className="font-bold">{totalReviews}</span> review{totalReviews !== 1 ? "s" : ""} 
                {hasAspects && " with aspect-level insights"}
              </p>
            </div>

            {/* Model Metrics */}
            <ModelMetrics metrics={result.modelMetrics} />

            {/* Primary Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {result.predictions.length === 1 && (
                <SentimentResult prediction={result.predictions[0]} />
              )}
              <SentimentDistributionChart distribution={result.distribution} />
            </div>

            {/* Detailed Charts — only show aspect chart if there are aspects */}
            <div className="grid gap-6 lg:grid-cols-2">
              {hasAspects && (
                <AspectSentimentChart predictions={result.predictions} />
              )}
              <WordFrequencyChart wordFrequencies={result.wordFrequencies} />
            </div>

            {/* Confusion Matrix */}
            <ConfusionMatrix metrics={result.modelMetrics} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
