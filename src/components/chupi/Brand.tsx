import { Link } from "@tanstack/react-router";
import { EnvelopeMark } from "./EnvelopeMark";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-card sm:size-10">
        <EnvelopeMark className="size-5 sm:size-6" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-foreground sm:text-[1.4rem]">
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
