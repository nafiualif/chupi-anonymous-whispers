import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Lock, Send, Sparkles } from "lucide-react";

import { Brand, SafetyFooter } from "@/components/chupi/Brand";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getPublicProfile, sendAnonymousMessage } from "@/lib/chupi.functions";

export const Route = createFileRoute("/u/$slug")({
  loader: ({ params }) => getPublicProfile({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const name = loaderData?.display_name;
    const title = name ? `Send ${name} an anonymous message — Chupi` : "Send an anonymous message — Chupi";
    const description = name
      ? `Tell ${name} anything. No name, no email, completely anonymous.`
      : "Send an anonymous message on Chupi. No name, no email needed.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  errorComponent: () => <Shell><Card><p className="text-center text-sm text-muted-foreground">This page couldn't load. Try again in a moment.</p></Card></Shell>,
  notFoundComponent: () => <Shell><Card><p className="text-center text-sm text-muted-foreground">This Chupi link doesn't exist.</p></Card></Shell>,
  component: PublicPage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl justify-center px-5 py-6">
        <Brand />
      </header>
      <main className="flex-1 px-5">{children}</main>
      <SafetyFooter />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border/70 bg-card-gradient p-7 shadow-soft">
      {children}
    </div>
  );
}

function PublicPage() {
  const profile = Route.useLoaderData();
  const send = useServerFn(sendAnonymousMessage);
  const { slug } = Route.useParams();

  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "blocked" | "limited" | "error">(
    "idle",
  );

  if (!profile) {
    return (
      <Shell>
        <Card>
          <h1 className="text-center font-display text-xl font-bold">Link not found</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            This Chupi link doesn't exist or was removed.
          </p>
        </Card>
      </Shell>
    );
  }

  if (!profile.link_enabled) {
    return (
      <Shell>
        <Card>
          <h1 className="text-center font-display text-xl font-bold">
            {profile.display_name} is taking a break
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Their message link is turned off right now. Try again later.
          </p>
        </Card>
      </Shell>
    );
  }

  async function handleSend() {
    setStatus("sending");
    try {
      const res = await send({ data: { slug, content } });
      if (res.ok) {
        setStatus("sent");
        setContent("");
      } else if (res.reason === "flagged") {
        setStatus("blocked");
      } else if (res.reason === "rate_limited") {
        setStatus("limited");
      } else if (res.reason === "disabled" || res.reason === "not_found") {
        setStatus("error");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <Shell>
        <Card>
          <div className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-gradient shadow-soft">
              <Sparkles className="size-6 text-primary-foreground" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold">Your message was sent anonymously!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile.display_name} will never know it was you. 💜
            </p>
            <Button className="mt-6 rounded-full bg-brand-gradient shadow-soft" onClick={() => setStatus("idle")}>
              Send another
            </Button>
            <p className="mt-6 text-xs text-muted-foreground">
              Want your own link?{" "}
              <Link to="/" className="font-medium text-primary underline-offset-4 hover:underline">
                Create a free Chupi
              </Link>
            </p>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <h1 className="text-center font-display text-2xl font-bold leading-snug">
          Send <span className="text-brand-gradient">{profile.display_name}</span> an anonymous
          message
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          They'll never know who wrote it.
        </p>

        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          rows={5}
          maxLength={1000}
          placeholder="Say something kind, funny, or honest…"
          className="mt-6 rounded-2xl bg-background/70 text-base"
        />

        {status === "blocked" && (
          <p className="mt-3 text-center text-sm text-destructive">
            This message couldn't be sent.
          </p>
        )}
        {status === "limited" && (
          <p className="mt-3 text-center text-sm text-destructive">
            You've sent a few messages already — please try again in a little while.
          </p>
        )}
        {status === "error" && (
          <p className="mt-3 text-center text-sm text-destructive">
            Something went wrong. Please try again.
          </p>
        )}

        <Button
          onClick={handleSend}
          disabled={status === "sending" || content.trim().length < 2}
          className="mt-4 w-full rounded-full bg-brand-gradient shadow-soft"
        >
          <Send className="size-4" />
          {status === "sending" ? "Sending…" : "Send Anonymous Message"}
        </Button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" /> We never ask for your name or email.
        </p>
      </Card>
    </Shell>
  );
}
