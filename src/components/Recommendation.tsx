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
      title: "Recommended",
      titleFull: "Recommended to Buy",
      subtitle: "This product has overwhelmingly positive feedback",
      color: "text-sentiment-positive",
      bg: "bg-sentiment-positive/10",
      border: "border-sentiment-positive/30",
      badge: "bg-sentiment-positive text-white",
    },
    not_recommended: {
      icon: ShieldAlert,
      title: "Not Recommended",
      titleFull: "Not Recommended",
      subtitle: "This product has significant negative feedback",
      color: "text-sentiment-negative",
      bg: "bg-sentiment-negative/10",
      border: "border-sentiment-negative/30",
      badge: "bg-sentiment-negative text-white",
    },
    mixed: {
      icon: ShieldQuestion,
      title: "Consider",
      titleFull: "Consider Carefully",
      subtitle: "Mixed reviews — weigh the pros and cons",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      badge: "bg-yellow-500 text-white",
    },
  };

  const c = config[verdict];
  const Icon = c.icon;

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
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className="text-sm font-semibold">Purchase Recommendation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6 sm:space-y-5">
        {/* Main verdict */}
        <div className={`flex flex-col items-center gap-3 rounded-xl border p-4 sm:flex-row sm:gap-4 sm:p-5 ${c.bg} ${c.border}`}>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${c.bg} sm:h-14 sm:w-14`}>
            <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${c.color}`} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
              <p className={`text-lg font-bold sm:text-xl ${c.color}`}>
                <span className="sm:hidden">{c.title}</span>
                <span className="hidden sm:inline">{c.titleFull}</span>
              </p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-xs sm:px-2.5 ${c.badge}`}>
                {score}% {verdict === "not_recommended" ? "negative" : "positive"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{c.subtitle}</p>
          </div>
        </div>

        {/* Pros & Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {pros.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sentiment-positive sm:text-xs">
                  ✓ Strengths
                </p>
                {pros.map((a) => (
                  <div key={a.aspect} className="flex items-center gap-2 rounded-lg bg-sentiment-positive/5 px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-sentiment-positive sm:h-4 sm:w-4" />
                    <span className="text-xs capitalize text-foreground sm:text-sm">{a.aspect}</span>
                    <span className="ml-auto text-[10px] font-mono text-sentiment-positive sm:text-xs">
                      {a.positive}+
                    </span>
                  </div>
                ))}
              </div>
            )}
            {cons.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sentiment-negative sm:text-xs">
                  ✗ Weaknesses
                </p>
                {cons.map((a) => (
                  <div key={a.aspect} className="flex items-center gap-2 rounded-lg bg-sentiment-negative/5 px-2.5 py-1.5 sm:px-3 sm:py-2">
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-sentiment-negative sm:h-4 sm:w-4" />
                    <span className="text-xs capitalize text-foreground sm:text-sm">{a.aspect}</span>
                    <span className="ml-auto text-[10px] font-mono text-sentiment-negative sm:text-xs">
                      {a.negative}−
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {cautions.length > 0 && (
          <div className="space-y-1.5 sm:space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
              ⚠ Needs More Data
            </p>
            {cautions.map((a) => (
              <div key={a.aspect} className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 sm:px-3 sm:py-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
                <span className="text-xs capitalize text-foreground sm:text-sm">{a.aspect}</span>
                <span className="ml-auto text-[10px] text-muted-foreground sm:text-xs">{a.neutral} neutral</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center pt-1 sm:text-xs sm:pt-2">
          Based on {total} review{total !== 1 ? "s" : ""} · AI confidence: {(averageConfidence * 100).toFixed(0)}%
        </p>
      </CardContent>
    </Card>
  );
};

export default Recommendation;
