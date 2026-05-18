import { NextRequest, NextResponse } from 'next/server';

import { trackAlertLocEvent } from '@/lib/alertloc/events';

export async function GET(request: NextRequest) {
  const apkUrl = process.env.ALERTLOC_APK_URL?.trim() || '/downloads/AlertLoc-v1.0.1.apk';

  await trackAlertLocEvent({
    eventType: 'apk_download_clicked',
    platform: 'web',
    metadata: {
      referrer: request.headers.get('referer') || null,
      user_agent: request.headers.get('user-agent') || null,
    },
  });

  return NextResponse.redirect(apkUrl);
}
