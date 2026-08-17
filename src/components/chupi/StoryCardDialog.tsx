import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Download, Share2 } from "lucide-react";
import { toBlob } from "html-to-image";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { EnvelopeMark } from "@/components/chupi/EnvelopeMark";

type StoryMessage = { id: string; content: string; reply: string | null };

export function StoryCardDialog({
  message,
  displayName,
  onOpenChange,
}: {
  message: StoryMessage | null;
  displayName: string;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReply(message?.reply ?? "");
  }, [message]);

  const saveReply = useMutation({
    mutationFn: async () => {
      if (!message) return;
      const { error } = await supabase
        .from("messages")
        .update({ reply: reply.trim() || null })
        .eq("id", message.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reply saved");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: () => toast.error("Couldn't save your reply"),
  });

  async function renderCard() {
    if (!cardRef.current) return null;
    return toBlob(cardRef.current, { pixelRatio: 3, cacheBust: true });
  }

  async function handleDownload() {
    setBusy(true);
    try {
      const blob = await renderCard();
      if (!blob) throw new Error("no blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chupi-reply.png";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded");
    } catch {
      toast.error("Couldn't create the image");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    setBusy(true);
    try {
      const blob = await renderCard();
      if (!blob) throw new Error("no blob");
      const file = new File([blob], "chupi-reply.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Chupi reply" });
      } else {
        await handleDownload();
        toast.info("Sharing isn't supported here — saved the card instead");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") toast.error("Couldn't share the card");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!message} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Reply publicly</DialogTitle>
          <DialogDescription>
            Write a reply, then download or share your Chupi card.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={cardRef}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-brand-gradient p-6 text-primary-foreground shadow-lift"
        >
          {/* soft decorative seal in the corner */}
          <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 size-36 rounded-full bg-white/5 blur-2xl" />

          {/* header / branding */}
          <div className="relative flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <EnvelopeMark className="size-6" />
            </span>
            <span className="font-display text-sm font-bold tracking-wide">Chupi</span>
          </div>

          {/* anonymous message */}
          <div className="relative mt-6">
            <span
              className="block font-display text-5xl leading-none opacity-30"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="-mt-3 whitespace-pre-wrap font-display text-lg font-semibold leading-snug">
              {message?.content}
            </p>
          </div>

          {/* divider */}
          <div className="relative mt-5 flex items-center gap-3 opacity-60">
            <span className="h-px flex-1 bg-white/40" />
            <EnvelopeMark className="size-4 opacity-70" />
            <span className="h-px flex-1 bg-white/40" />
          </div>

          {/* reply */}
          <div className="relative mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
              {displayName || "My"} reply
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed opacity-95">
              {reply.trim() || (
                <span className="opacity-50 italic">Write your reply below…</span>
              )}
            </p>
          </div>

          {/* footer */}
          <div className="absolute inset-x-6 bottom-5 flex items-center justify-between text-[10px] font-medium opacity-70">
            <span>anonymous letters</span>
            <span>chupi</span>
          </div>
        </div>

        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write your public reply…"
          rows={3}
          maxLength={500}
          className="rounded-2xl bg-background/70 text-base"
        />

        <div className="grid gap-2">
          <Button
            onClick={() => saveReply.mutate()}
            disabled={saveReply.isPending}
            className="w-full rounded-full bg-brand-gradient shadow-soft"
          >
            <Camera className="size-4" /> Save reply
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={handleDownload}
              className="rounded-full"
            >
              <Download className="size-4" /> Download
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={handleShare}
              className="rounded-full"
            >
              <Share2 className="size-4" /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
