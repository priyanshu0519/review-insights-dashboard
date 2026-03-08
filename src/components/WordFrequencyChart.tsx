import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { WordFrequency } from "@/lib/types";

interface Props {
  wordFrequencies: WordFrequency[];
}

const WordFrequencyChart = ({ wordFrequencies }: Props) => {
  const data = wordFrequencies.slice(0, 12);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Words</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="word" angle={-45} textAnchor="end" className="text-xs" interval={0} />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Frequency" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordFrequencyChart;
