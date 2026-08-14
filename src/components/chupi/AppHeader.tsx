import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Inbox, LogOut, Settings } from "lucide-react";
import { Brand } from "./Brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-md md:static md:border-0 md:bg-transparent md:backdrop-blur-none">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-3.5 sm:px-5 md:py-5">
        <Brand to="/dashboard" />
        {/* Mobile uses the bottom nav; these are the desktop controls. */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Inbox">
              <Inbox className="size-5" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Settings">
              <Settings className="size-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Sign out"
            onClick={signOut}
          >
            <LogOut className="size-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
