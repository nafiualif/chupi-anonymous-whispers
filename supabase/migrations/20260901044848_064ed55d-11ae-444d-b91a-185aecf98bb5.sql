-- Public profile lookups go through the getPublicProfile server function
-- (service role), so anonymous direct table access is not needed.
DROP POLICY "Profiles are publicly viewable" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);