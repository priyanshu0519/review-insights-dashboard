import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SentimentPrediction } from "@/lib/types";
import { ThumbsUp, ThumbsDown, Minus, TrendingUp } from "lucide-react";

interface SentimentResultProps {
  prediction: SentimentPrediction;
}

const sentimentConfig = {
  positive: {
    icon: ThumbsUp,
    bgClass: "bg-sentiment-positive/10",
    textClass: "text-sentiment-positive",
    borderClass: "border-sentiment-positive/30",
    label: "Positive",
  },
  negative: {
    icon: ThumbsDown,
    bgClass: "bg-sentiment-negative/10",
    textClass: "text-sentiment-negative",
    borderClass: "border-sentiment-negative/30",
    label: "Negative",
  },
  neutral: {
    icon: Minus,
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
    borderClass: "border-border",
    label: "Neutral",
  },
};

const SentimentResult = ({ prediction }: SentimentResultProps) => {
  const config = sentimentConfig[prediction.sentiment];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Prediction Result</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center gap-4 rounded-xl border p-5 ${config.bgClass} ${config.borderClass}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bgClass}`}>
            <Icon className={`h-6 w-6 ${config.textClass}`} />
          </div>
          <div>
            <p className={`text-xl font-bold ${config.textClass}`}>{config.label}</p>
            <p className="text-sm text-muted-foreground">
              Confidence: <span className="font-mono font-semibold">{(prediction.confidence * 100).toFixed(1)}%</span>
              <span className="ml-2 text-xs">Score: {prediction.score}</span>
            </p>
          </div>
        </div>

        <p className="line-clamp-3 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground italic">
          &ldquo;{prediction.text}&rdquo;
        </p>

        {prediction.aspects.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Detected Aspects
            </p>
            <div className="flex flex-wrap gap-1.5">
              {prediction.aspects.map((a) => (
                <Badge
                  key={a.aspect}
                  variant="outline"
                  className={`capitalize ${
                    a.sentiment === "positive"
                      ? "border-sentiment-positive/40 text-sentiment-positive"
                      : a.sentiment === "negative"
                      ? "border-sentiment-negative/40 text-sentiment-negative"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {a.aspect}: {a.sentiment}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentResult;
