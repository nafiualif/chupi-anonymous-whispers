import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isFlagged } from "./moderation";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 10;

async function hashIp(ip: string): Promise<string> {
  const bytes = new TextEncoder().encode(`chupi:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("display_name, slug, link_enabled")
      .eq("slug", data.slug)
      .maybeSingle();

    return profile ?? null;
  });

export const sendAnonymousMessage = createServerFn({ method: "POST" })
  .inputValidator((data: { slug: string; content: string }) => data)
  .handler(async ({ data }) => {
    const content = (data.content ?? "").trim();
    if (content.length < 2) {
      return { ok: false as const, reason: "empty" as const };
    }
    if (content.length > 1000) {
      return { ok: false as const, reason: "too_long" as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, link_enabled")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!profile) return { ok: false as const, reason: "not_found" as const };
    if (!profile.link_enabled) return { ok: false as const, reason: "disabled" as const };

    // --- rate limiting: max 5 messages per IP per 10 minutes ---
    const rawIp =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      getRequestIP({ xForwardedFor: true }) ??
      "unknown";
    const ipHash = await hashIp(rawIp);
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();

    const { count } = await supabaseAdmin
      .from("send_events")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return { ok: false as const, reason: "rate_limited" as const };
    }

    await supabaseAdmin.from("send_events").insert({ ip_hash: ipHash });

    // --- moderation ---
    if (isFlagged(content)) {
      return { ok: false as const, reason: "flagged" as const };
    }

    // --- blocked senders: silently drop so the sender learns nothing ---
    const { data: blocked } = await supabaseAdmin
      .from("blocked_senders")
      .select("id")
      .eq("user_id", profile.id)
      .eq("sender_hash", ipHash)
      .maybeSingle();

    if (blocked) return { ok: true as const };

    const { error } = await supabaseAdmin.from("messages").insert({
      recipient_id: profile.id,
      content,
      is_flagged: false,
      sender_hash: ipHash,
    });

    if (error) return { ok: false as const, reason: "error" as const };
    return { ok: true as const };
  });

export const reportMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { messageId: string; reason: string; details?: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const allowed = ["harassment", "spam", "hate", "sexual", "other"];
    if (!allowed.includes(data.reason)) return { ok: false as const };

    const { data: message } = await supabase
      .from("messages")
      .select("id")
      .eq("id", data.messageId)
      .maybeSingle();
    if (!message) return { ok: false as const };

    await supabase.from("message_reports").upsert(
      {
        message_id: data.messageId,
        reporter_id: userId,
        reason: data.reason,
        details: (data.details ?? "").trim().slice(0, 500) || null,
      },
      { onConflict: "message_id,reporter_id" },
    );

    await supabase.from("messages").update({ is_reported: true }).eq("id", data.messageId);
    return { ok: true as const };
  });

export const blockMessageSender = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { messageId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: message } = await supabase
      .from("messages")
      .select("id, sender_hash")
      .eq("id", data.messageId)
      .maybeSingle();

    if (!message) return { ok: false as const, reason: "not_found" as const };
    if (!message.sender_hash) return { ok: false as const, reason: "unknown_sender" as const };

    const { error } = await supabase
      .from("blocked_senders")
      .upsert(
        { user_id: userId, sender_hash: message.sender_hash },
        { onConflict: "user_id,sender_hash" },
      );

    if (error) return { ok: false as const, reason: "error" as const };
    return { ok: true as const };
  });


function randomSlug(displayName: string): string {
  const base =
    displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 12) || "chupi";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { displayName?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("profiles")
      .select("id, display_name, slug, link_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (existing) return existing;

    const displayName = (data.displayName ?? "").trim() || "Someone";

    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = randomSlug(displayName);
      const { data: created, error } = await supabase
        .from("profiles")
        .insert({ id: userId, display_name: displayName, slug })
        .select("id, display_name, slug, link_enabled")
        .single();
      if (!error && created) return created;
    }

    throw new Error("Could not create profile");
  });
