import { NextRequest, NextResponse } from 'next/server';

import { trackAlertLocEvent } from '@/lib/alertloc/events';

export async function GET(request: NextRequest) {
  const apkUrl = process.env.ALERTLOC_APK_URL?.trim();

  await trackAlertLocEvent({
    eventType: 'apk_download_clicked',
    platform: 'web',
    metadata: {
      referrer: request.headers.get('referer') || null,
      user_agent: request.headers.get('user-agent') || null,
    },
  });

  if (!apkUrl) {
    return NextResponse.json({ error: 'ALERTLOC_APK_URL nao configurada.' }, { status: 503 });
  }

  return NextResponse.redirect(apkUrl);
}
