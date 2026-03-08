import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { History, Clock, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  history: any[];
  onLoad: (session: any) => void;
}

const PER_PAGE = 5;
const SOURCE_FILTERS = ["all", "single", "csv", "scrape"] as const;

const AnalysisHistory = ({ history, onLoad }: Props) => {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let items = history;
    if (sourceFilter !== "all") {
      items = items.filter((s) => s.source_type === sourceFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(q) ||
          (s.source_url || "").toLowerCase().includes(q)
      );
    }
    return items;
  }, [history, sourceFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);

  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4" />
          Analysis History
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({filtered.length} result{filtered.length !== 1 ? "s" : ""})
          </span>
        </CardTitle>

        {/* Filters row */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-8 pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {SOURCE_FILTERS.map((f) => (
              <Button
                key={f}
                variant={sourceFilter === f ? "default" : "outline"}
                size="sm"
                className="h-7 px-2.5 text-xs capitalize"
                onClick={() => { setSourceFilter(f); setPage(0); }}
              >
                {f === "all" ? "All" : f}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No matching sessions found.</p>
        ) : (
          <div className="space-y-2">
            {visible.map((session) => (
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisHistory;
