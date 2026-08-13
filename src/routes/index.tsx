import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand, SafetyFooter } from "@/components/chupi/Brand";
import { EnvelopeIllustration } from "@/components/chupi/EnvelopeMark";
import { Button } from "@/components/ui/button";
import { Heart, Link2, Lock, Mail, Send, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chupi — Send what you really mean, anonymously" },
      {
        name: "description",
        content:
          "Share your Chupi link and receive honest anonymous letters. Filtered for hate and harassment, and you can switch your link off anytime.",
      },
      { property: "og:title", content: "Chupi — Send what you really mean, anonymously" },
      {
        property: "og:description",
        content: "Share your link, collect kind anonymous letters, reply publicly with story cards.",
      },
    ],
  }),
  component: Home,
});

const steps = [
  {
    icon: Link2,
    title: "Get your Chupi link",
    body: "Sign up in seconds and we hand you a personal link that's yours alone.",
  },
  {
    icon: Send,
    title: "Share it anywhere",
    body: "Drop it in your bio, your story, or a group chat — wherever your people are.",
  },
  {
    icon: Mail,
    title: "Receive honest letters",
    body: "Anonymous notes land in your inbox like little sealed envelopes.",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "Your own link",
    body: "Get a personal chupi.link that you can drop in your bio or story.",
  },
  {
    icon: ShieldCheck,
    title: "Filtered by default",
    body: "Hate speech, harassment and sexual content never reach your inbox.",
  },
  {
    icon: Lock,
    title: "Truly anonymous",
    body: "Senders are never asked for a name, an email, or anything else.",
  },
  {
    icon: Heart,
    title: "Reply publicly",
    body: "Turn any message into a pretty card you can screenshot and share.",
  },
];

function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Brand />
        <Link to="/auth">
          <Button variant="ghost" className="rounded-full">
            Log in
          </Button>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6">
        <section className="grid items-center gap-8 pt-6 sm:pt-12 md:grid-cols-2">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-seal" />
              Honest words, zero pressure
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Chupi — send what you <span className="text-brand-gradient">really</span> mean,
              anonymously.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg md:mx-0">
              One little link, sealed like a letter. Share it, and anyone can write you an
              anonymous note — kindly, safely, and without signing up.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button
                  size="lg"
                  className="w-full rounded-full bg-brand-gradient px-8 shadow-soft transition-shadow hover:shadow-lift sm:w-auto"
                >
                  Get my Chupi link
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full rounded-full bg-card/60 px-8 sm:w-auto">
                  I already have one
                </Button>
              </Link>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground md:justify-start">
              <Lock className="size-3.5 text-seal" />
              100% Anonymous. We never store sender info.
            </p>
          </div>

          <EnvelopeIllustration className="mx-auto w-full max-w-sm" />
        </section>

        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-semibold">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="rounded-3xl border border-border/70 bg-paper p-6 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-display text-sm font-semibold text-seal">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border/70 bg-card-gradient p-6 shadow-soft"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <f.icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{f.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <SafetyFooter />
    </div>
  );
}

