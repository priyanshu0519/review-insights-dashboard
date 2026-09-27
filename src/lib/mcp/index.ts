import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSessions from "./tools/list-analysis-sessions";
import getSession from "./tools/get-analysis-session";
import deleteSession from "./tools/delete-analysis-session";
import analyzeReviews from "./tools/analyze-reviews";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "review-insights-dashboard",
  title: "Review Insights Dashboard",
  version: "0.1.0",
  instructions:
    "Aspect-based sentiment analysis of product reviews. Use `analyze_reviews` to analyze review texts, `list_analysis_sessions` / `get_analysis_session` to browse saved results, and `delete_analysis_session` to remove one.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listSessions, getSession, deleteSession, analyzeReviews],
});
