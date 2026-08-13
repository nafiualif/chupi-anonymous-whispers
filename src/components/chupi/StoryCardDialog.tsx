import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type StoryMessage = { id: string; content: string; reply: string | null };

export function StoryCardDialog({
  message,
  displayName,
  onOpenChange,
}: {
  message: StoryMessage | null;
  displayName: string;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");

  useEffect(() => {
    setReply(message?.reply ?? "");
  }, [message]);

  const saveReply = useMutation({
    mutationFn: async () => {
      if (!message) return;
      const { error } = await supabase
        .from("messages")
        .update({ reply: reply.trim() || null })
        .eq("id", message.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reply saved — screenshot the card and share it!");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: () => toast.error("Couldn't save your reply"),
  });

  return (
    <Dialog open={!!message} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Reply publicly</DialogTitle>
          <DialogDescription>
            Write a reply, then screenshot the card below to post it on your story.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-3xl bg-brand-gradient p-6 text-primary-foreground shadow-lift">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Anonymous message
          </p>
          <p className="mt-3 whitespace-pre-wrap font-display text-lg font-semibold leading-snug">
            {message?.content}
          </p>
          {reply.trim() && (
            <div className="mt-5 rounded-2xl bg-card/90 p-4 text-card-foreground">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {displayName || "My"} reply
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{reply}</p>
            </div>
          )}
          <p className="mt-5 text-right text-xs font-semibold opacity-80">chupi</p>
        </div>

        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write your public reply…"
          rows={3}
          className="rounded-2xl bg-background/70"
        />

        <Button
          onClick={() => saveReply.mutate()}
          disabled={saveReply.isPending}
          className="w-full rounded-full bg-brand-gradient shadow-soft"
        >
          <Camera className="size-4" /> Save reply
        </Button>
      </DialogContent>
    </Dialog>
  );
}
