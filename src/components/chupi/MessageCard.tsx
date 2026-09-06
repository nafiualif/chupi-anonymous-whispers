import { motion } from "motion/react";
import { Ban, Bookmark, Flag, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelative } from "@/lib/chupi-ui";
import { cn } from "@/lib/utils";

export type InboxMessage = {
  id: string;
  content: string;
  created_at: string;
  is_reported: boolean;
  reply: string | null;
  sender_hash: string | null;
};

type Props = {
  message: InboxMessage;
  index: number;
  saved: boolean;
  unread: boolean;
  onShare: () => void;
  onReport: () => void;
  onBlock: () => void;
  onDelete: () => void;
  onToggleSave: () => void;
  onSeen: () => void;
};

export function MessageCard({
  message: m,
  index,
  saved,
  unread,
  onShare,
  onReport,
  onBlock,
  onDelete,
  onToggleSave,
  onSeen,
}: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.38, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onSeen}
      onTouchStart={onSeen}
      className={cn(
        "glass-card group relative overflow-hidden rounded-3xl p-5 transition-transform duration-150 active:scale-[0.99] sm:p-6",
        unread && "ring-1 ring-primary/25",
      )}
    >
      {unread && (
        <span
          aria-label="Unread"
          className="absolute right-5 top-5 size-2 rounded-full bg-primary shadow-soft"
        />
      )}

      <span
        aria-hidden="true"
        className="animate-quote-drop pointer-events-none absolute -left-1 -top-6 select-none font-display text-[5.5rem] leading-none text-primary/10"
        style={{ animationDelay: `${Math.min(index, 8) * 0.05 + 0.12}s` }}
      >
        &ldquo;
      </span>

      <p className="relative whitespace-pre-wrap break-words pl-6 font-display text-lg font-semibold leading-relaxed tracking-tight text-foreground sm:text-xl">
        {m.content}
      </p>


      {m.reply && (
        <p className="mt-4 rounded-2xl bg-accent/60 p-3.5 text-sm leading-relaxed text-accent-foreground">
          <span className="font-semibold">Your reply — </span>
          {m.reply}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-border/50 pt-4">
        <Button
          size="sm"
          onClick={onShare}
          className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-150 hover:bg-primary/90 active:scale-[0.97] sm:text-sm"
        >
          <Sparkles className="size-4" /> Share to Story
        </Button>

        <span className="ml-1 truncate text-[11px] text-muted-foreground sm:text-xs">
          {formatRelative(m.created_at)}
          {m.is_reported && " · reported"}
        </span>

        <div className="ml-auto flex items-center">
          <Button
            size="sm"
            variant="ghost"
            aria-label={saved ? "Unsave message" : "Save message"}
            title={saved ? "Saved" : "Save"}
            onClick={onToggleSave}
            className={cn(
              "size-9 rounded-full p-0 text-muted-foreground transition-colors hover:text-foreground active:scale-[0.94]",
              saved && "text-primary hover:text-primary",
            )}
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                aria-label="More actions"
                className="size-9 rounded-full p-0 text-muted-foreground transition-colors hover:text-foreground active:scale-[0.94]"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={onBlock} className="rounded-xl">
                <Ban className="size-4" /> Block sender
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onReport}
                disabled={m.is_reported}
                className="rounded-xl"
              >
                <Flag className="size-4" /> Report message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="rounded-xl text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.article>
  );
}
