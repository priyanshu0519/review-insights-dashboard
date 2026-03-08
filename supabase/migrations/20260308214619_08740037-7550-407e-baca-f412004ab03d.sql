-- Add user_id column to analysis_sessions
ALTER TABLE public.analysis_sessions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can delete analysis sessions" ON public.analysis_sessions;
DROP POLICY IF EXISTS "Anyone can insert analysis sessions" ON public.analysis_sessions;
DROP POLICY IF EXISTS "Anyone can read analysis sessions" ON public.analysis_sessions;

-- Create user-scoped RLS policies
CREATE POLICY "Users can read own sessions"
  ON public.analysis_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.analysis_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.analysis_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);