import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { AspectSummary } from "@/lib/types";
import { Layers } from "lucide-react";

interface Props {
  aspectSummary: AspectSummary[];
}

const AspectSentimentChart = ({ aspectSummary }: Props) => {
  const data = aspectSummary
    .filter((a) => a.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((a) => ({
      aspect: a.aspect.charAt(0).toUpperCase() + a.aspect.slice(1),
      positive: a.positive,
      negative: a.negative,
      neutral: a.neutral,
    }));

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Aspect-Based Sentiment</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          {data.length} product aspect{data.length !== 1 ? "s" : ""} detected in reviews
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
              <Bar dataKey="positive" fill="hsl(152, 69%, 41%)" stackId="a" name="Positive" />
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
