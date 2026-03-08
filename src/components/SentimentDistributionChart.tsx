import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { SentimentDistribution } from "@/lib/types";
import { PieChartIcon } from "lucide-react";

interface Props {
  distribution: SentimentDistribution;
}

const COLORS_MAP: Record<string, string> = {
  Positive: "hsl(152, 69%, 41%)",
  Negative: "hsl(0, 72%, 51%)",
  Neutral: "hsl(220, 9%, 58%)",
};

const SentimentDistributionChart = ({ distribution }: Props) => {
  const data = [
    { name: "Positive", value: distribution.positive },
    { name: "Negative", value: distribution.negative },
    { name: "Neutral", value: distribution.neutral },
  ].filter((d) => d.value > 0);

  const total = distribution.positive + distribution.negative + distribution.neutral;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Sentiment Distribution</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">{total} total reviews analyzed</p>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--card))"
                label={({ name, value }) => `${name} ${((value / total) * 100).toFixed(0)}%`}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS_MAP[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontSize: "0.75rem",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "0.75rem" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionChart;
