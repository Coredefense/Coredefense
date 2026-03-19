alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists stripe_payment_intent text;
alter table public.orders add column if not exists paid_at timestamptz;

create unique index if not exists orders_stripe_session_id_key on public.orders(stripe_session_id);
