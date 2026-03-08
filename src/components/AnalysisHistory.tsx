import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  history: any[];
  onLoad: (session: any) => void;
}

const AnalysisHistory = ({ history, onLoad }: Props) => {
  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4" />
          Analysis History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {history.map((session) => (
            <button
              key={session.id}
              onClick={() => onLoad(session)}
              className="flex w-full items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{session.title || "Untitled"}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="capitalize">{session.source_type}</span>
                  <span>·</span>
                  <span>{session.total_analyzed} reviews</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex gap-2 text-xs">
                <span className="rounded-full bg-sentiment-positive/10 px-2 py-0.5 text-sentiment-positive font-medium">
                  {(session.distribution as any)?.positive || 0}+
                </span>
                <span className="rounded-full bg-sentiment-negative/10 px-2 py-0.5 text-sentiment-negative font-medium">
                  {(session.distribution as any)?.negative || 0}−
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisHistory;
