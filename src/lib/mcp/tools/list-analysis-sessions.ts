import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_analysis_sessions",
  title: "List analysis sessions",
  description:
    "List the signed-in user's saved sentiment analysis sessions with summary metrics (source, totals, sentiment distribution).",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Maximum number of sessions to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();

    const { data, error } = await supabaseForUser(ctx)
      .from("analysis_sessions")
      .select("id, title, source_type, source_url, total_analyzed, average_confidence, distribution, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { sessions: data ?? [] },
    };
  },
});
