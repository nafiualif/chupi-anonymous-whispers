import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Copy, Loader2, MessageCircleHeart, RefreshCw } from "lucide-react";

import { AppHeader } from "@/components/chupi/AppHeader";
import { BottomNav } from "@/components/chupi/BottomNav";
import { SafetyFooter } from "@/components/chupi/Brand";
import { MessageCard, type InboxMessage } from "@/components/chupi/MessageCard";
import { ShareHub } from "@/components/chupi/ShareHub";
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
import { useLocalIdSet } from "@/lib/chupi-ui";
import { cn } from "@/lib/utils";

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

type Message = InboxMessage;

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "hate", label: "Hate/Abuse" },
  { value: "sexual", label: "Sexual Content" },
  { value: "other", label: "Other" },
] as const;

const FILTERS = [
  { key: "all", label: "All Whispers" },
  { key: "unread", label: "Unread" },
  { key: "saved", label: "Saved" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function Dashboard() {
  const queryClient = useQueryClient();
  const ensure = useServerFn(ensureProfile);
  const report = useServerFn(reportMessage);
  const block = useServerFn(blockMessageSender);
  const [storyMessage, setStoryMessage] = useState<Message | null>(null);
  const [reportTarget, setReportTarget] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState<string>("harassment");
  const [filter, setFilter] = useState<FilterKey>("all");

  const readSet = useLocalIdSet("chupi:read");
  const savedSet = useLocalIdSet("chupi:saved");
  const sharedSet = useLocalIdSet("chupi:shared");

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

  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);
  const unreadCount = messages.filter((m) => !readSet.ids.has(m.id)).length;
  const sharedCount = messages.filter((m) => sharedSet.ids.has(m.id)).length;

  const visible = useMemo(() => {
    if (filter === "unread") return messages.filter((m) => !readSet.ids.has(m.id));
    if (filter === "saved") return messages.filter((m) => savedSet.ids.has(m.id));
    return messages;
  }, [messages, filter, readSet.ids, savedSet.ids]);

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success("Link copied — go paste it in your bio!");
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl px-4 sm:px-5">
        <ShareHub
          displayName={profile?.display_name ?? ""}
          slug={profile?.slug}
          link={link}
          linkEnabled={profile?.link_enabled ?? true}
          loading={profileQuery.isLoading}
          stats={{ total: messages.length, unread: unreadCount, shared: sharedCount }}
        />

        <section className="mt-7 sm:mt-9">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold">Inbox</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Newest first. Nothing here is linked to a sender.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh messages"
              onClick={() => messagesQuery.refetch()}
              className="size-10 shrink-0 rounded-full text-muted-foreground transition-transform duration-150 active:scale-[0.94]"
            >
              <RefreshCw
                className={cn("size-4", messagesQuery.isFetching && "animate-spin")}
              />
            </Button>
          </div>

          {/* Filter pills with a sliding active indicator */}
          <div className="mt-4 flex w-full gap-1 rounded-full border border-border/60 bg-card/70 p-1">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "relative flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors duration-200 active:scale-[0.97] sm:text-sm",
                    active ? "text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-brand-gradient shadow-soft"
                    />
                  )}
                  <span className="relative">
                    {f.label}
                    {f.key === "unread" && unreadCount > 0 && ` · ${unreadCount}`}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3.5 sm:mt-5">
            {messagesQuery.isLoading && (
              <div className="flex items-center gap-2 rounded-3xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Gathering your whispers…
              </div>
            )}

            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((m, i) => (
                <MessageCard
                  key={m.id}
                  message={m}
                  index={i}
                  saved={savedSet.ids.has(m.id)}
                  unread={!readSet.ids.has(m.id)}
                  onSeen={() => readSet.add(m.id)}
                  onToggleSave={() => savedSet.toggle(m.id)}
                  onShare={() => {
                    readSet.add(m.id);
                    sharedSet.add(m.id);
                    setStoryMessage(m);
                  }}
                  onReport={() => {
                    setReportReason("harassment");
                    setReportTarget(m);
                  }}
                  onBlock={() => blockMutation.mutate(m.id)}
                  onDelete={() => deleteMutation.mutate(m.id)}
                />
              ))}
            </AnimatePresence>

            {!messagesQuery.isLoading && visible.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center sm:p-10"
              >
                <MessageCircleHeart className="mx-auto size-8 text-primary" />
                <p className="mt-3 font-display text-lg font-semibold">
                  {filter === "all"
                    ? "Your Chupi is quiet… for now 👀"
                    : filter === "unread"
                      ? "You're all caught up ✨"
                      : "Nothing saved yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filter === "saved"
                    ? "Tap the bookmark on a whisper to keep it here."
                    : "Share your link and the first letter will land right here."}
                </p>
                {filter !== "saved" && (
                  <Button
                    onClick={copyLink}
                    disabled={!link}
                    className="mt-5 h-11 rounded-full bg-brand-gradient shadow-soft transition-transform duration-150 active:scale-[0.98]"
                  >
                    <Copy className="size-4" /> Share your Chupi link
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </section>

        <div className="pb-nav">
          <SafetyFooter />
        </div>
      </main>

      <StoryCardDialog
        message={storyMessage}
        displayName={profile?.display_name ?? ""}
        slug={profile?.slug}
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

      <BottomNav unreadCount={unreadCount} />
    </div>
  );
}
