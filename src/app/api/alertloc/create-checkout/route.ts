import { NextRequest, NextResponse } from 'next/server';

import { ALERTLOC_PRO_PLAN, isValidUserId } from '@/lib/alertloc/pro';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

type MercadoPagoPreferenceResponse = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  message?: string;
  error?: string;
};

const MERCADO_PAGO_PREFERENCES_URL = 'https://api.mercadopago.com/checkout/preferences';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { user_id?: string } | null;
    const userId = body?.user_id?.trim() ?? '';

    if (!userId || !isValidUserId(userId)) {
      return NextResponse.json({ error: 'user_id inválido.' }, { status: 400 });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('[AlertLoc Pro] MERCADO_PAGO_ACCESS_TOKEN não configurado.');
      return NextResponse.json({ error: 'Checkout indisponível.' }, { status: 500 });
    }

    const supabase = createServiceRoleClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('[AlertLoc Pro] erro ao validar profile', {
        userId,
        message: profileError.message,
      });
      return NextResponse.json({ error: 'Erro ao validar usuário.' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const baseUrl = getBaseUrl(request);
    const metadata = {
      product: ALERTLOC_PRO_PLAN.id,
      user_id: userId,
      plan: ALERTLOC_PRO_PLAN.plan,
      price: ALERTLOC_PRO_PLAN.price,
    };

    const preferencePayload = {
      items: [
        {
          id: ALERTLOC_PRO_PLAN.id,
          title: ALERTLOC_PRO_PLAN.name,
          description: ALERTLOC_PRO_PLAN.description,
          quantity: 1,
          unit_price: ALERTLOC_PRO_PLAN.price,
          currency_id: ALERTLOC_PRO_PLAN.currency,
        },
      ],
      payer: profile.email ? { email: profile.email } : undefined,
      back_urls: {
        success: `${baseUrl}/alertloc/pro/success`,
        failure: `${baseUrl}/alertloc/pro/failure`,
        pending: `${baseUrl}/alertloc/pro/pending`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhooks/mercado-pago/alertloc`,
      external_reference: `alertloc_pro:${userId}`,
      metadata,
    };

    const response = await fetch(MERCADO_PAGO_PREFERENCES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencePayload),
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => ({}))) as MercadoPagoPreferenceResponse;

    if (!response.ok || !data.init_point) {
      console.error('[AlertLoc Pro] erro Mercado Pago create preference', {
        status: response.status,
        message: data.message || data.error || 'sem mensagem',
      });
      return NextResponse.json({ error: 'Não foi possível criar o checkout.' }, { status: 502 });
    }

    console.log('[AlertLoc Pro] checkout criado', {
      userId,
      preferenceId: data.id,
    });

    return NextResponse.json({
      checkout_url: data.init_point,
      init_point: data.init_point,
      preference_id: data.id,
    });
  } catch (error) {
    console.error('[AlertLoc Pro] create-checkout erro inesperado', getErrorMessage(error));
    return NextResponse.json({ error: 'Erro interno ao iniciar checkout.' }, { status: 500 });
  }
}

function getBaseUrl(request: NextRequest) {
  const configuredUrl = process.env.NEXT_PUBLIC_ALERTLOC_PRO_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host');

  if (!host) return new URL(request.url).origin;
  return `${forwardedProto}://${host}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
