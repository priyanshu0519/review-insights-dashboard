import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SentimentDistribution } from "@/lib/types";

interface Props {
  distribution: SentimentDistribution;
  averageConfidence: number;
  totalAnalyzed: number;
}

const OverallRating = ({ distribution, averageConfidence, totalAnalyzed }: Props) => {
  const total = distribution.positive + distribution.negative + distribution.neutral;
  if (total === 0) return null;

  const posRatio = distribution.positive / total;
  const negRatio = distribution.negative / total;
  // Rating out of 5: weighted by sentiment distribution
  const rating = Math.min(5, Math.max(1, 1 + posRatio * 4 - negRatio * 2));
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const trend = posRatio > 0.5 ? "positive" : negRatio > 0.5 ? "negative" : "mixed";
  const TrendIcon = trend === "positive" ? TrendingUp : trend === "negative" ? TrendingDown : Minus;
  const trendColor =
    trend === "positive"
      ? "text-sentiment-positive"
      : trend === "negative"
      ? "text-sentiment-negative"
      : "text-muted-foreground";
  const trendLabel =
    trend === "positive"
      ? "Mostly Positive"
      : trend === "negative"
      ? "Mostly Negative"
      : "Mixed Feedback";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Overall Rating</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 py-2">
          {/* Big rating number */}
          <p className="text-5xl font-extrabold font-mono text-foreground">{rating.toFixed(1)}</p>

          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => (
              <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            {hasHalf && (
              <div className="relative h-5 w-5">
                <Star className="absolute h-5 w-5 text-muted-foreground/30" />
                <div className="absolute overflow-hidden" style={{ width: "50%" }}>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            )}
            {Array.from({ length: emptyStars }).map((_, i) => (
              <Star key={`empty-${i}`} className="h-5 w-5 text-muted-foreground/30" />
            ))}
          </div>

          <p className="text-xs text-muted-foreground">Based on {totalAnalyzed.toLocaleString()} reviews</p>

          {/* Trend */}
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
            trend === "positive" ? "bg-sentiment-positive/10" : trend === "negative" ? "bg-sentiment-negative/10" : "bg-muted"
          }`}>
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={`text-sm font-semibold ${trendColor}`}>{trendLabel}</span>
          </div>

          {/* Breakdown bars */}
          <div className="mt-2 w-full space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">Positive</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-sentiment-positive transition-all"
                  style={{ width: `${(posRatio * 100).toFixed(0)}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-mono font-medium text-foreground">
                {(posRatio * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">Negative</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-sentiment-negative transition-all"
                  style={{ width: `${(negRatio * 100).toFixed(0)}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-mono font-medium text-foreground">
                {(negRatio * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">Neutral</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-sentiment-neutral transition-all"
                  style={{ width: `${((distribution.neutral / total) * 100).toFixed(0)}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-mono font-medium text-foreground">
                {((distribution.neutral / total) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallRating;
