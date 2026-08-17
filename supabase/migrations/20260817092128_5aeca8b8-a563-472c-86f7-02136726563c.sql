ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_hash text;

CREATE TABLE public.message_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('harassment','spam','hate','sexual','other')),
  details text,
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);
GRANT SELECT, INSERT ON public.message_reports TO authenticated;
GRANT ALL ON public.message_reports TO service_role;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporters can read their reports" ON public.message_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Reporters can create their reports" ON public.message_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE TABLE public.blocked_senders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sender_hash text not null,
  created_at timestamptz not null default now(),
  unique (user_id, sender_hash)
);
GRANT SELECT, INSERT, DELETE ON public.blocked_senders TO authenticated;
GRANT ALL ON public.blocked_senders TO service_role;
ALTER TABLE public.blocked_senders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own blocks" ON public.blocked_senders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_blocked_senders_lookup ON public.blocked_senders (user_id, sender_hash);