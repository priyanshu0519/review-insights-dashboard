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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Overall Sentiment */}
      <div className="flex items-center gap-4 rounded-xl bg-sentiment-positive px-5 py-4 text-white shadow-md">
        <SentimentIcon className="h-10 w-10 shrink-0 opacity-90" />
        <div>
          <p className="text-sm font-medium opacity-90">Overall Sentiment:</p>
          <p className="text-xl font-bold">{dominant}</p>
        </div>
      </div>

      {/* Total Reviews */}
      <div className="flex items-center gap-4 rounded-xl bg-metric-blue px-5 py-4 text-white shadow-md">
        <FileText className="h-10 w-10 shrink-0 opacity-90" />
        <div>
          <p className="text-sm font-medium opacity-90">Total Reviews Analyzed:</p>
          <p className="text-xl font-bold font-mono">{totalAnalyzed.toLocaleString()}</p>
        </div>
      </div>

      {/* Model Accuracy / Confidence */}
      <div className="flex items-center gap-4 rounded-xl bg-metric-purple px-5 py-4 text-white shadow-md">
        <CheckCircle className="h-10 w-10 shrink-0 opacity-90" />
        <div>
          <p className="text-sm font-medium opacity-90">Model Accuracy:</p>
          <p className="text-xl font-bold font-mono">{(averageConfidence * 100).toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
};

export default MetricCards;
