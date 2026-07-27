import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_analysis_session",
  title: "Get analysis session",
  description:
    "Get the full detail of one saved sentiment analysis session, including aspect summary, top keywords and per-review predictions.",
  inputSchema: {
    id: z.string().uuid().describe("The analysis session id returned by list_analysis_sessions."),
    include_predictions: z
      .boolean()
      .optional()
      .describe("Include the per-review predictions array (can be large). Default false."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, include_predictions }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();

    const { data, error } = await supabaseForUser(ctx)
      .from("analysis_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "No analysis session found with that id." }], isError: true };

    const session: Record<string, unknown> = { ...data };
    if (!include_predictions) delete session.predictions;

    return {
      content: [{ type: "text", text: JSON.stringify(session, null, 2) }],
      structuredContent: { session },
    };
  },
});
