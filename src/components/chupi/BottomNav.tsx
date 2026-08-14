import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Inbox, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { to: "/dashboard", label: "Inbox", icon: Inbox },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

/**
 * Mobile-first bottom navigation. Hidden on md+ where the header nav takes over.
 */
export function BottomNav() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/85 pb-safe backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <Link
              to={item.to}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors active:bg-accent/50"
              activeProps={{ className: "text-primary" }}
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        ))}
        <li className="flex-1">
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors active:bg-accent/50"
          >
            <LogOut className="size-5" aria-hidden="true" />
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}
