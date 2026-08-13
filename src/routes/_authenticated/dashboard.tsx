import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Flag, Instagram, MessageCircleHeart, Share2, Trash2 } from "lucide-react";

import { AppHeader } from "@/components/chupi/AppHeader";
import { SafetyFooter } from "@/components/chupi/Brand";
import { StoryCardDialog } from "@/components/chupi/StoryCardDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile } from "@/lib/chupi.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your inbox — Chupi" },
      { name: "description", content: "Read the anonymous messages people sent you on Chupi." },
      { property: "og:title", content: "Your inbox — Chupi" },
      { property: "og:description", content: "Read the anonymous messages people sent you on Chupi." },
    ],
  }),
  component: Dashboard,
});

type Message = {
  id: string;
  content: string;
  created_at: string;
  is_reported: boolean;
  reply: string | null;
};

function Dashboard() {
  const queryClient = useQueryClient();
  const ensure = useServerFn(ensureProfile);
  const [storyMessage, setStoryMessage] = useState<Message | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => ensure({ data: {} }),
  });

  const messagesQuery = useQuery({
    queryKey: ["messages"],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, is_reported, reply")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: () => toast.error("Couldn't delete that message"),
  });

  const reportMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").update({ is_reported: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reported. Thanks for flagging it — you can delete it too.");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: () => toast.error("Couldn't report that message"),
  });

  const profile = profileQuery.data;
  const link =
    typeof window !== "undefined" && profile ? `${window.location.origin}/u/${profile.slug}` : "";

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied — go paste it in your bio!");
  }

  async function shareToInstagram() {
    const text = `Send me an anonymous message on Chupi 💜 ${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Chupi link", text, url: link });
        return;
      } catch {
        /* user dismissed */
      }
    }
    await navigator.clipboard.writeText(text);
    toast.success("Link copied — add it as a sticker in your Instagram story!");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl px-5">
        <section className="rounded-3xl border border-border/70 bg-card-gradient p-6 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your Chupi link
          </p>
          <p className="mt-2 break-all font-display text-lg font-semibold">
            {profileQuery.isLoading ? "Loading…" : link}
          </p>
          {profile && !profile.link_enabled && (
            <p className="mt-2 text-sm text-destructive">
              Your link is currently turned off — no one can send you messages.
            </p>
          )}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={copyLink}
              disabled={!link}
              className="rounded-full bg-brand-gradient shadow-soft sm:flex-1"
            >
              <Copy className="size-4" /> Copy link
            </Button>
            <Button
              onClick={shareToInstagram}
              disabled={!link}
              variant="outline"
              className="rounded-full bg-background/60 sm:flex-1"
            >
              <Instagram className="size-4" /> Share to story
            </Button>
          </div>
        </section>

        <section className="mt-8 pb-4">
          <h1 className="font-display text-xl font-bold">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Newest first. Nothing here is linked to a sender.
          </p>

          <div className="mt-5 space-y-3">
            {messagesQuery.isLoading && (
              <div className="rounded-3xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
                Loading your messages…
              </div>
            )}

            {messagesQuery.data?.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center">
                <MessageCircleHeart className="mx-auto size-8 text-primary" />
                <p className="mt-3 font-display text-lg font-semibold">No messages yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share your link and they'll start landing here.
                </p>
              </div>
            )}

            {messagesQuery.data?.map((m) => (
              <article
                key={m.id}
                className="letter-card rounded-3xl border border-border/70 bg-paper p-5 pt-8 shadow-soft"
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed">{m.content}</p>
                {m.reply && (
                  <p className="mt-3 rounded-2xl bg-accent/60 p-3 text-sm text-accent-foreground">
                    <span className="font-medium">Your reply: </span>
                    {m.reply}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-auto text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                    {m.is_reported && " · reported"}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => setStoryMessage(m)}
                  >
                    <Share2 className="size-4" /> Reply publicly
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    disabled={m.is_reported}
                    onClick={() => reportMutation.mutate(m.id)}
                  >
                    <Flag className="size-4" /> Report
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(m.id)}
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <StoryCardDialog
        message={storyMessage}
        displayName={profile?.display_name ?? ""}
        onOpenChange={(open) => !open && setStoryMessage(null)}
      />

      <SafetyFooter />
    </div>
  );
}
