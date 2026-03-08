
CREATE TABLE public.analysis_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL DEFAULT 'single',
  source_url TEXT,
  title TEXT,
  total_analyzed INTEGER NOT NULL DEFAULT 0,
  average_confidence NUMERIC(5,3),
  distribution JSONB NOT NULL DEFAULT '{}',
  aspect_summary JSONB NOT NULL DEFAULT '[]',
  word_frequencies JSONB NOT NULL DEFAULT '[]',
  predictions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read analysis sessions"
  ON public.analysis_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert analysis sessions"
  ON public.analysis_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
