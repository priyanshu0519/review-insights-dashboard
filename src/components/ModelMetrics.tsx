import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelMetricsData } from "@/lib/types";
import { Target, Crosshair, Undo2, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  metrics: ModelMetricsData;
}

const metricCards = [
  { key: "accuracy" as const, label: "Accuracy", icon: Target, color: "hsl(var(--primary))" },
  { key: "precision" as const, label: "Precision", icon: Crosshair, color: "hsl(var(--chart-positive))" },
  { key: "recall" as const, label: "Recall", icon: Undo2, color: "hsl(var(--chart-negative))" },
  { key: "f1Score" as const, label: "F1 Score", icon: Activity, color: "hsl(var(--chart-neutral))" },
];

const ModelMetrics = ({ metrics }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metricCards.map(({ key, label, icon: Icon }) => {
        const value = metrics[key] * 100;
        return (
          <Card key={key} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-primary/60" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold tabular-nums text-foreground font-mono">
                {value.toFixed(1)}%
              </p>
              <Progress value={value} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ModelMetrics;
