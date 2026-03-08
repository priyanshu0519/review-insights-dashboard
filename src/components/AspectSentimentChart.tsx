import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { SentimentPrediction } from "@/lib/types";
import { Layers } from "lucide-react";

interface Props {
  predictions: SentimentPrediction[];
}

const AspectSentimentChart = ({ predictions }: Props) => {
  const aspectMap: Record<string, { positive: number; negative: number; neutral: number }> = {};

  for (const p of predictions) {
    for (const a of p.aspects) {
      if (!aspectMap[a.aspect]) aspectMap[a.aspect] = { positive: 0, negative: 0, neutral: 0 };
      aspectMap[a.aspect][a.sentiment]++;
    }
  }

  const data = Object.entries(aspectMap)
    .map(([aspect, counts]) => ({
      aspect: aspect.charAt(0).toUpperCase() + aspect.slice(1),
      positive: counts.positive,
      negative: counts.negative,
      neutral: counts.neutral,
      total: counts.positive + counts.negative + counts.neutral,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Aspect-Based Sentiment</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          {data.length} product aspect{data.length !== 1 ? "s" : ""} detected
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="aspect" type="category" width={85} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontSize: "0.75rem",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              <Bar dataKey="positive" fill="hsl(152, 69%, 41%)" stackId="a" name="Positive" radius={[0, 0, 0, 0]} />
              <Bar dataKey="negative" fill="hsl(0, 72%, 51%)" stackId="a" name="Negative" />
              <Bar dataKey="neutral" fill="hsl(220, 9%, 58%)" stackId="a" name="Neutral" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AspectSentimentChart;
