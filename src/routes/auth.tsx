import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile } from "@/lib/chupi.functions";
import { Brand, SafetyFooter } from "@/components/chupi/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or sign up — Chupi" },
      { name: "robots", content: "noindex, nofollow" },

      {
        name: "description",
        content: "Create your free Chupi account to get a personal link for anonymous messages.",
      },
      { property: "og:title", content: "Log in or sign up — Chupi" },
      {
        property: "og:description",
        content: "Create your free Chupi account to get a personal link for anonymous messages.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        await ensureProfile({ data: { displayName } });
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await ensureProfile({ data: {} });
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Brand />
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pt-4">
        <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card-gradient p-7 shadow-soft">
          {checkEmail ? (
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold">Check your email</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-medium">{email}</span>. Click it
                to activate your Chupi link.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-full"
                onClick={() => {
                  setCheckEmail(false);
                  setMode("login");
                }}
              >
                Back to log in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">
                {mode === "login" ? "Welcome back" : "Create your Chupi"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === "login"
                  ? "Log in to read your anonymous messages."
                  : "It takes a few seconds and it's free."}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nafiu"
                      required
                      className="rounded-2xl bg-background/70"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="rounded-2xl bg-background/70"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="rounded-2xl bg-background/70"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-brand-gradient shadow-soft"
                >
                  {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "login" ? "New to Chupi?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                >
                  {mode === "login" ? "Create an account" : "Log in"}
                </button>
              </p>
            </>
          )}
        </div>
      </main>

      <div className="mt-6 text-center">
        <Link to="/" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
      <SafetyFooter />
    </div>
  );
}
