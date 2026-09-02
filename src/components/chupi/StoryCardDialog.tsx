import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Download, Link2, Loader2, Share2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

type StoryMessage = { id: string; content: string; reply: string | null };

type Theme = {
  id: string;
  name: string;
  swatch: string;
  background: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  pillBg: string;
  pillText: string;
  replyBg: string;
  replyText: string;
};

const THEMES: Theme[] = [
  {
    id: "linen",
    name: "Warm Linen",
    swatch: "linear-gradient(135deg,#FAF7F2 0%,#DF6349 100%)",
    background: "#FAF7F2",
    cardBg: "#FFFFFF",
    cardBorder: "1px solid #E8DFD5",
    cardShadow: "0 24px 60px -30px rgba(22,31,40,0.35)",
    text: "#161F28",
    muted: "rgba(22,31,40,0.55)",
    accent: "#DF6349",
    accentText: "#FFFFFF",
    pillBg: "rgba(223,99,73,0.12)",
    pillText: "#DF6349",
    replyBg: "#F4EFE8",
    replyText: "#161F28",
  },
  {
    id: "pine",
    name: "Midnight Pine",
    swatch: "linear-gradient(135deg,#1B3B32 0%,#D1E4DD 100%)",
    background: "#1B3B32",
    cardBg: "rgba(255,255,255,0.08)",
    cardBorder: "1px solid rgba(209,228,221,0.22)",
    cardShadow: "0 24px 60px -30px rgba(0,0,0,0.6)",
    text: "#F8F9FA",
    muted: "rgba(248,249,250,0.6)",
    accent: "#D1E4DD",
    accentText: "#1B3B32",
    pillBg: "rgba(209,228,221,0.16)",
    pillText: "#D1E4DD",
    replyBg: "rgba(209,228,221,0.12)",
    replyText: "#F8F9FA",
  },
  {
    id: "charcoal",
    name: "Velvet Charcoal",
    swatch: "linear-gradient(135deg,#11161B 0%,#E5A96A 100%)",
    background: "#11161B",
    cardBg: "#1A222A",
    cardBorder: "1px solid rgba(229,169,106,0.28)",
    cardShadow: "0 24px 60px -30px rgba(0,0,0,0.8)",
    text: "#FFFFFF",
    muted: "rgba(255,255,255,0.55)",
    accent: "#E5A96A",
    accentText: "#11161B",
    pillBg: "rgba(229,169,106,0.14)",
    pillText: "#E5A96A",
    replyBg: "rgba(255,255,255,0.06)",
    replyText: "#FFFFFF",
  },
  {
    id: "peach",
    name: "Sunset Peach",
    swatch: "linear-gradient(135deg,#FBE8E2 0%,#E06752 100%)",
    background: "linear-gradient(160deg,#FBE8E2 0%,#F6D3C8 100%)",
    cardBg: "#FFFFFF",
    cardBorder: "1px solid rgba(224,103,82,0.18)",
    cardShadow: "0 24px 60px -30px rgba(61,29,22,0.35)",
    text: "#3D1D16",
    muted: "rgba(61,29,22,0.55)",
    accent: "#E06752",
    accentText: "#FFFFFF",
    pillBg: "rgba(224,103,82,0.14)",
    pillText: "#E06752",
    replyBg: "#FDF1ED",
    replyText: "#3D1D16",
  },
];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.35'/></svg>\")";

export function StoryCardDialog({
  message,
  displayName,
  slug,
  onOpenChange,
}: {
  message: StoryMessage | null;
  displayName: string;
  slug?: string | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [themeId, setThemeId] = useState(THEMES[0]!.id);
  const [format, setFormat] = useState<"story" | "square">("story");
  const [busy, setBusy] = useState<null | "share" | "download">(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const theme = useMemo(() => THEMES.find((t) => t.id === themeId) ?? THEMES[0]!, [themeId]);

  useEffect(() => {
    setReply(message?.reply ?? "");
  }, [message]);

  const profileLink =
    typeof window !== "undefined" && slug ? `${window.location.host}/u/${slug}` : "chupi.link";

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
    const node = cardRef.current;
    if (!node) return null;
    if (document.fonts?.ready) await document.fonts.ready;
    const width = format === "story" ? 1080 : 1080;
    const height = format === "story" ? 1920 : 1080;
    const scale = width / node.offsetWidth;
    return toBlob(node, {
      cacheBust: true,
      pixelRatio: 3,
      width,
      height,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${node.offsetWidth}px`,
        height: `${node.offsetHeight}px`,
      },
    });
  }

  async function handleDownload(silent = false) {
    setBusy("download");
    try {
      const blob = await renderCard();
      if (!blob) throw new Error("no blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chupi-${format}.png`;
      a.click();
      URL.revokeObjectURL(url);
      if (!silent) toast.success("Saved in HD to your device");
    } catch {
      toast.error("Couldn't create the image");
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    setBusy("share");
    try {
      const blob = await renderCard();
      if (!blob) throw new Error("no blob");
      const file = new File([blob], "chupi-story.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Chupi whisper" });
      } else {
        await handleDownload(true);
        toast.info("Sharing isn't supported here — saved the image instead");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") toast.error("Couldn't share the card");
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`https://${profileLink}`);
    toast.success("Link copied! Add it as a Link Sticker on your Story");
  }

  const isStory = format === "story";

  return (
    <Dialog open={!!message} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94dvh] max-w-md overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Share to story</DialogTitle>
          <DialogDescription>
            Pick a theme, add a reply, then export in HD.
          </DialogDescription>
        </DialogHeader>

        {/* Live preview */}
        <div className="rounded-3xl border border-border/70 bg-muted/40 p-3">
          <div className="mx-auto w-full" style={{ maxWidth: isStory ? 260 : 320 }}>
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-3xl shadow-2xl"
              style={{
                background: theme.background,
                aspectRatio: isStory ? "9 / 16" : "1 / 1",
                padding: isStory ? "28px 22px" : "26px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: isStory ? 18 : 14,
                color: theme.text,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: GRAIN, opacity: 0.05, mixBlendMode: "overlay" }}
              />

              {/* eyebrow pill */}
              <div className="relative flex justify-center">
                <span
                  style={{
                    background: theme.pillBg,
                    color: theme.pillText,
                    borderRadius: 999,
                    padding: "6px 12px",
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                  }}
                >
                  🔒 ANONYMOUS WHISPER
                </span>
              </div>

              {/* question card */}
              <div
                className="relative"
                style={{
                  background: theme.cardBg,
                  border: theme.cardBorder,
                  boxShadow: theme.cardShadow,
                  borderRadius: 22,
                  padding: isStory ? "20px 18px" : "18px 16px",
                  backdropFilter: "blur(6px)",
                }}
              >
                <span
                  className="font-display"
                  style={{ fontSize: 30, lineHeight: 0.6, color: theme.accent, opacity: 0.8 }}
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p
                  className="font-display"
                  style={{
                    marginTop: 6,
                    fontSize: isStory ? 17 : 15,
                    lineHeight: 1.3,
                    fontWeight: 600,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    color: theme.text,
                  }}
                >
                  {message?.content}
                </p>
              </div>

              {/* reply */}
              {reply.trim() && (
                <div
                  className="relative"
                  style={{
                    background: theme.replyBg,
                    borderRadius: 18,
                    padding: "12px 14px",
                    color: theme.replyText,
                  }}
                >
                  <p
                    style={{
                      fontSize: 7,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: theme.accent,
                    }}
                  >
                    {displayName || "My"} reply
                  </p>
                  <p style={{ marginTop: 5, fontSize: 11, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {reply.trim()}
                  </p>
                </div>
              )}

              {/* footer sticker */}
              <div className="relative mt-auto flex justify-center pt-3">
                <span
                  style={{
                    background: theme.accent,
                    color: theme.accentText,
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontSize: 8.5,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <EnvelopeMark className="size-3" /> Send me whispers at {profileLink}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* format toggle */}
        <div className="grid grid-cols-2 gap-2">
          {(["story", "square"] as const).map((f) => (
            <Button
              key={f}
              variant={format === f ? "default" : "outline"}
              onClick={() => setFormat(f)}
              className={cn("h-10 rounded-full", format === f && "bg-brand-gradient shadow-soft")}
            >
              {f === "story" ? "9:16 Story" : "1:1 Square"}
            </Button>
          ))}
        </div>

        {/* themes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setThemeId(t.id)}
              aria-label={t.name}
              title={t.name}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors",
                themeId === t.id
                  ? "border-primary bg-accent/60 font-medium"
                  : "border-border/70 hover:bg-accent/40",
              )}
            >
              <span
                className="size-4 rounded-full ring-1 ring-border"
                style={{ backgroundImage: t.swatch }}
              />
              {t.name}
              {themeId === t.id && <Check className="size-3 text-primary" />}
            </button>
          ))}
        </div>

        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Add your reply…"
          rows={3}
          maxLength={500}
          className="rounded-2xl bg-background/70 text-base"
        />

        <div className="grid gap-2">
          <Button
            onClick={handleShare}
            disabled={busy !== null}
            className="h-11 w-full rounded-full bg-brand-gradient shadow-soft active:scale-[0.98]"
          >
            {busy === "share" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Share2 className="size-4" />
            )}
            Share to Instagram / Social
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => handleDownload()}
              className="h-11 rounded-full"
            >
              {busy === "download" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Save image
            </Button>
            <Button variant="outline" onClick={copyLink} className="h-11 rounded-full">
              <Link2 className="size-4" /> Copy link
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => saveReply.mutate()}
            disabled={saveReply.isPending}
            className="h-10 w-full rounded-full text-sm"
          >
            Save reply to inbox
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
