import { Smile, Meh, Frown, FileText, CheckCircle } from "lucide-react";
import type { SentimentDistribution } from "@/lib/types";

interface Props {
  distribution: SentimentDistribution;
  totalAnalyzed: number;
  averageConfidence: number;
}

const MetricCards = ({ distribution, totalAnalyzed, averageConfidence }: Props) => {
  const total = distribution.positive + distribution.negative + distribution.neutral;
  const dominant =
    distribution.positive >= distribution.negative && distribution.positive >= distribution.neutral
      ? "Positive"
      : distribution.negative >= distribution.positive && distribution.negative >= distribution.neutral
      ? "Negative"
      : "Mixed";

  const SentimentIcon = dominant === "Positive" ? Smile : dominant === "Negative" ? Frown : Meh;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <div className="flex items-center gap-3 rounded-xl bg-sentiment-positive px-4 py-3 text-white shadow-md sm:gap-4 sm:px-5 sm:py-4">
        <SentimentIcon className="h-8 w-8 shrink-0 opacity-90 sm:h-10 sm:w-10" />
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-90 sm:text-sm">Overall Sentiment:</p>
          <p className="text-lg font-bold sm:text-xl">{dominant}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-metric-blue px-4 py-3 text-white shadow-md sm:gap-4 sm:px-5 sm:py-4">
        <FileText className="h-8 w-8 shrink-0 opacity-90 sm:h-10 sm:w-10" />
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-90 sm:text-sm">Total Reviews:</p>
          <p className="text-lg font-bold font-mono sm:text-xl">{totalAnalyzed.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-metric-purple px-4 py-3 text-white shadow-md sm:gap-4 sm:px-5 sm:py-4">
        <CheckCircle className="h-8 w-8 shrink-0 opacity-90 sm:h-10 sm:w-10" />
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-90 sm:text-sm">Model Accuracy:</p>
          <p className="text-lg font-bold font-mono sm:text-xl">{(averageConfidence * 100).toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCards;
