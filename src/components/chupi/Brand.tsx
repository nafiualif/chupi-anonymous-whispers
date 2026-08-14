import { Link } from "@tanstack/react-router";
import { EnvelopeMark } from "./EnvelopeMark";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-2xl bg-card shadow-soft sm:size-10">
        <EnvelopeMark className="size-6 sm:size-7" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-brand-gradient sm:text-2xl">
        Chupi
      </span>
    </Link>
  );
}

export function SafetyFooter() {
  return (
    <p className="mx-auto max-w-md px-6 pb-8 pt-8 text-center text-xs leading-relaxed text-muted-foreground">
      If you're receiving hurtful messages, you can disable your link anytime in settings.
    </p>
  );
}
