'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, Info, Layers, Loader2, Map, Navigation, ShieldAlert, Trash2 } from 'lucide-react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const mapCategories = [
  'Supermercado',
  'Mercado',
  'Farmácia',
  'Hospital/UPA',
  'Banco',
  'Restaurante',
  'Padaria',
  'Academia',
  'Escola',
  'Posto de Gasolina',
  'Pet Shop',
  'Oficina',
  'Igreja',
  'Correios',
  'Estacionamento',
];

function SettingRow({
  icon: Icon,
  title,
  subtitle,
  right,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/30 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [mapStyle, setMapStyle] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    async function loadPreferences() {
      const { data: { user } } = await supabase.auth.getUser();
      const localStyle = localStorage.getItem('AlertLoc_map_style');
      const localPreferred = localStorage.getItem('AlertLoc_map_preferred_categories');
      if (localStyle === 'dark' || localStyle === 'light') setMapStyle(localStyle);
      if (localPreferred) {
        try {
          const parsed = JSON.parse(localPreferred);
          if (Array.isArray(parsed)) setSelectedCategories(parsed);
        } catch {
          setSelectedCategories([]);
        }
      }
      setNotifications(localStorage.getItem('AlertLoc_notifications') === '1');

      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('map_style, map_preferred_categories')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('[Settings] preferências indisponíveis', error);
        setProfileError(error.message);
        return;
      }

      if (data?.map_style === 'dark' || data?.map_style === 'light') {
        setMapStyle(data.map_style);
      }

      if (Array.isArray(data?.map_preferred_categories)) {
        setSelectedCategories(data.map_preferred_categories);
      }
    }

    loadPreferences();
  }, [supabase]);

  const geolocationStatus = useMemo(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return 'Indisponível neste navegador';
    return 'Solicitada pelo mapa quando necessário';
  }, []);

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  async function savePreferences(nextStyle = mapStyle, nextCategories = selectedCategories) {
    setSaving(true);
    localStorage.setItem('AlertLoc_map_style', nextStyle);
    localStorage.setItem('AlertLoc_map_preferred_categories', JSON.stringify(nextCategories));
    localStorage.setItem('AlertLoc_notifications', notifications ? '1' : '0');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      toast({ title: 'Configurações salvas localmente' });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        map_style: nextStyle,
        map_preferred_categories: nextCategories,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      console.error('[Settings] erro ao salvar preferências', error);
      setProfileError(error.message);
      toast({
        title: 'Preferências salvas localmente',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setProfileError('');
    toast({ title: 'Configurações atualizadas' });
  }

  function clearLocalCache() {
    localStorage.removeItem('AlertLoc_map_style');
    localStorage.removeItem('AlertLoc_map_preferred_categories');
    localStorage.removeItem('AlertLoc_notifications');
    toast({ title: 'Cache local limpo' });
  }

  return (
    <MainLayout>
      <div className="h-full overflow-y-auto p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Configurações</h1>
            <p className="mt-2 text-muted-foreground">Preferências do mapa, notificações e informações do app web.</p>
          </div>

          {profileError && (
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              Supabase retornou: {profileError}. Não alterei schema; quando a coluna existir, a preferência será salva no perfil.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-[32px] border border-border/60 bg-card/45 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Mapa</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Categorias priorizadas e tema padrão.</p>
                </div>
                <Map className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <SettingRow
                  icon={Layers}
                  title="Tema do mapa"
                  subtitle="Controla o estilo Carto usado no Leaflet."
                  right={
                    <div className="flex rounded-2xl border border-border bg-muted/40 p-1">
                      {(['dark', 'light'] as const).map((style) => (
                        <button
                          key={style}
                          className={`rounded-xl px-4 py-2 text-sm font-bold ${mapStyle === style ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                          onClick={() => {
                            setMapStyle(style);
                            savePreferences(style, selectedCategories);
                          }}
                        >
                          {style === 'dark' ? 'Escuro' : 'Claro'}
                        </button>
                      ))}
                    </div>
                  }
                />

                <div className="rounded-2xl border border-border/50 bg-background/30 p-4">
                  <p className="font-semibold">Preferências de categorias</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Essas categorias aparecem primeiro no mapa. Elas priorizam, mas não removem categorias úteis.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mapCategories.map((category) => {
                      const active = selectedCategories.includes(category);
                      return (
                        <button
                          key={category}
                          className={`rounded-full border px-4 py-2 text-xs font-bold ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted/40 text-muted-foreground'}`}
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                  <Button className="mt-5 rounded-2xl" onClick={() => savePreferences()} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Salvar preferências
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-border/60 bg-card/45 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Alertas e Permissões</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Configurações compatíveis com desktop web.</p>
                </div>
                <ShieldAlert className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <SettingRow
                  icon={Bell}
                  title="Notificações no navegador"
                  subtitle="A web pode guardar a preferência. O monitoramento em segundo plano continua sendo do APK Android."
                  right={<Switch checked={notifications} onCheckedChange={setNotifications} />}
                />
                <SettingRow
                  icon={Navigation}
                  title="Localização"
                  subtitle={geolocationStatus}
                />
                <SettingRow
                  icon={Info}
                  title="Geofencing / Foreground Service"
                  subtitle="Não implementado na web desktop. Esse recurso permanece no app Android."
                />
                <SettingRow
                  icon={Trash2}
                  title="Cache de locais"
                  subtitle="Limpa preferências locais do navegador; dados Supabase não são apagados."
                  right={<Button variant="outline" className="rounded-2xl" onClick={clearLocalCache}>Limpar</Button>}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
