import { NextRequest, NextResponse } from 'next/server';

import { trackAlertLocEvent } from '@/lib/alertloc/events';
import { ALERTLOC_PRO_PLAN, isValidUserId } from '@/lib/alertloc/pro';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

type MercadoPagoWebhookBody = {
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
  id?: string | number;
  resource?: string;
  topic?: string;
};

type MercadoPagoMetadata = {
  product?: string;
  user_id?: string;
  plan?: string;
  price?: number;
};

type MercadoPagoPayment = {
  id: number;
  status?: string;
  external_reference?: string | null;
  transaction_amount?: number;
  metadata?: MercadoPagoMetadata | null;
};

type MercadoPagoSubscription = {
  id: string;
  status?: string;
  external_reference?: string | null;
  payer_email?: string | null;
  reason?: string | null;
  metadata?: MercadoPagoMetadata | null;
  auto_recurring?: {
    transaction_amount?: number;
    currency_id?: string;
  } | null;
};

type MercadoPagoAuthorizedPayment = {
  id: number | string;
  status?: string;
  payment_id?: number | string | null;
  preapproval_id?: string | null;
  external_reference?: string | null;
  transaction_amount?: number;
};

type WebhookEvent = {
  resourceId: string | null;
  topic: string | undefined;
};

const MERCADO_PAGO_PAYMENTS_URL = 'https://api.mercadopago.com/v1/payments';
const MERCADO_PAGO_PREAPPROVAL_URL = 'https://api.mercadopago.com/preapproval';
const MERCADO_PAGO_AUTHORIZED_PAYMENTS_URL = 'https://api.mercadopago.com/authorized_payments';

const PAYMENT_TOPICS = new Set(['payment', 'payments']);
const SUBSCRIPTION_TOPICS = new Set(['preapproval', 'subscription_preapproval']);
const AUTHORIZED_PAYMENT_TOPICS = new Set(['authorized_payment', 'subscription_authorized_payment']);

export async function POST(request: NextRequest) {
  return handleMercadoPagoWebhook(request);
}

export async function GET(request: NextRequest) {
  return handleMercadoPagoWebhook(request);
}

async function handleMercadoPagoWebhook(request: NextRequest) {
  try {
    const event = await parseWebhookEvent(request);
    const topic = normalizeTopic(event.topic);

    if (isSimulatedMercadoPagoId(event.resourceId)) {
      console.log('[AlertLoc Pro webhook] evento simulado recebido', {
        topic,
        resourceId: event.resourceId,
      });
      return NextResponse.json({ received: true, simulated: true });
    }

    if (PAYMENT_TOPICS.has(topic)) {
      console.log('[AlertLoc Pro webhook] payment event', {
        topic,
        paymentId: event.resourceId,
      });
      return handlePaymentEvent(event.resourceId);
    }

    if (SUBSCRIPTION_TOPICS.has(topic)) {
      console.log('[AlertLoc Pro webhook] subscription event', {
        topic,
        subscriptionId: event.resourceId,
      });
      return handleSubscriptionEvent(event.resourceId);
    }

    if (AUTHORIZED_PAYMENT_TOPICS.has(topic)) {
      console.log('[AlertLoc Pro webhook] subscription event', {
        topic,
        authorizedPaymentId: event.resourceId,
      });
      return handleAuthorizedPaymentEvent(event.resourceId);
    }

    console.log('[AlertLoc Pro webhook] tópico ignorado', {
      topic: event.topic,
      resourceId: event.resourceId,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[AlertLoc Pro webhook] erro inesperado', getErrorMessage(error));
    return NextResponse.json({ error: 'Erro no webhook.' }, { status: 500 });
  }
}

async function handlePaymentEvent(paymentId: string | null) {
  if (!paymentId) {
    console.log('[AlertLoc Pro webhook] payment event sem id');
    return NextResponse.json({ received: true });
  }

  const payment = await fetchMercadoPagoPayment(paymentId);
  if (!payment) {
    return ignoredMercadoPagoResourceResponse();
  }

  const metadata = payment.metadata ?? {};
  const fallbackUserId = extractUserIdFromExternalReference(payment.external_reference);
  const userId = String(metadata.user_id || fallbackUserId || '').trim();
  const product = getProduct(metadata, payment.external_reference);

  if (product !== ALERTLOC_PRO_PLAN.id) {
    console.log('[AlertLoc Pro webhook] produto ignorado', {
      paymentId,
      product,
    });
    return NextResponse.json({ received: true });
  }

  if (payment.status !== 'approved') {
    await trackPaymentStatusEvent(payment.status, paymentId, userId, Number(payment.transaction_amount));
    console.log('[AlertLoc Pro webhook] pagamento não aprovado', {
      paymentId,
      status: payment.status,
    });
    return NextResponse.json({ received: true });
  }

  const paidAmount = Number(payment.transaction_amount);
  if (!Number.isFinite(paidAmount) || paidAmount < ALERTLOC_PRO_PLAN.price) {
    console.error('[AlertLoc Pro webhook] valor inválido em pagamento aprovado', {
      paymentId,
      paidAmount,
    });
    return NextResponse.json({ received: true });
  }

  await activateProPlan({
    userId,
    source: 'payment',
    sourceId: paymentId,
    amount: paidAmount,
    eventType: 'pro_payment_approved',
  });

  return NextResponse.json({ received: true });
}

async function handleSubscriptionEvent(subscriptionId: string | null) {
  if (!subscriptionId) {
    console.log('[AlertLoc Pro webhook] subscription event sem id');
    return NextResponse.json({ received: true });
  }

  const subscription = await fetchMercadoPagoSubscription(subscriptionId);
  if (!subscription) {
    return ignoredMercadoPagoResourceResponse();
  }

  const metadata = subscription.metadata ?? {};
  const userId = String(metadata.user_id || extractUserIdFromExternalReference(subscription.external_reference) || '').trim();
  const product = getProduct(metadata, subscription.external_reference);
  const status = normalizeStatus(subscription.status);

  console.log('[AlertLoc Pro webhook] subscription status', {
    subscriptionId,
    status,
    payerEmail: subscription.payer_email ? maskEmail(subscription.payer_email) : null,
  });

  if (product !== ALERTLOC_PRO_PLAN.id) {
    console.log('[AlertLoc Pro webhook] assinatura ignorada por produto', {
      subscriptionId,
      product,
    });
    return NextResponse.json({ received: true });
  }

  if (status === 'authorized' || status === 'active') {
    await activateProPlan({
      userId,
      source: 'subscription',
      sourceId: subscriptionId,
      amount: Number(subscription.auto_recurring?.transaction_amount),
      eventType: 'pro_subscription_active',
      extraMetadata: {
        subscription_status: status,
      },
    });
    return NextResponse.json({ received: true });
  }

  if (status === 'cancelled' || status === 'canceled' || status === 'cancelled_by_collector') {
    await trackSubscriptionLifecycleEvent('pro_subscription_cancelled', userId, subscriptionId, status);
    console.log('[AlertLoc Pro webhook] assinatura cancelada; plan_tier mantido', {
      subscriptionId,
      userId,
    });
    return NextResponse.json({ received: true });
  }

  if (status === 'paused') {
    await trackSubscriptionLifecycleEvent('pro_subscription_paused', userId, subscriptionId, status);
    console.log('[AlertLoc Pro webhook] assinatura pausada; plan_tier mantido', {
      subscriptionId,
      userId,
    });
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}

async function handleAuthorizedPaymentEvent(authorizedPaymentId: string | null) {
  if (!authorizedPaymentId) {
    console.log('[AlertLoc Pro webhook] authorized_payment event sem id');
    return NextResponse.json({ received: true });
  }

  const authorizedPayment = await fetchMercadoPagoAuthorizedPayment(authorizedPaymentId);
  if (!authorizedPayment) {
    return ignoredMercadoPagoResourceResponse();
  }

  console.log('[AlertLoc Pro webhook] subscription status', {
    authorizedPaymentId,
    status: authorizedPayment.status,
    preapprovalId: authorizedPayment.preapproval_id,
    paymentId: authorizedPayment.payment_id,
  });

  if (authorizedPayment.payment_id) {
    return handlePaymentEvent(String(authorizedPayment.payment_id));
  }

  if (authorizedPayment.preapproval_id) {
    return handleSubscriptionEvent(authorizedPayment.preapproval_id);
  }

  return NextResponse.json({ received: true });
}

async function activateProPlan({
  userId,
  source,
  sourceId,
  amount,
  eventType,
  extraMetadata = {},
}: {
  userId: string;
  source: 'payment' | 'subscription';
  sourceId: string;
  amount?: number;
  eventType: 'pro_payment_approved' | 'pro_subscription_active';
  extraMetadata?: Record<string, unknown>;
}) {
  if (!userId || !isValidUserId(userId)) {
    console.error('[AlertLoc Pro webhook] user_id inválido ao ativar plano', {
      source,
      sourceId,
    });
    return;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_tier: ALERTLOC_PRO_PLAN.plan,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('[AlertLoc Pro webhook] erro ao ativar plano', {
      source,
      sourceId,
      userId,
      message: error.message,
    });
    throw new Error('Erro ao atualizar plano.');
  }

  await trackAlertLocEvent({
    userId,
    eventType,
    platform: 'web',
    metadata: {
      amount: Number.isFinite(amount) ? amount : null,
      source,
      source_id: sourceId,
      user_id: userId,
      plan: ALERTLOC_PRO_PLAN.plan,
      ...extraMetadata,
    },
  });

  console.log('[AlertLoc Pro webhook] plano ativado', {
    source,
    sourceId,
    userId,
    plan: ALERTLOC_PRO_PLAN.plan,
  });
}

async function trackPaymentStatusEvent(status: string | undefined, paymentId: string, userId: string, amount: number) {
  const eventType = status === 'pending' || status === 'in_process'
    ? 'pro_payment_pending'
    : status === 'rejected' || status === 'cancelled' || status === 'cancelled_by_collector'
      ? 'pro_payment_rejected'
      : null;

  if (!eventType) return;

  await trackAlertLocEvent({
    userId,
    eventType,
    platform: 'web',
    metadata: {
      amount: Number.isFinite(amount) ? amount : null,
      payment_id: paymentId,
      user_id: userId,
      plan: ALERTLOC_PRO_PLAN.plan,
      status,
    },
  });
}

async function trackSubscriptionLifecycleEvent(
  eventType: 'pro_subscription_cancelled' | 'pro_subscription_paused',
  userId: string,
  subscriptionId: string,
  status: string
) {
  await trackAlertLocEvent({
    userId,
    eventType,
    platform: 'web',
    metadata: {
      subscription_id: subscriptionId,
      user_id: userId,
      plan: ALERTLOC_PRO_PLAN.plan,
      status,
    },
  });
}

async function parseWebhookEvent(request: NextRequest): Promise<WebhookEvent> {
  const url = new URL(request.url);
  const queryResourceId = url.searchParams.get('data.id') || url.searchParams.get('id');
  const queryTopic = url.searchParams.get('topic') || url.searchParams.get('type');

  const body = request.method === 'POST'
    ? ((await request.json().catch(() => null)) as MercadoPagoWebhookBody | null)
    : null;

  const bodyTopic = body?.type || body?.topic;
  const bodyResourceId = body?.data?.id ?? body?.id;
  const resourceIdFromPath = body?.resource ? extractResourceIdFromResourceUrl(body.resource) : null;

  return {
    resourceId: String(bodyResourceId || resourceIdFromPath || queryResourceId || '').trim() || null,
    topic: bodyTopic ?? queryTopic ?? undefined,
  };
}

async function fetchMercadoPagoPayment(paymentId: string) {
  const response = await fetchMercadoPago(`${MERCADO_PAGO_PAYMENTS_URL}/${paymentId}`);
  if (!response) return null;
  return (await response.json()) as MercadoPagoPayment;
}

async function fetchMercadoPagoSubscription(subscriptionId: string) {
  const response = await fetchMercadoPago(`${MERCADO_PAGO_PREAPPROVAL_URL}/${subscriptionId}`);
  if (!response) return null;
  return (await response.json()) as MercadoPagoSubscription;
}

async function fetchMercadoPagoAuthorizedPayment(authorizedPaymentId: string) {
  const response = await fetchMercadoPago(`${MERCADO_PAGO_AUTHORIZED_PAYMENTS_URL}/${authorizedPaymentId}`);
  if (!response) return null;
  return (await response.json()) as MercadoPagoAuthorizedPayment;
}

async function fetchMercadoPago(url: string) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado.');
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (response.status === 404 || response.status === 400) {
    console.warn('[AlertLoc Pro webhook] recurso Mercado Pago nao encontrado ou simulado', {
      status: response.status,
      url,
    });
    return null;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Mercado Pago respondeu ${response.status}: ${body.slice(0, 160)}`);
  }

  return response;
}

function extractResourceIdFromResourceUrl(value: string) {
  const match = value.match(/\/(?:payments|preapproval|authorized_payments)\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function getProduct(metadata: MercadoPagoMetadata, externalReference?: string | null) {
  return metadata.product || (externalReference?.startsWith('alertloc_pro:') ? ALERTLOC_PRO_PLAN.id : undefined);
}

function extractUserIdFromExternalReference(value?: string | null) {
  if (!value?.startsWith('alertloc_pro:')) return null;
  return value.slice('alertloc_pro:'.length);
}

function normalizeTopic(topic?: string) {
  return String(topic || '').trim().toLowerCase();
}

function normalizeStatus(status?: string) {
  return String(status || '').trim().toLowerCase();
}

function isSimulatedMercadoPagoId(resourceId: string | null) {
  return String(resourceId || '').trim() === '123456';
}

function ignoredMercadoPagoResourceResponse() {
  console.log('[AlertLoc Pro webhook] recurso Mercado Pago nao encontrado ou simulado');
  return NextResponse.json({ received: true, ignored: true });
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!name || !domain) return '***';
  return `${name.slice(0, 2)}***@${domain}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
