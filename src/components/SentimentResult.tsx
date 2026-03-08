import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SentimentPrediction } from "@/lib/types";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface SentimentResultProps {
  prediction: SentimentPrediction;
}

const sentimentConfig = {
  positive: { icon: ThumbsUp, className: "bg-sentiment-positive/10 text-sentiment-positive border-sentiment-positive/30" },
  negative: { icon: ThumbsDown, className: "bg-sentiment-negative/10 text-sentiment-negative border-sentiment-negative/30" },
  neutral: { icon: Minus, className: "bg-sentiment-neutral/10 text-sentiment-neutral border-sentiment-neutral/30" },
};

const SentimentResult = ({ prediction }: SentimentResultProps) => {
  const config = sentimentConfig[prediction.sentiment];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Prediction Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`flex items-center gap-3 rounded-lg border p-4 ${config.className}`}>
          <Icon className="h-6 w-6" />
          <div>
            <p className="text-lg font-bold capitalize">{prediction.sentiment}</p>
            <p className="text-sm opacity-80">
              Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground italic">
          &ldquo;{prediction.text}&rdquo;
        </p>
        {prediction.aspects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {prediction.aspects.map((a) => (
              <Badge
                key={a.aspect}
                variant="outline"
                className={
                  a.sentiment === "positive"
                    ? "border-sentiment-positive/40 text-sentiment-positive"
                    : a.sentiment === "negative"
                    ? "border-sentiment-negative/40 text-sentiment-negative"
                    : "border-sentiment-neutral/40 text-sentiment-neutral"
                }
              >
                {a.aspect}: {a.sentiment}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentResult;
