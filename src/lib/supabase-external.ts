// External Supabase project configuration.
// Both values are public (anon/publishable) credentials — safe to ship to the client.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const EXTERNAL_SUPABASE_URL = "https://xvkdtmywtnpbyxrsgekn.supabase.co";
export const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2a2R0bXl3dG5wYnl4cnNnZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMzI5OTIsImV4cCI6MjEwMzgwODk5Mn0.6tJghqWTf5VFEwyvjYxO-u4eC_n1OH9warn2kgtVupQ";

// Validates the bearer token against the external Supabase project and
// exposes an RLS-scoped client acting as the signed-in user.
export const requireExternalAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized: No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token || token.split(".").length !== 3) {
      throw new Error("Unauthorized: Invalid token");
    }

    const supabase = createClient<Database>(
      EXTERNAL_SUPABASE_URL,
      EXTERNAL_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      },
    );

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new Error("Unauthorized: Invalid token");
    }

    return next({
      context: {
        supabase,
        userId: data.user.id,
        claims: { sub: data.user.id },
      },
    });
  },
);
