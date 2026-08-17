import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Copy, Link2, Lock, Pencil, ShieldCheck, User } from "lucide-react";

import { AppHeader } from "@/components/chupi/AppHeader";
import { BottomNav } from "@/components/chupi/BottomNav";
import { SafetyFooter } from "@/components/chupi/Brand";
import { EnvelopeMark } from "@/components/chupi/EnvelopeMark";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile, updateProfile } from "@/lib/chupi.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Chupi" },
      { name: "robots", content: "noindex, nofollow" },
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
  const update = useServerFn(updateProfile);

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

  const profile = profileQuery.data;
  const linkEnabled = profile?.link_enabled ?? true;
  const link =
    typeof window !== "undefined" && profile ? `${window.location.origin}/u/${profile.slug}` : "";

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied");
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl px-4 sm:px-5">
        <h1 className="font-display text-xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap a section to expand it.
        </p>

        <Accordion type="multiple" defaultValue={["profile"]} className="mt-4 space-y-3 sm:mt-5">
          {/* ── Profile ── */}
          <AccordionItem
            value="profile"
            className="overflow-hidden rounded-3xl border border-border/70 bg-card-gradient shadow-soft data-[state=open]:shadow-lift"
          >
            <AccordionTrigger className="group gap-3 rounded-3xl px-5 py-4 hover:no-underline sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <User className="size-5" />
                </span>
                <div className="text-left">
                  <span className="font-display text-base font-semibold">Profile</span>
                  <p className="text-xs text-muted-foreground">
                    {profile?.display_name ?? "Loading…"}
                  </p>
                </div>
              </div>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 sm:px-6">
              <ProfileSection
                displayName={profile?.display_name ?? ""}
                slug={profile?.slug ?? ""}
                link={link}
                isLoading={profileQuery.isLoading}
                onSave={async (name) => {
                  const res = await update({ data: { displayName: name } });
                  if (res.ok) {
                    toast.success("Profile updated");
                    queryClient.invalidateQueries({ queryKey: ["profile"] });
                  } else {
                    toast.error("Couldn't update your profile");
                  }
                  return res.ok;
                }}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ── Public Link ── */}
          <AccordionItem
            value="link"
            className="overflow-hidden rounded-3xl border border-border/70 bg-card-gradient shadow-soft data-[state=open]:shadow-lift"
          >
            <AccordionTrigger className="group gap-3 rounded-3xl px-5 py-4 hover:no-underline sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Link2 className="size-5" />
                </span>
                <div className="text-left">
                  <span className="font-display text-base font-semibold">Public Link</span>
                  <p className="text-xs text-muted-foreground">
                    {linkEnabled ? "Active" : "Paused"}
                  </p>
                </div>
              </div>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 sm:px-6">
              <PublicLinkSection
                link={link}
                enabled={linkEnabled}
                isLoading={profileQuery.isLoading || toggleLink.isPending}
                onToggle={(v) => toggleLink.mutate(v)}
                onCopy={copyLink}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ── Privacy ── */}
          <AccordionItem
            value="privacy"
            className="overflow-hidden rounded-3xl border border-border/70 bg-card-gradient shadow-soft data-[state=open]:shadow-lift"
          >
            <AccordionTrigger className="group gap-3 rounded-3xl px-5 py-4 hover:no-underline sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="text-left">
                  <span className="font-display text-base font-semibold">Privacy</span>
                  <p className="text-xs text-muted-foreground">How we protect you</p>
                </div>
              </div>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 sm:px-6">
              <PrivacySection
                enabled={linkEnabled}
                isLoading={profileQuery.isLoading || toggleLink.isPending}
                onToggle={(v) => toggleLink.mutate(v)}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pb-nav">
          <SafetyFooter />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/* ───────────────────────── Profile section ───────────────────────── */

function ProfileSection({
  displayName,
  slug,
  link,
  isLoading,
  onSave,
}: {
  displayName: string;
  slug: string;
  link: string;
  isLoading: boolean;
  onSave: (name: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setName(displayName);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  async function save() {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Display name can't be empty");
      return;
    }
    if (trimmed.length > 40) {
      setError("Keep it under 40 characters");
      return;
    }
    setSaving(true);
    setError(null);
    const ok = await onSave(trimmed);
    setSaving(false);
    if (ok) setEditing(false);
  }

  return (
    <div className="pt-2">
      {/* profile card */}
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-paper p-4 sm:p-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-soft sm:size-16">
          <EnvelopeMark className="size-8 sm:size-9" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold">
            {isLoading ? "Loading…" : displayName}
          </p>
          <p className="truncate text-sm text-muted-foreground">@{slug}</p>
        </div>
      </div>

      {/* link preview */}
      {link && (
        <a
          href={link}
          className="mt-3 flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-primary underline-offset-4 hover:underline"
        >
          <Link2 className="size-4 shrink-0" />
          <span className="truncate">{link}</span>
        </a>
      )}

      {/* edit / display controls */}
      {editing ? (
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              maxLength={40}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="h-11 rounded-2xl bg-background/70 text-base"
              placeholder="Your name"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              onClick={save}
              disabled={saving}
              className="h-11 flex-1 rounded-full bg-brand-gradient shadow-soft transition-transform active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="size-4" /> Save
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={cancel}
              disabled={saving}
              className="h-11 rounded-full transition-transform active:scale-[0.98]"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={startEdit}
          disabled={isLoading}
          className="mt-4 h-11 w-full rounded-full transition-transform active:scale-[0.98]"
        >
          <Pencil className="size-4" /> Edit profile
        </Button>
      )}
    </div>
  );
}

/* ─────────────────────── Public Link section ─────────────────────── */

function PublicLinkSection({
  link,
  enabled,
  isLoading,
  onToggle,
  onCopy,
}: {
  link: string;
  enabled: boolean;
  isLoading: boolean;
  onToggle: (v: boolean) => void;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-4 pt-2">
      {/* status badge */}
      <div className="flex items-center gap-2.5">
        <span
          className={`flex size-2.5 rounded-full transition-colors duration-300 ${
            enabled ? "bg-emerald-500" : "bg-muted-foreground/40"
          }`}
        >
          <span
            className={`size-2.5 rounded-full ${enabled ? "bg-emerald-500/40 animate-ping" : ""}`}
          />
        </span>
        <span className="text-sm font-medium">
          {enabled ? "Active" : "Paused"}
        </span>
        <span className="text-sm text-muted-foreground">
          {enabled ? "— anyone can send you messages" : "— messages are paused"}
        </span>
      </div>

      {/* link display + copy */}
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-paper p-3 sm:p-4">
        <Link2 className="size-5 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{link || "Loading…"}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          disabled={!link}
          className="shrink-0 rounded-full px-3 transition-transform active:scale-[0.96]"
        >
          <Copy className="size-4" /> Copy
        </Button>
      </div>

      {/* toggle */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
        <div>
          <Label htmlFor="link-toggle" className="font-display text-sm font-semibold">
            Allow anonymous messages
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Turn off to pause your link. Your inbox stays intact.
          </p>
        </div>
        <Switch
          id="link-toggle"
          checked={enabled}
          disabled={isLoading}
          onCheckedChange={onToggle}
        />
      </div>
    </div>
  );
}

/* ──────────────────────── Privacy section ──────────────────────── */

function PrivacySection({
  enabled,
  isLoading,
  onToggle,
}: {
  enabled: boolean;
  isLoading: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
        <div>
          <Label htmlFor="privacy-toggle" className="font-display text-sm font-semibold">
            Public message link
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Turn this off to temporarily stop receiving anonymous messages. Your existing inbox
            stays exactly as it is.
          </p>
        </div>
        <Switch
          id="privacy-toggle"
          checked={enabled}
          disabled={isLoading}
          onCheckedChange={onToggle}
        />
      </div>

      <div className="rounded-2xl border border-border/60 bg-paper p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-seal" />
          <h3 className="font-display text-sm font-semibold">Staying safe</h3>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Chupi automatically blocks messages containing hate speech, harassment, sexual content or
          bullying. You can also report and delete anything that slips through.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-paper p-4">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-seal" />
          <h3 className="font-display text-sm font-semibold">What we store</h3>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Senders are never asked for a name or an email, and their identity is never shown to you.
          To block spam we do keep a short-lived, one-way scrambled record of the sender's network
          address — it can't be turned back into a person.
        </p>
      </div>
    </div>
  );
}
