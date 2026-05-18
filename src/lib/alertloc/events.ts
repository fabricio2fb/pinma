import { createServiceRoleClient } from '@/lib/supabase/service-role';

export type AlertLocEventType =
  | 'app_opened'
  | 'apk_download_clicked'
  | 'signup_completed'
  | 'login_completed'
  | 'reminder_created'
  | 'reminder_completed'
  | 'reminder_deleted'
  | 'saved_place_created'
  | 'group_created'
  | 'group_invite_sent'
  | 'group_invite_accepted'
  | 'notification_sent'
  | 'geofencing_enabled'
  | 'geofencing_disabled'
  | 'location_tracking_enabled'
  | 'location_tracking_disabled'
  | 'pro_checkout_started'
  | 'pro_payment_approved'
  | 'pro_payment_pending'
  | 'pro_payment_rejected'
  | 'pro_subscription_active'
  | 'pro_subscription_cancelled'
  | 'pro_subscription_paused'
  | 'app_error';

type TrackAlertLocEventInput = {
  userId?: string | null;
  eventType: AlertLocEventType;
  appVersion?: string | null;
  platform?: string | null;
  metadata?: Record<string, unknown>;
};

const BLOCKED_METADATA_KEYS = new Set(['lat', 'lng', 'latitude', 'longitude', 'coords', 'location']);

export async function trackAlertLocEvent({
  userId,
  eventType,
  appVersion = null,
  platform = 'web',
  metadata = {},
}: TrackAlertLocEventInput) {
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('alertloc_events').insert({
      user_id: userId ?? null,
      event_type: eventType,
      app_version: appVersion,
      platform,
      metadata: sanitizeMetadata(metadata),
    });

    if (error) {
      console.warn('[AlertLoc analytics] evento ignorado', {
        eventType,
        message: error.message,
      });
    }
  } catch (error) {
    console.warn('[AlertLoc analytics] indisponivel', error instanceof Error ? error.message : String(error));
  }
}

// Eventos de produto nunca devem carregar localizacao exata ou dados sensiveis.
function sanitizeMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) => {
      if (BLOCKED_METADATA_KEYS.has(key.toLowerCase())) return false;
      return typeof value !== 'undefined';
    })
  );
}
