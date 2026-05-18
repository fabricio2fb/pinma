import styles from './admin-alertloc.module.css';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export const dynamic = 'force-dynamic';

type AdminAlertLocPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

type MetricCard = {
  label: string;
  value: string;
  hint?: string;
};

type EventRow = {
  id: string;
  created_at: string;
  event_type: string;
  user_id?: string | null;
  app_version?: string | null;
  platform?: string | null;
  metadata?: Record<string, unknown> | null;
};

export default async function AdminAlertLocPage({ searchParams }: AdminAlertLocPageProps) {
  const params = await searchParams;
  const adminToken = process.env.ALERTLOC_ADMIN_TOKEN;
  const token = params.token?.trim() ?? '';

  if (!adminToken || token !== adminToken) {
    return (
      <main className={styles.adminPage}>
        <section className={styles.deniedCard}>
          <span>Admin</span>
          <h1>Acesso negado</h1>
          <p>Informe um token administrativo válido para carregar as métricas do AlertLoc.</p>
        </section>
      </main>
    );
  }

  const data = await loadDashboardData();

  return (
    <main className={styles.adminPage}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>AlertLoc Admin</span>
          <h1>Monitoramento do produto</h1>
          <p>Indicadores agregados do aplicativo. Sem localização individual, sem mapa em tempo real e sem rastrear pessoas.</p>
        </div>
        <div className={styles.statusPill}>Privado</div>
      </header>

      <section className={styles.metricGrid}>
        {data.cards.map((card) => (
          <article key={card.label} className={styles.metricCard}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            {card.hint ? <p>{card.hint}</p> : null}
          </article>
        ))}
      </section>

      <section className={styles.columns}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Novos usuários por dia</h2>
            <span>7 dias</span>
          </div>
          <SimpleTable
            columns={['Dia', 'Usuários']}
            rows={data.usersByDay.map((row) => [row.date, String(row.count)])}
          />
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Downloads por dia</h2>
            <span>7 dias</span>
          </div>
          <SimpleTable
            columns={['Dia', 'Downloads']}
            rows={data.downloadsByDay.map((row) => [row.date, String(row.count)])}
          />
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Receita por dia</h2>
            <span>Eventos aprovados</span>
          </div>
          <SimpleTable
            columns={['Dia', 'Receita']}
            rows={data.revenueByDay.map((row) => [row.date, formatCurrency(row.amount)])}
          />
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Versões do APK</h2>
            <span>Eventos app_opened</span>
          </div>
          <SimpleTable
            columns={['Versão', 'Eventos']}
            rows={data.apkVersions.map((row) => [row.version, String(row.count)])}
          />
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Eventos recentes</h2>
          <span>Últimos 25</span>
        </div>
        <SimpleTable
          columns={['Quando', 'Evento', 'Plataforma', 'Versão']}
          rows={data.recentEvents.map((event) => [
            formatDateTime(event.created_at),
            event.event_type,
            event.platform || '-',
            event.app_version || '-',
          ])}
        />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Últimos pagamentos</h2>
          <span>Aprovados</span>
        </div>
        <SimpleTable
          columns={['Quando', 'Usuário', 'Valor', 'Pagamento']}
          rows={data.latestPayments.map((event) => [
            formatDateTime(event.created_at),
            event.user_id || '-',
            formatCurrency(Number(event.metadata?.amount ?? 0)),
            String(event.metadata?.payment_id ?? '-'),
          ])}
        />
      </section>

      <section className={styles.privacyNote}>
        <strong>Privacidade</strong>
        <p>
          Este painel usa eventos de produto agregados. Não coleta coordenadas, não exibe deslocamento, não mostra mapa de usuários
          e não deve ser usado para monitorar pessoas.
        </p>
      </section>
    </main>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>Sem dados ainda.</td>
            </tr>
          ) : rows.map((row, index) => (
            <tr key={`${row.join('-')}-${index}`}>
              {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function loadDashboardData() {
  const supabase = createServiceRoleClient();
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    usersTotal,
    usersToday,
    usersSevenDays,
    usersPro,
    remindersTotal,
    remindersActive,
    remindersCompleted,
    savedPlaces,
    groups,
    invitesSent,
    invitesAccepted,
    downloads,
    approvedPayments,
    notificationEvents,
    geofencingEnabled,
    appErrors,
    geoapifyEvents,
    overpassEvents,
    eventsSevenDays,
    approvedPaymentEvents,
    recentEvents,
  ] = await Promise.all([
    countRows(supabase, 'profiles'),
    countRows(supabase, 'profiles', { column: 'created_at', gte: todayStart.toISOString() }),
    countRows(supabase, 'profiles', { column: 'created_at', gte: sevenDaysAgo.toISOString() }),
    countRows(supabase, 'profiles', { column: 'plan_tier', eq: 'pro' }),
    countRows(supabase, 'reminders'),
    countRows(supabase, 'reminders', { column: 'is_active', eq: true }),
    countRows(supabase, 'reminders', { column: 'is_active', eq: false }),
    countRows(supabase, 'saved_places'),
    countRows(supabase, 'groups'),
    countRows(supabase, 'group_invites'),
    countRows(supabase, 'group_invites', { column: 'status', eq: 'accepted' }),
    countEvent(supabase, 'apk_download_clicked'),
    countEvent(supabase, 'pro_payment_approved'),
    countEvent(supabase, 'notification_sent'),
    countEvent(supabase, 'geofencing_enabled'),
    countEvent(supabase, 'app_error'),
    countEvent(supabase, 'geoapify_request'),
    countEvent(supabase, 'overpass_request'),
    listEventsSince(supabase, sevenDaysAgo.toISOString()),
    listEventsByType(supabase, 'pro_payment_approved', 5000),
    listRecentEvents(supabase),
  ]);

  const freeUsers = Math.max(usersTotal - usersPro, 0);
  const activeToday = distinctUsersSince(eventsSevenDays, todayStart);
  const activeSevenDays = distinctUsersSince(eventsSevenDays, sevenDaysAgo);
  const revenueTotal = sumRevenue(approvedPaymentEvents, null);
  const revenueMonth = sumRevenue(approvedPaymentEvents, monthStart);
  const conversion = usersTotal > 0 ? (usersPro / usersTotal) * 100 : 0;

  const cards: MetricCard[] = [
    { label: 'Usuários totais', value: formatNumber(usersTotal) },
    { label: 'Novos hoje', value: formatNumber(usersToday) },
    { label: 'Novos 7 dias', value: formatNumber(usersSevenDays) },
    { label: 'Ativos hoje', value: formatNumber(activeToday) },
    { label: 'Ativos 7 dias', value: formatNumber(activeSevenDays) },
    { label: 'Usuários Free', value: formatNumber(freeUsers) },
    { label: 'Usuários Pro', value: formatNumber(usersPro), hint: `${conversion.toFixed(1)}% conversão` },
    { label: 'Receita total', value: formatCurrency(revenueTotal) },
    { label: 'Receita do mês', value: formatCurrency(revenueMonth) },
    { label: 'Pagamentos aprovados', value: formatNumber(approvedPayments) },
    { label: 'Downloads APK', value: formatNumber(downloads) },
    { label: 'Lembretes criados', value: formatNumber(remindersTotal) },
    { label: 'Lembretes ativos', value: formatNumber(remindersActive) },
    { label: 'Lembretes concluídos', value: formatNumber(remindersCompleted) },
    { label: 'Meus Lugares salvos', value: formatNumber(savedPlaces) },
    { label: 'Grupos criados', value: formatNumber(groups) },
    { label: 'Convites enviados', value: formatNumber(invitesSent) },
    { label: 'Convites aceitos', value: formatNumber(invitesAccepted) },
    { label: 'Notificações disparadas', value: formatNumber(notificationEvents) },
    { label: 'Alertas por localização ativados', value: formatNumber(geofencingEnabled) },
    { label: 'Erros recentes do app', value: formatNumber(appErrors), hint: 'Eventos app_error' },
    { label: 'Geoapify/Overpass', value: formatNumber(geoapifyEvents + overpassEvents), hint: 'Se disponível via eventos' },
  ];

  return {
    cards,
    usersByDay: buildDailyRows(eventsSevenDays.filter((event) => event.event_type === 'signup_completed'), sevenDaysAgo),
    downloadsByDay: buildDailyRows(eventsSevenDays.filter((event) => event.event_type === 'apk_download_clicked'), sevenDaysAgo),
    revenueByDay: buildRevenueRows(eventsSevenDays, sevenDaysAgo),
    apkVersions: buildVersionRows(eventsSevenDays),
    latestPayments: approvedPaymentEvents.slice(0, 12),
    recentEvents,
  };
}

async function countRows(
  supabase: ReturnType<typeof createServiceRoleClient>,
  table: string,
  filter?: { column: string; eq?: unknown; gte?: string }
) {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter?.eq !== undefined) query = query.eq(filter.column, filter.eq);
    if (filter?.gte) query = query.gte(filter.column, filter.gte);
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function countEvent(supabase: ReturnType<typeof createServiceRoleClient>, eventType: string) {
  return countRows(supabase, 'alertloc_events', { column: 'event_type', eq: eventType });
}

async function listEventsSince(supabase: ReturnType<typeof createServiceRoleClient>, since: string): Promise<EventRow[]> {
  try {
    const { data, error } = await supabase
      .from('alertloc_events')
      .select('id, created_at, event_type, user_id, app_version, platform, metadata')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000);
    if (error) throw error;
    return (data ?? []) as EventRow[];
  } catch {
    return [];
  }
}

async function listRecentEvents(supabase: ReturnType<typeof createServiceRoleClient>): Promise<EventRow[]> {
  try {
    const { data, error } = await supabase
      .from('alertloc_events')
      .select('id, created_at, event_type, user_id, app_version, platform, metadata')
      .order('created_at', { ascending: false })
      .limit(25);
    if (error) throw error;
    return (data ?? []) as EventRow[];
  } catch {
    return [];
  }
}

async function listEventsByType(
  supabase: ReturnType<typeof createServiceRoleClient>,
  eventType: string,
  limit: number
): Promise<EventRow[]> {
  try {
    const { data, error } = await supabase
      .from('alertloc_events')
      .select('id, created_at, event_type, user_id, app_version, platform, metadata')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as EventRow[];
  } catch {
    return [];
  }
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDayMap(start: Date) {
  const map = new Map<string, number>();
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    map.set(dayKey(date), 0);
  }
  return map;
}

function buildDailyRows(events: EventRow[], start: Date) {
  const map = buildDayMap(start);
  events.forEach((event) => {
    const key = dayKey(new Date(event.created_at));
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return [...map.entries()].map(([date, count]) => ({ date, count }));
}

function buildRevenueRows(events: EventRow[], start: Date) {
  const map = new Map([...buildDayMap(start).entries()].map(([key]) => [key, 0]));
  events
    .filter((event) => event.event_type === 'pro_payment_approved')
    .forEach((event) => {
      const key = dayKey(new Date(event.created_at));
      const amount = Number(event.metadata?.amount ?? 0);
      map.set(key, (map.get(key) ?? 0) + (Number.isFinite(amount) ? amount : 0));
    });
  return [...map.entries()].map(([date, amount]) => ({ date, amount }));
}

function buildVersionRows(events: EventRow[]) {
  const map = new Map<string, number>();
  events
    .filter((event) => event.event_type === 'app_opened')
    .forEach((event) => {
      const version = event.app_version || 'Sem versão';
      map.set(version, (map.get(version) ?? 0) + 1);
    });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([version, count]) => ({ version, count }));
}

function distinctUsersSince(events: EventRow[], since: Date) {
  const users = new Set<string>();
  events.forEach((event) => {
    if (!event.user_id) return;
    if (new Date(event.created_at) < since) return;
    users.add(event.user_id);
  });
  return users.size;
}

function sumRevenue(events: EventRow[], since: Date | null) {
  return events
    .filter((event) => event.event_type === 'pro_payment_approved')
    .filter((event) => !since || new Date(event.created_at) >= since)
    .reduce((total, event) => {
      const amount = Number(event.metadata?.amount ?? 0);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
