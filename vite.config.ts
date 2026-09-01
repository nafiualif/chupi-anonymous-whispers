// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // The anon key is intentionally public: it identifies the backend project
    // while row-level security remains responsible for data access.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        "https://xvkdtmywtnpbyxrsgekn.supabase.co",
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2a2R0bXl3dG5wYnl4cnNnZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMzI5OTIsImV4cCI6MjEwMzgwODk5Mn0.6tJghqWTf5VFEwyvjYxO-u4eC_n1OH9warn2kgtVupQ",
      ),
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
