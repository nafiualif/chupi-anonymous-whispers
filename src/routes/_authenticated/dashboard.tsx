import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Ban, Copy, Flag, Instagram, MessageCircleHeart, Share2, Trash2 } from "lucide-react";

import { AppHeader } from "@/components/chupi/AppHeader";
import { BottomNav } from "@/components/chupi/BottomNav";
import { SafetyFooter } from "@/components/chupi/Brand";
import { StoryCardDialog } from "@/components/chupi/StoryCardDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { blockMessageSender, ensureProfile, reportMessage } from "@/lib/chupi.functions";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your inbox — Chupi" },
      { name: "robots", content: "noindex, nofollow" },

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
  sender_hash: string | null;
};

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "hate", label: "Hate/Abuse" },
  { value: "sexual", label: "Sexual Content" },
  { value: "other", label: "Other" },
] as const;

function Dashboard() {
  const queryClient = useQueryClient();
  const ensure = useServerFn(ensureProfile);
  const report = useServerFn(reportMessage);
  const block = useServerFn(blockMessageSender);
  const [storyMessage, setStoryMessage] = useState<Message | null>(null);
  const [reportTarget, setReportTarget] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState<string>("harassment");

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => ensure({ data: {} }),
  });

  const messagesQuery = useQuery({
    queryKey: ["messages"],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, is_reported, reply, sender_hash")
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
    mutationFn: async (vars: { messageId: string; reason: string }) => {
      const res = await report({ data: vars });
      if (!res.ok) throw new Error("failed");
    },
    onSuccess: () => {
      toast.success("Reported. Thanks for flagging it — you can delete it too.");
      setReportTarget(null);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: () => toast.error("Couldn't report that message"),
  });

  const blockMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await block({ data: { messageId } });
      if (!res.ok) throw new Error(res.reason);
      return res;
    },
    onSuccess: () => toast.success("Sender blocked — they can't message you again."),
    onError: (e: Error) =>
      toast.error(
        e.message === "unknown_sender"
          ? "This message is too old to block its sender."
          : "Couldn't block that sender",
      ),
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

      <main className="mx-auto w-full max-w-3xl px-4 sm:px-5">
        <section className="rounded-3xl border border-border/70 bg-card-gradient p-5 shadow-soft sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your Chupi link
          </p>
          <p className="mt-2 break-all font-display text-base font-semibold sm:text-lg">
            {profileQuery.isLoading ? "Loading…" : link}
          </p>
          {profile && !profile.link_enabled && (
            <p className="mt-2 text-sm text-destructive">
              Your link is currently turned off — no one can send you messages.
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row">
            <Button
              onClick={copyLink}
              disabled={!link}
              className="h-11 rounded-full bg-brand-gradient shadow-soft active:scale-[0.98] sm:flex-1"
            >
              <Copy className="size-4" /> Copy link
            </Button>
            <Button
              onClick={shareToInstagram}
              disabled={!link}
              variant="outline"
              className="h-11 rounded-full bg-background/60 active:scale-[0.98] sm:flex-1"
            >
              <Instagram className="size-4" /> Share to story
            </Button>
          </div>
        </section>

        <section className="mt-6 sm:mt-8">
          <h1 className="font-display text-xl font-bold">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Newest first. Nothing here is linked to a sender.
          </p>

          <div className="mt-4 space-y-3 sm:mt-5">
            {messagesQuery.isLoading && (
              <div className="rounded-3xl border border-border/70 bg-card/70 p-5 text-sm text-muted-foreground sm:p-6">
                Loading your messages…
              </div>
            )}

            {messagesQuery.data?.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 p-7 text-center sm:p-10">
                <MessageCircleHeart className="mx-auto size-8 text-primary" />
                <p className="mt-3 font-display text-lg font-semibold">
                  Your Chupi is quiet… for now 👀
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share your link and the first letter will land right here.
                </p>
                <Button
                  onClick={copyLink}
                  disabled={!link}
                  className="mt-5 h-11 rounded-full bg-brand-gradient shadow-soft active:scale-[0.98]"
                >
                  <Copy className="size-4" /> Share your Chupi link
                </Button>
              </div>
            )}

            {messagesQuery.data?.map((m) => (
              <article
                key={m.id}
                className="letter-card rounded-3xl border border-border/70 bg-paper p-4 pt-7 shadow-soft sm:p-5 sm:pt-8"
              >
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed sm:text-base">
                  {m.content}
                </p>
                {m.reply && (
                  <p className="mt-3 rounded-2xl bg-accent/60 p-3 text-sm text-accent-foreground">
                    <span className="font-medium">Your reply: </span>
                    {m.reply}
                  </p>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString()}
                  {m.is_reported && " · reported"}
                </p>

                <div className="mt-2 flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 rounded-full px-3 text-xs active:scale-[0.97] sm:text-sm"
                    onClick={() => setStoryMessage(m)}
                  >
                    <Share2 className="size-4" /> Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto size-9 rounded-full p-0"
                    aria-label="Block this sender"
                    title="Block sender"
                    disabled={blockMutation.isPending}
                    onClick={() => blockMutation.mutate(m.id)}
                  >
                    <Ban className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="size-9 rounded-full p-0"
                    aria-label="Report this message"
                    title="Report"
                    disabled={m.is_reported}
                    onClick={() => {
                      setReportReason("harassment");
                      setReportTarget(m);
                    }}
                  >
                    <Flag className="size-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="size-9 rounded-full p-0 text-destructive hover:text-destructive"
                    aria-label="Delete this message"
                    title="Delete"
                    onClick={() => deleteMutation.mutate(m.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="pb-nav">
          <SafetyFooter />
        </div>
      </main>

      <StoryCardDialog
        message={storyMessage}
        displayName={profile?.display_name ?? ""}
        onOpenChange={(open) => !open && setStoryMessage(null)}
      />

      <Dialog open={!!reportTarget} onOpenChange={(open) => !open && setReportTarget(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Report this message</DialogTitle>
            <DialogDescription>
              Pick a reason. Reports are private and help us keep Chupi safe.
            </DialogDescription>
          </DialogHeader>

          <RadioGroup value={reportReason} onValueChange={setReportReason} className="gap-2">
            {REPORT_REASONS.map((r) => (
              <div key={r.value} className="flex items-center gap-3 rounded-2xl border border-border/70 p-3">
                <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                <Label htmlFor={`reason-${r.value}`} className="text-sm font-normal">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <DialogFooter>
            <Button
              className="h-11 w-full rounded-full bg-brand-gradient shadow-soft active:scale-[0.98]"
              disabled={reportMutation.isPending}
              onClick={() =>
                reportTarget &&
                reportMutation.mutate({ messageId: reportTarget.id, reason: reportReason })
              }
            >
              {reportMutation.isPending ? "Sending…" : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <BottomNav />
    </div>
  );
}
