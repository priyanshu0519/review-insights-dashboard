import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WordFrequency } from "@/lib/types";

interface Props {
  wordFrequencies: WordFrequency[];
}

const COLORS = [
  "text-sentiment-positive",
  "text-primary",
  "text-sentiment-negative",
  "text-metric-purple",
  "text-muted-foreground",
  "text-metric-blue",
  "text-sentiment-positive",
  "text-sentiment-negative",
  "text-primary",
  "text-metric-purple",
];

const TopKeywords = ({ wordFrequencies }: Props) => {
  const words = wordFrequencies.slice(0, 10);
  if (words.length === 0) return null;

  const maxCount = Math.max(...words.map((w) => w.count));

  const getSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.75) return "text-2xl font-bold";
    if (ratio > 0.5) return "text-xl font-semibold";
    if (ratio > 0.25) return "text-base font-medium";
    return "text-sm font-normal";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Top Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-3 py-4">
          {words.map((w, i) => (
            <span
              key={w.word}
              className={`${getSize(w.count)} ${COLORS[i % COLORS.length]} transition-transform hover:scale-110 cursor-default`}
            >
              {w.word}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopKeywords;
