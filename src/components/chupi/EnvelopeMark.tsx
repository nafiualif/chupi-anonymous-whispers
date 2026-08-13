type Props = { className?: string };

/** Small folded envelope with a wax seal — the Chupi brand mark. */
export function EnvelopeMark({ className }: Props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="10" width="40" height="28" rx="6" className="fill-[var(--envelope-paper)]" />
      <rect
        x="4"
        y="10"
        width="40"
        height="28"
        rx="6"
        className="stroke-[var(--envelope-line)]"
        strokeWidth="2"
      />
      <path
        d="M5.5 14.5 22.1 26.4a3.2 3.2 0 0 0 3.8 0L42.5 14.5"
        className="stroke-[var(--envelope-line)]"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 36.5 18.5 26M42 36.5 29.5 26"
        className="stroke-[var(--envelope-line)]"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="24" cy="28" r="7" className="fill-[var(--seal)]" />
      <circle cx="24" cy="28" r="7" className="stroke-[var(--seal-ring)]" strokeWidth="1.5" />
      <path
        d="M21 28h6M24 25v6"
        className="stroke-[var(--seal-foreground)]"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/** Larger decorative letter illustration for the landing hero. */
export function EnvelopeIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 220 170" fill="none" className={className} aria-hidden="true">
      <ellipse cx="110" cy="150" rx="86" ry="12" className="fill-[var(--seal)]" opacity="0.1" />
      <g className="animate-letter-float">
        <path
          d="M52 34h116a8 8 0 0 1 8 8v14L110 96 44 56V42a8 8 0 0 1 8-8Z"
          className="fill-[var(--envelope-paper)] stroke-[var(--envelope-line)]"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect
          x="62"
          y="16"
          width="96"
          height="72"
          rx="6"
          className="fill-[var(--envelope-paper)] stroke-[var(--envelope-line)]"
          strokeWidth="2"
        />
        <path
          d="M76 36h68M76 48h68M76 60h44"
          className="stroke-[var(--envelope-line)]"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M44 56v66a8 8 0 0 0 8 8h116a8 8 0 0 0 8-8V56l-60 38a12 12 0 0 1-12 0L44 56Z"
          className="fill-[var(--envelope-body)] stroke-[var(--envelope-line)]"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="110" cy="98" r="16" className="fill-[var(--seal)]" />
        <circle cx="110" cy="98" r="16" className="stroke-[var(--seal-ring)]" strokeWidth="2.5" />
        <path
          d="M103 98h14M110 91v14"
          className="stroke-[var(--seal-foreground)]"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}
