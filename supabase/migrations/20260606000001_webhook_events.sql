-- Tabela de deduplicação de webhooks Asaas (at-least-once delivery)
-- Apenas service_role (edge function) grava aqui — sem RLS necessária.
create table if not exists webhook_events (
  id           bigserial    primary key,
  event_id     text         not null,
  event_type   text         not null,
  customer_id  text         not null,
  user_id      uuid,
  processed_at timestamptz  not null default now(),
  constraint webhook_events_dedup unique (event_id, event_type)
);

create index if not exists webhook_events_lookup_idx
  on webhook_events (event_id, event_type);
