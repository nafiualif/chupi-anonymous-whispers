-- send_events is written/read only by the service role (which bypasses RLS).
-- Add an explicit deny-all policy for anon/authenticated so the table has a
-- documented default-deny posture instead of relying on the absence of policies.
CREATE POLICY "No direct client access to send events"
ON public.send_events
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);