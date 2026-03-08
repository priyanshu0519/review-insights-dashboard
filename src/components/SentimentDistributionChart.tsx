import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { SentimentDistribution } from "@/lib/types";

interface Props {
  distribution: SentimentDistribution;
}

const COLORS_MAP: Record<string, string> = {
  Positive: "hsl(145, 63%, 42%)",
  Negative: "hsl(12, 76%, 52%)",
  Neutral: "hsl(220, 9%, 64%)",
};

const SentimentDistributionChart = ({ distribution }: Props) => {
  const data = [
    { name: "Positive", value: distribution.positive },
    { name: "Negative", value: distribution.negative },
    { name: "Neutral", value: distribution.neutral },
  ].filter((d) => d.value > 0);

  const total = distribution.positive + distribution.negative + distribution.neutral;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-sm font-semibold">Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[240px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
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
                  fontSize: "0.7rem",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionChart;
