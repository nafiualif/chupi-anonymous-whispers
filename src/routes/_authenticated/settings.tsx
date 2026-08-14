import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AppHeader } from "@/components/chupi/AppHeader";
import { BottomNav } from "@/components/chupi/BottomNav";
import { SafetyFooter } from "@/components/chupi/Brand";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile } from "@/lib/chupi.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Chupi" },
      { name: "description", content: "Turn your public Chupi link on or off anytime." },
      { property: "og:title", content: "Settings — Chupi" },
      { property: "og:description", content: "Turn your public Chupi link on or off anytime." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const ensure = useServerFn(ensureProfile);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => ensure({ data: {} }),
  });

  const toggleLink = useMutation({
    mutationFn: async (enabled: boolean) => {
      const profile = profileQuery.data;
      if (!profile) return;
      const { error } = await supabase
        .from("profiles")
        .update({ link_enabled: enabled })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: (_d, enabled) => {
      toast.success(enabled ? "Your link is live again" : "Your link is turned off");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Couldn't update your link"),
  });

  const enabled = profileQuery.data?.link_enabled ?? true;

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl px-5">
        <h1 className="font-display text-xl font-bold">Settings</h1>

        <section className="mt-5 rounded-3xl border border-border/70 bg-card-gradient p-6 shadow-soft">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Label htmlFor="link-toggle" className="font-display text-base font-semibold">
                Public message link
              </Label>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Turn this off to temporarily stop receiving anonymous messages. Your existing inbox
                stays exactly as it is.
              </p>
            </div>
            <Switch
              id="link-toggle"
              checked={enabled}
              disabled={profileQuery.isLoading || toggleLink.isPending}
              onCheckedChange={(v) => toggleLink.mutate(v)}
            />
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-border/70 bg-card/70 p-6">
          <h2 className="font-display text-base font-semibold">Staying safe</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Chupi automatically blocks messages containing hate speech, harassment, sexual content
            or bullying. You can also report and delete anything that slips through.
          </p>
        </section>
      </main>

      <SafetyFooter />
    </div>
  );
}
