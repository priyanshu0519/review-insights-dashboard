import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModelMetricsData } from "@/lib/types";
import { Target, Crosshair, Undo2, Activity } from "lucide-react";

interface Props {
  metrics: ModelMetricsData;
}

const metricCards = [
  { key: "accuracy" as const, label: "Accuracy", icon: Target },
  { key: "precision" as const, label: "Precision", icon: Crosshair },
  { key: "recall" as const, label: "Recall", icon: Undo2 },
  { key: "f1Score" as const, label: "F1 Score", icon: Activity },
];

const ModelMetrics = ({ metrics }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metricCards.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {(metrics[key] * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModelMetrics;
