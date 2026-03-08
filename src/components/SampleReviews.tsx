import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import type { SentimentPrediction } from "@/lib/types";
import { useState } from "react";

interface Props {
  predictions: SentimentPrediction[];
}

const SampleReviews = ({ predictions }: Props) => {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(predictions.length / perPage);
  const visible = predictions.slice(page * perPage, (page + 1) * perPage);

  if (predictions.length === 0) return null;

  const getStars = (confidence: number, sentiment: string) => {
    if (sentiment === "positive") return Math.round(3 + confidence * 2);
    if (sentiment === "negative") return Math.round(1 + (1 - confidence));
    return 3;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Sample Reviews</CardTitle>
        <span className="text-xs text-muted-foreground">Recent</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {visible.map((p, i) => {
          const stars = getStars(p.confidence, p.sentiment);
          return (
            <div key={i} className="space-y-1 border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= stars ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          );
        })}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2 text-xs text-muted-foreground">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30"
            >
              ‹
            </button>
            <span>
              {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded px-2 py-1 hover:bg-muted disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SampleReviews;
