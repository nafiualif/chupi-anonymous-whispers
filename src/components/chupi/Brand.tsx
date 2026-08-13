import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-2xl bg-brand-gradient shadow-soft">
        <span className="font-display text-lg font-bold text-primary-foreground">C</span>
      </span>
      <span className="font-display text-2xl font-bold tracking-tight text-brand-gradient">Chupi</span>
    </Link>
  );
}

export function SafetyFooter() {
  return (
    <p className="mx-auto max-w-md px-6 pb-10 pt-8 text-center text-xs leading-relaxed text-muted-foreground">
      If you're receiving hurtful messages, you can disable your link anytime in settings.
    </p>
  );
}
