-- AlertLoc analytics de produto.
-- Privacidade: nao coletar localizacao exata, lat/lng, trajetos ou mapa em tempo real de usuarios.
-- Este schema registra eventos agregaveis do app/produto para painel administrativo.

create table if not exists public.alertloc_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null references auth.users(id) on delete set null,
  event_type text not null,
  app_version text null,
  platform text not null default 'android',
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists alertloc_events_created_at_idx
  on public.alertloc_events (created_at desc);

create index if not exists alertloc_events_event_type_created_at_idx
  on public.alertloc_events (event_type, created_at desc);

create index if not exists alertloc_events_user_id_created_at_idx
  on public.alertloc_events (user_id, created_at desc)
  where user_id is not null;

create unique index if not exists alertloc_events_payment_approved_payment_id_uidx
  on public.alertloc_events ((metadata->>'payment_id'))
  where event_type = 'pro_payment_approved' and metadata ? 'payment_id';

alter table public.alertloc_events enable row level security;

drop policy if exists "alertloc_events_insert_app_events" on public.alertloc_events;
create policy "alertloc_events_insert_app_events"
  on public.alertloc_events
  for insert
  to anon, authenticated
  with check (
    user_id is null
    or auth.uid() = user_id
  );

-- Sem policy de SELECT para anon/authenticated.
-- Leitura do painel deve usar apenas SUPABASE_SERVICE_ROLE_KEY no servidor.
