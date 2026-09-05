import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand, SafetyFooter } from "@/components/chupi/Brand";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Lock,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  VenetianMask,
} from "lucide-react";



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
      { name: "google-site-verification", content: "ijVgVm4p5Eln5BZIrqysXGRCPQmbfkLTdpQgeTMLzS0" },
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
    n: "01",
    title: "Get your Chupi link",
    body: "Sign up in seconds and we hand you a personal link that's yours alone.",
  },
  {
    n: "02",
    title: "Share it anywhere",
    body: "Drop it in your bio, your story, or a group chat — wherever your people are.",
  },
  {
    n: "03",
    title: "Receive honest letters",
    body: "Anonymous notes land in your inbox, filtered for hate and harassment.",
  },
];

const avatars = [
  { initials: "AS", tone: "bg-pastel-butter" },
  { initials: "MK", tone: "bg-pastel-sage" },
  { initials: "JR", tone: "bg-pastel-lilac" },
  { initials: "NL", tone: "bg-pastel-coral" },
];

const promises = [
  {
    title: "Truly anonymous",
    body: "Senders are never asked for a name, an email, or anything else.",
    icon: VenetianMask,
    tint: "bg-primary/12 text-primary",
  },
  {
    title: "Filtered by default",
    body: "Hate speech, harassment and sexual content never reach your inbox.",
    icon: ShieldCheck,
    tint: "bg-forest/12 text-forest",
  },
  {
    title: "Reply publicly",
    body: "Turn any message into a clean card you can download and share.",
    icon: Sparkles,
    tint: "bg-sand text-forest",
  },
  {
    title: "Off whenever you want",
    body: "One toggle in settings quietly switches your link off.",
    icon: ToggleLeft,
    tint: "bg-primary/12 text-primary",
  },
];


function Home() {
  return (
    <div className="min-h-screen">
      <header className="pt-safe mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
        <Brand />
        <Link
          to="/auth"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        {/* Hero */}
        <section className="pt-6 sm:pt-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-widest text-forest">
            <span className="size-1.5 rounded-full bg-primary" />
            Honest words, zero pressure
          </span>

          <h1 className="mt-6 max-w-3xl font-display text-[2.35rem] font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Chupi — say what you <span className="text-primary">really mean</span>, anonymously.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            One little link, sealed like a letter. Share it, and anyone can write you an anonymous
            note — kindly, safely, and without signing up.
          </p>

          <div className="mt-8 max-w-sm">
            <Link to="/auth" search={{ mode: "signup" }} className="block">
              <Button
                size="lg"
                className="h-13 w-full rounded-full px-8 text-base font-semibold shadow-soft transition-colors active:scale-[0.99]"
              >
                Get my Chupi link
                <ArrowUpRight className="size-4.5" />
              </Button>
            </Link>
            <div className="mt-4">
              <Link
                to="/auth"
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                I already have a Chupi →
              </Link>
            </div>
          </div>

          <div className="mt-9 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {avatars.map((a) => (
                <span
                  key={a.initials}
                  className={`flex size-8 items-center justify-center rounded-full border border-background text-[0.62rem] font-bold text-foreground ${a.tone}`}
                >
                  {a.initials}
                </span>
              ))}
            </div>
            <p className="text-xs leading-snug text-muted-foreground">
              Thousands of quiet letters sent — no sender info ever stored.
            </p>
          </div>
        </section>

        {/* Preview cards */}
        <section className="relative mt-14 sm:mt-20">
          <div className="relative mx-auto max-w-md">
            <div className="rotate-[-1.5deg] rounded-3xl border border-border bg-card p-6 shadow-soft">
              <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground">
                Anonymous
              </p>
              <p className="mt-3 font-display text-lg leading-snug text-foreground">
                “You have no idea how much your kindness changed my semester.”
              </p>
            </div>
            <div className="mt-[-1rem] ml-6 rotate-[2deg] rounded-3xl bg-forest p-6 text-forest-foreground shadow-lift">
              <p className="text-[0.62rem] font-semibold uppercase tracking-widest opacity-70">
                Your reply
              </p>
              <p className="mt-3 font-display text-lg leading-snug">
                “Whoever you are — thank you. That made my whole week.”
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-16 sm:mt-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-bold leading-tight sm:text-4xl">
            Three quiet steps to honest letters.
          </h2>

          <ol className="mt-8 border-t border-border">
            {steps.map((s) => (
              <li
                key={s.n}
                className="flex gap-5 border-b border-border py-6 sm:gap-8 sm:py-7"
              >
                <span className="font-display text-lg font-bold text-primary sm:text-xl">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold sm:text-2xl">{s.title}</h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Featured green card */}
        <section className="mt-16 sm:mt-24">
          <div className="relative rounded-3xl bg-forest p-8 text-forest-foreground sm:p-12">
            <span className="absolute -top-3 left-8 rounded-full bg-card px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-forest shadow-soft">
              Kind words live here
            </span>
            <p className="font-display text-2xl font-semibold leading-snug sm:text-[2rem]">
              “Chupi is the only place my friends tell me the truth — and somehow it always comes
              out gentle.”
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-widest opacity-70">
              100% anonymous · we never store sender info
            </p>
          </div>
        </section>

        {/* Promises */}
        <section className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-2">
          {promises.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border bg-card p-6 shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1"
            >
              <span
                className={`mb-4 inline-flex size-11 items-center justify-center rounded-2xl ${f.tint}`}
              >
                <f.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-semibold tracking-tight">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>


        <p className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0 text-primary" />
          Fully anonymous — senders never give a name or email.
        </p>
      </main>

      <SafetyFooter />
    </div>
  );
}
