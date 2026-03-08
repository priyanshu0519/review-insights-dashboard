import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { SentimentPrediction } from "@/lib/types";

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

  const data = Object.entries(aspectMap).map(([aspect, counts]) => ({
    aspect: aspect.charAt(0).toUpperCase() + aspect.slice(1),
    ...counts,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Aspect-Based Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="aspect" type="category" width={80} className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" fill="hsl(142, 71%, 45%)" stackId="a" name="Positive" />
              <Bar dataKey="negative" fill="hsl(0, 84%, 60%)" stackId="a" name="Negative" />
              <Bar dataKey="neutral" fill="hsl(215, 16%, 47%)" stackId="a" name="Neutral" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AspectSentimentChart;
