import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import type { AspectSummary } from "@/lib/types";

interface Props {
  aspectSummary: AspectSummary[];
}

const AspectInsights = ({ aspectSummary }: Props) => {
  const top = aspectSummary
    .filter((a) => a.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  if (top.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Aspect Sentiment Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {top.map((a) => {
          const dominant =
            a.positive >= a.negative && a.positive >= a.neutral
              ? "positive"
              : a.negative >= a.positive && a.negative >= a.neutral
              ? "negative"
              : "neutral";

          const Icon = dominant === "positive" ? ThumbsUp : dominant === "negative" ? ThumbsDown : Minus;
          const colorClass =
            dominant === "positive"
              ? "text-sentiment-positive"
              : dominant === "negative"
              ? "text-sentiment-negative"
              : "text-sentiment-neutral";

          return (
            <div key={a.aspect} className="flex items-center gap-3">
              <Icon className={`h-5 w-5 shrink-0 ${colorClass}`} />
              <span className="text-sm font-medium capitalize text-foreground">{a.aspect}:</span>
              <span className={`text-sm font-semibold capitalize ${colorClass}`}>{dominant}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AspectInsights;
