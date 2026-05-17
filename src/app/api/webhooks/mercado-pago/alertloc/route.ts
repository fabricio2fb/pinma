import { NextRequest, NextResponse } from 'next/server';

import { ALERTLOC_PRO_PLAN, isValidUserId } from '@/lib/alertloc/pro';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

type MercadoPagoWebhookBody = {
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
  resource?: string;
  topic?: string;
};

type MercadoPagoPayment = {
  id: number;
  status?: string;
  external_reference?: string | null;
  transaction_amount?: number;
  metadata?: {
    product?: string;
    user_id?: string;
    plan?: string;
    price?: number;
  } | null;
};

const MERCADO_PAGO_PAYMENTS_URL = 'https://api.mercadopago.com/v1/payments';

export async function POST(request: NextRequest) {
  return handleMercadoPagoWebhook(request);
}

export async function GET(request: NextRequest) {
  return handleMercadoPagoWebhook(request);
}

async function handleMercadoPagoWebhook(request: NextRequest) {
  try {
    const event = await parseWebhookEvent(request);

    if (event.topic && !['payment', 'payments'].includes(event.topic)) {
      console.log('[AlertLoc Pro webhook] tópico ignorado', {
        topic: event.topic,
      });
      return NextResponse.json({ received: true });
    }

    const paymentId = event.paymentId;

    if (!paymentId) {
      console.log('[AlertLoc Pro webhook] evento ignorado sem payment id');
      return NextResponse.json({ received: true });
    }

    const payment = await fetchMercadoPagoPayment(paymentId);

    if (payment.status !== 'approved') {
      console.log('[AlertLoc Pro webhook] pagamento não aprovado', {
        paymentId,
        status: payment.status,
      });
      return NextResponse.json({ received: true });
    }

    const metadata = payment.metadata ?? {};
    const fallbackUserId = extractUserIdFromExternalReference(payment.external_reference);
    const userId = String(metadata.user_id || fallbackUserId || '').trim();
    const product = metadata.product || (payment.external_reference?.startsWith('alertloc_pro:') ? ALERTLOC_PRO_PLAN.id : undefined);

    if (product !== ALERTLOC_PRO_PLAN.id) {
      console.log('[AlertLoc Pro webhook] produto ignorado', {
        paymentId,
        product,
      });
      return NextResponse.json({ received: true });
    }

    if (!userId || !isValidUserId(userId)) {
      console.error('[AlertLoc Pro webhook] user_id inválido em pagamento aprovado', {
        paymentId,
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
        paymentId,
        userId,
        message: error.message,
      });
      return NextResponse.json({ error: 'Erro ao atualizar plano.' }, { status: 500 });
    }

    console.log('[AlertLoc Pro webhook] plano ativado', {
      paymentId,
      userId,
      plan: ALERTLOC_PRO_PLAN.plan,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[AlertLoc Pro webhook] erro inesperado', getErrorMessage(error));
    return NextResponse.json({ error: 'Erro no webhook.' }, { status: 500 });
  }
}

async function parseWebhookEvent(request: NextRequest) {
  const url = new URL(request.url);
  const queryDataId = url.searchParams.get('data.id') || url.searchParams.get('id');
  const queryTopic = url.searchParams.get('topic') || url.searchParams.get('type');

  if (queryDataId && /^\d+$/.test(queryDataId)) {
    return {
      paymentId: queryDataId,
      topic: queryTopic ?? undefined,
    };
  }

  const body = request.method === 'POST'
    ? ((await request.json().catch(() => null)) as MercadoPagoWebhookBody | null)
    : null;
  const bodyTopic = body?.type || body?.topic;

  const bodyId = body?.data?.id;
  if (bodyId && /^\d+$/.test(String(bodyId))) {
    return {
      paymentId: String(bodyId),
      topic: bodyTopic,
    };
  }

  if (body?.resource) {
    const match = body.resource.match(/\/payments\/(\d+)/);
    if (match?.[1]) {
      return {
        paymentId: match[1],
        topic: bodyTopic,
      };
    }
  }

  return {
    paymentId: null,
    topic: bodyTopic ?? queryTopic ?? undefined,
  };
}

async function fetchMercadoPagoPayment(paymentId: string) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado.');
  }

  const response = await fetch(`${MERCADO_PAGO_PAYMENTS_URL}/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Mercado Pago payment ${paymentId} respondeu ${response.status}: ${body.slice(0, 160)}`);
  }

  return (await response.json()) as MercadoPagoPayment;
}

function extractUserIdFromExternalReference(value?: string | null) {
  if (!value?.startsWith('alertloc_pro:')) return null;
  return value.slice('alertloc_pro:'.length);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
