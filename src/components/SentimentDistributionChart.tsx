import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { SentimentDistribution } from "@/lib/types";

interface Props {
  distribution: SentimentDistribution;
}

const COLORS = ["hsl(142, 71%, 45%)", "hsl(0, 84%, 60%)", "hsl(215, 16%, 47%)"];

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
        <CardTitle className="text-base">Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name} ${((value / total) * 100).toFixed(0)}%`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionChart;
