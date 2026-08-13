import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand, SafetyFooter } from "@/components/chupi/Brand";
import { Button } from "@/components/ui/button";
import { Heart, Lock, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chupi — Get anonymous messages from friends" },
      {
        name: "description",
        content:
          "Share your Chupi link and collect honest, anonymous messages. Filtered for hate and harassment, and you can switch your link off anytime.",
      },
      { property: "og:title", content: "Chupi — Get anonymous messages from friends" },
      {
        property: "og:description",
        content: "Share your link, collect kind anonymous messages, reply publicly with story cards.",
      },
    ],
  }),
  component: Home,
});

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
        <section className="pt-8 text-center sm:pt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Honest words, zero pressure
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            What do your friends
            <br />
            <span className="text-brand-gradient">really</span> want to tell you?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Chupi gives you one little link. Share it, and anyone can send you an anonymous
            message — kindly, safely, and without signing up.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-2">
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
