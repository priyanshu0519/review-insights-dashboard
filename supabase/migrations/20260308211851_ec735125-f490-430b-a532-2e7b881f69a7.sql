CREATE POLICY "Anyone can delete analysis sessions"
  ON public.analysis_sessions FOR DELETE
  TO anon, authenticated
  USING (true);