import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Minus, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SentimentPrediction, SentimentLabel } from "@/lib/types";

interface Props {
  predictions: SentimentPrediction[];
}

const TABS: { label: string; value: SentimentLabel | "all"; icon: typeof ThumbsUp }[] = [
  { label: "All", value: "all", icon: Minus },
  { label: "Positive", value: "positive", icon: ThumbsUp },
  { label: "Negative", value: "negative", icon: ThumbsDown },
  { label: "Neutral", value: "neutral", icon: Minus },
];

const PER_PAGE = 4;

const ReviewsByCategory = ({ predictions }: Props) => {
  const [tab, setTab] = useState<SentimentLabel | "all">("all");
  const [page, setPage] = useState(0);

  const filtered = tab === "all" ? predictions : predictions.filter((p) => p.sentiment === tab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);

  const counts = {
    all: predictions.length,
    positive: predictions.filter((p) => p.sentiment === "positive").length,
    negative: predictions.filter((p) => p.sentiment === "negative").length,
    neutral: predictions.filter((p) => p.sentiment === "neutral").length,
  };

  if (predictions.length === 0) return null;

  const getStars = (confidence: number, sentiment: string) => {
    if (sentiment === "positive") return Math.round(3 + confidence * 2);
    if (sentiment === "negative") return Math.round(1 + (1 - confidence));
    return 3;
  };

  const sentimentStyle = (s: SentimentLabel) =>
    s === "positive"
      ? "bg-sentiment-positive/10 text-sentiment-positive border-sentiment-positive/30"
      : s === "negative"
      ? "bg-sentiment-negative/10 text-sentiment-negative border-sentiment-negative/30"
      : "bg-muted text-muted-foreground border-border";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Reviews by Sentiment</CardTitle>
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.value;
            return (
              <Button
                key={t.value}
                variant={active ? "default" : "outline"}
                size="sm"
                className="h-7 gap-1.5 px-3 text-xs"
                onClick={() => { setTab(t.value); setPage(0); }}
              >
                <Icon className="h-3 w-3" />
                {t.label}
                <span className="ml-0.5 opacity-70">({counts[t.value]})</span>
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No reviews in this category.</p>
        ) : (
          visible.map((p, i) => {
            const stars = getStars(p.confidence, p.sentiment);
            return (
              <div
                key={i}
                className="rounded-lg border border-border/50 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= stars ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize px-1.5 py-0 ${sentimentStyle(p.sentiment)}`}
                    >
                      {p.sentiment}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {(p.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{p.text}</p>
                {p.aspects.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.aspects.map((a) => (
                      <Badge
                        key={a.aspect}
                        variant="outline"
                        className={`text-[10px] capitalize ${sentimentStyle(a.sentiment)}`}
                      >
                        {a.aspect}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium">
              {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsByCategory;
