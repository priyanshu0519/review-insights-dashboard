import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelMetricsData } from "@/lib/types";
import { Grid3X3 } from "lucide-react";

interface Props {
  metrics: ModelMetricsData;
}

const ConfusionMatrix = ({ metrics }: Props) => {
  const max = Math.max(...metrics.confusionMatrix.flat());

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Confusion Matrix</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Model prediction accuracy breakdown</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actual ↓ / Predicted →
                </th>
                {metrics.labels.map((l) => (
                  <th key={l} className="p-2.5 text-center text-xs font-semibold text-muted-foreground">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.confusionMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-2.5 text-xs font-semibold text-muted-foreground">{metrics.labels[i]}</td>
                  {row.map((val, j) => {
                    const intensity = val / max;
                    const isDiagonal = i === j;
                    return (
                      <td
                        key={j}
                        className="p-2.5 text-center font-mono text-sm font-bold"
                        style={{
                          backgroundColor: isDiagonal
                            ? `hsla(var(--chart-positive) / ${intensity * 0.35})`
                            : `hsla(var(--chart-negative) / ${intensity * 0.2})`,
                          borderRadius: "0.375rem",
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfusionMatrix;
