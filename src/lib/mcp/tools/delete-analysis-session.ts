import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "delete_analysis_session",
  title: "Delete analysis session",
  description: "Permanently delete one of the signed-in user's saved sentiment analysis sessions.",
  inputSchema: {
    id: z.string().uuid().describe("The analysis session id to delete."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();

    const { error } = await supabaseForUser(ctx).from("analysis_sessions").delete().eq("id", id);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: `Deleted analysis session ${id}.` }],
      structuredContent: { deleted: id },
    };
  },
});
