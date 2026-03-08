import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, ShieldQuestion, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { SentimentDistribution, AspectSummary } from "@/lib/types";

interface Props {
  distribution: SentimentDistribution;
  averageConfidence: number;
  aspectSummary: AspectSummary[];
}

const Recommendation = ({ distribution, averageConfidence, aspectSummary }: Props) => {
  const total = distribution.positive + distribution.negative + distribution.neutral;
  if (total === 0) return null;

  const posRatio = distribution.positive / total;
  const negRatio = distribution.negative / total;

  // Determine recommendation
  type Verdict = "recommended" | "not_recommended" | "mixed";
  let verdict: Verdict;
  let score: number;

  if (posRatio >= 0.6) {
    verdict = "recommended";
    score = Math.round(posRatio * 100);
  } else if (negRatio >= 0.5) {
    verdict = "not_recommended";
    score = Math.round(negRatio * 100);
  } else {
    verdict = "mixed";
    score = Math.round(posRatio * 100);
  }

  const config = {
    recommended: {
      icon: ShieldCheck,
      title: "Recommended to Buy",
      subtitle: "This product has overwhelmingly positive feedback",
      color: "text-sentiment-positive",
      bg: "bg-sentiment-positive/10",
      border: "border-sentiment-positive/30",
      badge: "bg-sentiment-positive text-white",
    },
    not_recommended: {
      icon: ShieldAlert,
      title: "Not Recommended",
      subtitle: "This product has significant negative feedback",
      color: "text-sentiment-negative",
      bg: "bg-sentiment-negative/10",
      border: "border-sentiment-negative/30",
      badge: "bg-sentiment-negative text-white",
    },
    mixed: {
      icon: ShieldQuestion,
      title: "Consider Carefully",
      subtitle: "This product has mixed reviews — weigh the pros and cons",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      badge: "bg-yellow-500 text-white",
    },
  };

  const c = config[verdict];
  const Icon = c.icon;

  // Top pros & cons from aspects
  const pros = aspectSummary
    .filter((a) => a.positive > a.negative && a.total > 0)
    .sort((a, b) => b.positive - a.positive)
    .slice(0, 3);

  const cons = aspectSummary
    .filter((a) => a.negative > a.positive && a.total > 0)
    .sort((a, b) => b.negative - a.negative)
    .slice(0, 3);

  const cautions = aspectSummary
    .filter((a) => a.neutral >= a.positive && a.neutral >= a.negative && a.total > 0)
    .slice(0, 2);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Purchase Recommendation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Main verdict */}
        <div className={`flex items-center gap-4 rounded-xl border p-5 ${c.bg} ${c.border}`}>
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${c.bg}`}>
            <Icon className={`h-8 w-8 ${c.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`text-xl font-bold ${c.color}`}>{c.title}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.badge}`}>
                {score}% {verdict === "not_recommended" ? "negative" : "positive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
          </div>
        </div>

        {/* Pros & Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Pros */}
            {pros.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-sentiment-positive">
                  ✓ Strengths
                </p>
                {pros.map((a) => (
                  <div key={a.aspect} className="flex items-center gap-2 rounded-lg bg-sentiment-positive/5 px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-sentiment-positive" />
                    <span className="text-sm capitalize text-foreground">{a.aspect}</span>
                    <span className="ml-auto text-xs font-mono text-sentiment-positive">
                      {a.positive} positive
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Cons */}
            {cons.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-sentiment-negative">
                  ✗ Weaknesses
                </p>
                {cons.map((a) => (
                  <div key={a.aspect} className="flex items-center gap-2 rounded-lg bg-sentiment-negative/5 px-3 py-2">
                    <XCircle className="h-4 w-4 shrink-0 text-sentiment-negative" />
                    <span className="text-sm capitalize text-foreground">{a.aspect}</span>
                    <span className="ml-auto text-xs font-mono text-sentiment-negative">
                      {a.negative} negative
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cautions */}
        {cautions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ⚠ Needs More Data
            </p>
            {cautions.map((a) => (
              <div key={a.aspect} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm capitalize text-foreground">{a.aspect}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {a.neutral} neutral
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Confidence note */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Based on {total} review{total !== 1 ? "s" : ""} · AI confidence: {(averageConfidence * 100).toFixed(0)}%
        </p>
      </CardContent>
    </Card>
  );
};

export default Recommendation;
