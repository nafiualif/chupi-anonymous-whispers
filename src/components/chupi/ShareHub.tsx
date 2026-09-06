import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Instagram, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { monogram } from "@/lib/chupi-ui";

type Props = {
  displayName: string;
  slug?: string | undefined;
  link: string;
  linkEnabled: boolean;
  loading: boolean;
  stats: { total: number; unread: number; shared: number };
};

export function ShareHub({ displayName, slug, link, linkEnabled, loading, stats }: Props) {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const prettyLink = slug ? `chupi.link/${slug}` : "…";

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied — go paste it in your bio!");
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function shareStory() {
    const text = `Send me an anonymous whisper on Chupi 💌 ${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Chupi link", text, url: link });
        return;
      } catch {
        /* dismissed */
      }
    }
    await navigator.clipboard.writeText(text);
    toast.success("Link copied — add it as a sticker on your story!");
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card relative overflow-hidden rounded-[1.75rem] p-5 shadow-lift sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient font-display text-lg font-bold text-primary-foreground shadow-soft">
          {monogram(displayName, "C")}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold leading-tight">
            {loading ? "Loading…" : displayName || "Your Chupi"}
          </p>
          <span className="mt-1 inline-flex max-w-full items-center truncate rounded-full border border-border/70 bg-background/70 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            @{slug ?? "…"}
          </span>
        </div>
      </div>

      {!loading && !linkEnabled && (
        <p className="relative mt-3 text-sm text-destructive">
          Your link is currently turned off — no one can send you whispers.
        </p>
      )}

      <div className="relative mt-4 flex items-center gap-2">
        <Button
          onClick={copyLink}
          disabled={!link}
          className="h-12 flex-1 overflow-hidden rounded-full bg-brand-gradient text-sm font-semibold shadow-soft transition-transform duration-150 active:scale-[0.98]"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="size-4" /> Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <Copy className="size-4" /> Copy personal link
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        <Button
          variant="outline"
          aria-label="Show QR code"
          title="QR code"
          onClick={() => setQrOpen(true)}
          disabled={!link}
          className="size-12 shrink-0 rounded-full bg-background/70 p-0 transition-transform duration-150 active:scale-[0.94]"
        >
          <QrCode className="size-5" />
        </Button>
        <Button
          variant="outline"
          aria-label="Share to story"
          title="Share to story"
          onClick={shareStory}
          disabled={!link}
          className="size-12 shrink-0 rounded-full bg-background/70 p-0 transition-transform duration-150 active:scale-[0.94]"
        >
          <Instagram className="size-5" />
        </Button>
      </div>

      <p className="relative mt-2.5 truncate text-center text-xs text-muted-foreground">
        {prettyLink}
      </p>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <Stat emoji="💌" label="Whispers" value={stats.total} />
        <Stat emoji="✨" label="Unread" value={stats.unread} />
        <Stat emoji="🔥" label="Shared" value={stats.shared} />
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="rounded-3xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Your Chupi QR</DialogTitle>
            <DialogDescription>
              Point a camera at it, or screenshot it for your story.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 pb-2">
            {link && (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(link)}`}
                alt="QR code for your Chupi link"
                width={240}
                height={240}
                className="rounded-2xl border border-border/60 bg-card p-2 shadow-soft"
              />
            )}
            <p className="text-xs text-muted-foreground">{prettyLink}</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}

function Stat({ emoji, label, value }: { emoji: string; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/50 px-2 py-2.5 text-center backdrop-blur-sm">
      <p className="font-display text-base font-bold leading-none">
        <span className="mr-1 text-sm">{emoji}</span>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
