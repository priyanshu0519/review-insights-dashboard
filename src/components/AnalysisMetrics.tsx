import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Crosshair, Undo2, Activity, Hash } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  totalAnalyzed: number;
  averageConfidence: number;
}

const metricCards = [
  { label: "Reviews Analyzed", icon: Hash, type: "count" as const },
  { label: "Avg Confidence", icon: Target, type: "confidence" as const },
];

const AnalysisMetrics = ({ totalAnalyzed, averageConfidence }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Reviews Analyzed
          </CardTitle>
          <Hash className="h-4 w-4 text-primary/60" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold tabular-nums text-foreground font-mono">
            {totalAnalyzed}
          </p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Avg Confidence
          </CardTitle>
          <Target className="h-4 w-4 text-primary/60" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-2xl font-bold tabular-nums text-foreground font-mono">
            {(averageConfidence * 100).toFixed(1)}%
          </p>
          <Progress value={averageConfidence * 100} className="mt-2 h-1.5" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisMetrics;
