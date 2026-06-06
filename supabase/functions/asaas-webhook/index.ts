// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AsaasPayment {
  id: string;
  customer: string;
  subscription?: string;
  dueDate: string;            // "YYYY-MM-DD"
  externalReference?: string; // user_id quando preenchido na criação
}

interface AsaasSubscription {
  id: string;
  customer: string;
}

interface WebhookPayload {
  event: string;
  payment?: AsaasPayment;
  subscription?: AsaasSubscription;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Dias por ciclo Asaas — usado para calcular valid_until
const CYCLE_DAYS: Record<string, number> = {
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
  BIMONTHLY: 60,
  QUARTERLY: 90,
  SEMIANNUALLY: 180,
  YEARLY: 365,
};

function addCycleDays(dueDateStr: string, cycleDays: number): string {
  const d = new Date(dueDateStr + "T12:00:00Z");
  d.setDate(d.getDate() + cycleDays);
  return d.toISOString();
}

async function recordEvent(
  supabase: any,
  eventId: string,
  eventType: string,
  customerId: string,
  userId: string | null,
): Promise<void> {
  await supabase.from("webhook_events").insert({
    event_id: eventId,
    event_type: eventType,
    customer_id: customerId,
    user_id: userId,
    processed_at: new Date().toISOString(),
  });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 1. Validar token de autenticação do webhook
    const incoming = req.headers.get("asaas-access-token") ?? "";
    const secret = Deno.env.get("ASAAS_WEBHOOK_SECRET") ?? "";
    if (!secret || incoming !== secret) {
      return json({ error: "unauthorized" }, 401);
    }

    // 2. Parse do payload
    let payload: WebhookPayload;
    try {
      payload = await req.json();
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    const { event, payment, subscription } = payload;
    const eventId = payment?.id ?? subscription?.id;

    if (!event || !eventId) {
      return json({ error: "missing_event_data" }, 400);
    }

    // 3. Cliente Supabase com service_role (única role que grava em entitlements)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 4. Deduplicação por (event_id, event_type) — at-least-once safe
    const { data: dup } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("event_id", eventId)
      .eq("event_type", event)
      .maybeSingle();

    if (dup) {
      return json({ status: "duplicate" }, 200);
    }

    // 5. Resolver customer_id e user_id
    const customerId = payment?.customer ?? subscription?.customer;
    if (!customerId) {
      return json({ error: "missing_customer" }, 400);
    }

    let userId: string | null = null;

    // Preferência: externalReference = user_id (zero lookup)
    if (payment?.externalReference) {
      userId = payment.externalReference;
    } else {
      const { data: ent } = await supabase
        .from("entitlements")
        .select("user_id")
        .eq("asaas_customer_id", customerId)
        .maybeSingle();
      userId = ent?.user_id ?? null;
    }

    if (!userId) {
      // Sem mapeamento — logar e retornar 200 para Asaas não retentar
      console.warn(`[asaas-webhook] customer sem mapeamento: ${customerId}`);
      await recordEvent(supabase, eventId, event, customerId, null);
      return json({ status: "unmapped_customer" }, 200);
    }

    // 6. Montar patch de entitlement conforme evento
    const now = new Date().toISOString();
    let patch: Record<string, unknown> = { updated_at: now };

    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      // Busca o plano para determinar o ciclo de renovação
      const { data: ent } = await supabase
        .from("entitlements")
        .select("plan")
        .eq("user_id", userId)
        .maybeSingle();

      const cycleDays = CYCLE_DAYS[ent?.plan ?? "MONTHLY"] ?? CYCLE_DAYS.MONTHLY;
      const validUntil = addCycleDays(payment!.dueDate, cycleDays);

      patch = { ...patch, status: "active", valid_until: validUntil };

    } else if (event === "PAYMENT_OVERDUE") {
      patch = { ...patch, status: "overdue" };

    } else if (event === "PAYMENT_DELETED" || event === "SUBSCRIPTION_INACTIVATED") {
      patch = { ...patch, status: "inactive", valid_until: null };

    } else {
      // Evento não mapeado — auditar e ignorar
      await recordEvent(supabase, eventId, event, customerId, userId);
      return json({ status: "unhandled_event", event }, 200);
    }

    // 7. Atualizar entitlement + registrar evento (em paralelo)
    await Promise.all([
      supabase.from("entitlements").update(patch).eq("user_id", userId),
      recordEvent(supabase, eventId, event, customerId, userId),
    ]);

    console.log(`[asaas-webhook] ${event} → user ${userId} → ${patch.status}`);
    return json({ status: "ok", event, userId }, 200);

  } catch (err) {
    console.error("[asaas-webhook] erro inesperado:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
