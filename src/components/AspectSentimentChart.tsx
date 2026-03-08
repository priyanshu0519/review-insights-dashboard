import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { AspectSummary } from "@/lib/types";

interface Props {
  aspectSummary: AspectSummary[];
}

const AspectSentimentChart = ({ aspectSummary }: Props) => {
  const data = aspectSummary
    .filter((a) => a.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((a) => ({
      aspect: a.aspect.charAt(0).toUpperCase() + a.aspect.slice(1),
      Positive: a.positive,
      Negative: a.negative,
      Neutral: a.neutral,
    }));

  if (data.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-sm font-semibold">Aspect-Based Sentiment</CardTitle>
      </CardHeader>
      <CardContent className="px-1 sm:px-6">
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 40, left: -15, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="aspect"
                angle={-35}
                textAnchor="end"
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontSize: "0.7rem",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "0.65rem" }} />
              <Bar dataKey="Positive" fill="hsl(145, 63%, 42%)" />
              <Bar dataKey="Negative" fill="hsl(12, 76%, 52%)" />
              <Bar dataKey="Neutral" fill="hsl(220, 9%, 64%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AspectSentimentChart;
