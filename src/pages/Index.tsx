import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import ReviewInput from "@/components/ReviewInput";
import CsvUpload from "@/components/CsvUpload";
import SentimentResult from "@/components/SentimentResult";
import SentimentDistributionChart from "@/components/SentimentDistributionChart";
import AspectSentimentChart from "@/components/AspectSentimentChart";
import WordFrequencyChart from "@/components/WordFrequencyChart";
import ModelMetrics from "@/components/ModelMetrics";
import ConfusionMatrix from "@/components/ConfusionMatrix";
import { analyzeSingleReview, analyzeCsvReviews } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";
import { MessageSquareText, FileUp } from "lucide-react";

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Input Section */}
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="single" className="flex-1 gap-2">
              <MessageSquareText className="h-4 w-4" />
              Single Review
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex-1 gap-2">
              <FileUp className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="mt-4 max-w-2xl">
            <ReviewInput onAnalyze={handleSingleReview} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="csv" className="mt-4 max-w-2xl">
            <CsvUpload onAnalyze={handleCsvReviews} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Model Metrics */}
            <ModelMetrics metrics={result.modelMetrics} />

            {/* Primary Results */}
            <div className="grid gap-6 md:grid-cols-2">
              {result.predictions.length === 1 && (
                <SentimentResult prediction={result.predictions[0]} />
              )}
              <SentimentDistributionChart distribution={result.distribution} />
            </div>

            {/* Detailed Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <AspectSentimentChart predictions={result.predictions} />
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
