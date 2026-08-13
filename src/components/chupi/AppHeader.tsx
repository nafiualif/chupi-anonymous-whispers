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
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-5 py-5">
      <Brand to="/dashboard" />
      <nav className="flex items-center gap-1">
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
    </header>
  );
}
