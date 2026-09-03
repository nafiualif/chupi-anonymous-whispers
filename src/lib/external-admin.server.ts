// Server-only privileged client for the external Supabase project.
// Uses the service role key (bypasses RLS) — never import from client code.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { EXTERNAL_SUPABASE_URL } from "./supabase-external";

export function getExternalAdmin() {
  const serviceRoleKey = process.env["EXTERNAL_SUPABASE_SERVICE_ROLE_KEY"];
  if (!serviceRoleKey) {
    throw new Error(
      "Missing EXTERNAL_SUPABASE_SERVICE_ROLE_KEY secret. Add the service role key for your Supabase project.",
    );
  }
  return createClient<Database>(EXTERNAL_SUPABASE_URL, serviceRoleKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
