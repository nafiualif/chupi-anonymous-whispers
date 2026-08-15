import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand, SafetyFooter } from "@/components/chupi/Brand";
import { EnvelopeIllustration } from "@/components/chupi/EnvelopeMark";
import { Button } from "@/components/ui/button";
import { Heart, Link2, Lock, Mail, Send, ShieldCheck, Sparkles } from "lucide-react";

const SITE_URL = "https://chupi-anonymous-whispers.lovable.app";
const HOME_TITLE = "Chupi — Anonymous Messages & Secret Whispers";
const HOME_DESCRIPTION =
  "Chupi gives you a personal link so friends can send you anonymous messages and questions. Honest, filtered for hate and harassment, and you can switch your link off anytime.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Chupi" },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Chupi",
          url: `${SITE_URL}/`,
          description: HOME_DESCRIPTION,
        }),
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
      <header className="pt-safe mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
        <Brand />
        <Link to="/auth">
          <Button variant="ghost" className="h-10 rounded-full px-4">
            Log in
          </Button>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <section className="grid items-center gap-8 pt-4 sm:pt-10 md:grid-cols-2">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-seal" />
              Honest words, zero pressure
            </span>
            <h1 className="mt-5 font-display text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-5xl">
              Chupi — say what you <span className="text-brand-gradient">really</span> mean,
              anonymously.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-[15px] text-muted-foreground sm:mt-5 sm:text-lg md:mx-0">
              One little link, sealed like a letter. Share it, and anyone can write you an
              anonymous note — kindly, safely, and without signing up.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center md:justify-start">
              <Link to="/auth" search={{ mode: "signup" }} className="sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-brand-gradient px-8 text-base shadow-soft transition-all hover:shadow-lift active:scale-[0.98] sm:w-auto"
                >
                  Get my Chupi link
                </Button>
              </Link>
              <Link to="/auth" className="sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full bg-card/60 px-8 text-base active:scale-[0.98] sm:w-auto"
                >
                  I already have one
                </Button>
              </Link>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground md:justify-start">
              <Lock className="size-3.5 shrink-0 text-seal" />
              Fully anonymous — senders never give a name or email.
            </p>
          </div>

          <EnvelopeIllustration className="mx-auto w-full max-w-[16rem] sm:max-w-sm" />
        </section>

        <section className="mt-12 sm:mt-16">
          <h2 className="text-center font-display text-xl font-semibold sm:text-2xl">
            How it works
          </h2>
          <ol className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="rounded-3xl border border-border/70 bg-paper p-5 shadow-soft sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <span className="font-display text-sm font-semibold text-seal">Step {i + 1}</span>
                </div>
                <h3 className="mt-3.5 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border/70 bg-card-gradient p-5 shadow-soft sm:p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <f.icon className="size-5" />
              </span>
              <h2 className="mt-3.5 font-display text-lg font-semibold">{f.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <SafetyFooter />
    </div>
  );
}

