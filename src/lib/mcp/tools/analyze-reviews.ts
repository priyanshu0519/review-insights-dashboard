import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "analyze_reviews",
  title: "Analyze reviews",
  description:
    "Run aspect-based sentiment analysis on up to 40 review texts and save the result to the signed-in user's history. Returns sentiment distribution, aspect summary, top keywords and average confidence.",
  inputSchema: {
    reviews: z.array(z.string().min(1)).min(1).max(40).describe("Review texts to analyze."),
    title: z.string().optional().describe("Optional label for the saved analysis session."),
  },
  annotations: { readOnlyHint: false, openWorldHint: true },
  handler: async ({ reviews, title }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauthenticated();

    const baseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!baseUrl || !anonKey) {
      return { content: [{ type: "text", text: "Backend is not configured." }], isError: true };
    }

    const res = await fetch(`${baseUrl}/functions/v1/analyze-sentiment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${ctx.getToken()}`,
      },
      body: JSON.stringify({ reviews }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      return {
        content: [{ type: "text", text: data?.error ?? `Analysis failed with status ${res.status}.` }],
        isError: true,
      };
    }

    const summary = {
      totalAnalyzed: data.totalAnalyzed,
      averageConfidence: data.averageConfidence,
      distribution: data.distribution,
      aspectSummary: data.aspectSummary,
      wordFrequencies: data.wordFrequencies,
    };

    const { data: inserted } = await supabaseForUser(ctx)
      .from("analysis_sessions")
      .insert({
        user_id: ctx.getUserId(),
        source_type: "mcp",
        title: title ?? `MCP analysis (${reviews.length} reviews)`,
        total_analyzed: data.totalAnalyzed,
        average_confidence: data.averageConfidence,
        distribution: data.distribution,
        aspect_summary: data.aspectSummary,
        word_frequencies: data.wordFrequencies,
        predictions: data.predictions,
      })
      .select("id")
      .maybeSingle();

    return {
      content: [{ type: "text", text: JSON.stringify({ ...summary, sessionId: inserted?.id ?? null }, null, 2) }],
      structuredContent: { ...summary, sessionId: inserted?.id ?? null },
    };
  },
});
