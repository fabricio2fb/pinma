export const ALERTLOC_PRO_PLAN = {
  id: 'alertloc_pro',
  name: 'AlertLoc Pro',
  plan: 'pro',
  price: 22.9,
  currency: 'BRL',
  description: 'Plano mensal AlertLoc Pro',
};

export const ALERTLOC_PRO_BENEFITS = [
  'Lembretes ilimitados',
  'Lugares salvos ilimitados',
  'Grupos maiores',
  'Alertas urgentes',
  'Raios avançados',
  'Lembretes recorrentes',
  'Monitoramento avançado',
  'Histórico de alertas',
  'Mais personalização',
  'Mais locais próximos no mapa',
];

export function isValidUserId(userId: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
}
