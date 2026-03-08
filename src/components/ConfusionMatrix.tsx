import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelMetricsData } from "@/lib/types";

interface Props {
  metrics: ModelMetricsData;
}

const ConfusionMatrix = ({ metrics }: Props) => {
  const max = Math.max(...metrics.confusionMatrix.flat());

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Confusion Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left text-muted-foreground">Actual \ Predicted</th>
                {metrics.labels.map((l) => (
                  <th key={l} className="p-2 text-center font-medium text-muted-foreground">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.confusionMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 font-medium text-muted-foreground">{metrics.labels[i]}</td>
                  {row.map((val, j) => {
                    const intensity = val / max;
                    const isDiagonal = i === j;
                    return (
                      <td
                        key={j}
                        className="p-2 text-center font-mono font-semibold rounded"
                        style={{
                          backgroundColor: isDiagonal
                            ? `hsla(142, 71%, 45%, ${intensity * 0.4})`
                            : `hsla(0, 84%, 60%, ${intensity * 0.25})`,
                          color: "hsl(var(--foreground))",
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
