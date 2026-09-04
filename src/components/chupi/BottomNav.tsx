import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Inbox, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Inbox", icon: Inbox },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

/**
 * Mobile-first floating dock. Hidden on md+ where the header nav takes over.
 */
export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
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
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:hidden"
    >
      <ul className="mx-auto flex max-w-sm items-stretch justify-around rounded-full border border-border/50 bg-card/85 p-1.5 shadow-lift backdrop-blur-md">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <Link
              to={item.to}
              className="relative flex min-h-13 flex-col items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-200 active:scale-[0.94]"
              activeProps={{ className: "bg-background/80 text-primary shadow-soft" }}
            >
              <span className="relative">
                <item.icon className="size-5" aria-hidden="true" />
                {item.to === "/dashboard" && unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} unread`}
                    className={cn(
                      "absolute -right-1.5 -top-1 size-2 rounded-full bg-primary ring-2 ring-card",
                    )}
                  />
                )}
              </span>
              {item.label}
            </Link>
          </li>
        ))}
        <li className="flex-1">
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-13 w-full flex-col items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-200 active:scale-[0.94]"
          >
            <LogOut className="size-5" aria-hidden="true" />
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}
