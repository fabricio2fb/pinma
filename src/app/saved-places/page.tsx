'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Edit3, Heart, Loader2, MapPin, Plus, Search, Trash2 } from 'lucide-react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { AddReminderSheet } from '@/app/map/add-reminder-sheet';

const MiniMap = dynamic(() => import('@/components/map'), { ssr: false });

type SavedPlace = {
  id: string;
  created_at?: string;
  user_id?: string;
  name: string;
  description?: string | null;
  lat: number;
  lng: number;
  category?: string | null;
  icon?: string | null;
  color?: string | null;
  is_favorite?: boolean | null;
};

const emptyForm = {
  name: '',
  description: '',
  lat: '',
  lng: '',
  category: 'Outro',
  color: '#19c37d',
};

export default function SavedPlacesPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null);
  const [editingPlace, setEditingPlace] = useState<SavedPlace | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reminderPlace, setReminderPlace] = useState<SavedPlace | null>(null);

  useEffect(() => {
    loadPlaces();
  }, []);

  async function loadPlaces() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('saved_places')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SavedPlaces] erro ao carregar', error);
      setError(error.message);
      setPlaces([]);
    } else {
      setPlaces(data || []);
      setSelectedPlace((data || [])[0] || null);
    }

    setLoading(false);
  }

  const categories = useMemo(
    () => ['Todos', 'Favoritos', ...Array.from(new Set(places.map((place) => place.category || 'Outro')))],
    [places]
  );

  const filteredPlaces = useMemo(() => {
    const term = query.trim().toLowerCase();
    return places.filter((place) => {
      const matchesFilter =
        filter === 'Todos' ||
        (filter === 'Favoritos' ? Boolean(place.is_favorite) : (place.category || 'Outro') === filter);
      const matchesQuery =
        !term ||
        [place.name, place.description, place.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return matchesFilter && matchesQuery;
    });
  }, [filter, places, query]);

  function startEdit(place: SavedPlace) {
    setEditingPlace(place);
    setSelectedPlace(place);
    setForm({
      name: place.name || '',
      description: place.description || '',
      lat: String(place.lat ?? ''),
      lng: String(place.lng ?? ''),
      category: place.category || 'Outro',
      color: place.color || '#19c37d',
    });
  }

  function clearForm() {
    setEditingPlace(null);
    setForm(emptyForm);
  }

  async function savePlace() {
    const lat = Number(form.lat);
    const lng = Number(form.lng);

    if (!form.name.trim() || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast({ title: 'Meus Lugares', description: 'Informe nome, latitude e longitude válidos.', variant: 'destructive' });
      return;
    }

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      toast({ title: 'Meus Lugares', description: 'Você precisa estar logado.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      lat,
      lng,
      category: form.category.trim() || 'Outro',
      color: form.color,
    };

    const result = editingPlace
      ? await supabase.from('saved_places').update(payload).eq('id', editingPlace.id)
      : await supabase.from('saved_places').insert({ ...payload, is_favorite: false });

    setSaving(false);

    if (result.error) {
      console.error('[SavedPlaces] erro ao salvar', result.error);
      toast({ title: 'Erro ao salvar lugar', description: result.error.message, variant: 'destructive' });
      return;
    }

    toast({ title: editingPlace ? 'Lugar atualizado' : 'Lugar salvo' });
    clearForm();
    loadPlaces();
  }

  async function toggleFavorite(place: SavedPlace) {
    const { error } = await supabase
      .from('saved_places')
      .update({ is_favorite: !place.is_favorite })
      .eq('id', place.id);

    if (error) {
      toast({ title: 'Erro ao favoritar', description: error.message, variant: 'destructive' });
      return;
    }

    loadPlaces();
  }

  async function deletePlace(place: SavedPlace) {
    if (!confirm(`Excluir "${place.name}"?`)) return;

    const { error } = await supabase.from('saved_places').delete().eq('id', place.id);

    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }

    if (selectedPlace?.id === place.id) setSelectedPlace(null);
    loadPlaces();
  }

  return (
    <MainLayout>
      <div className="grid h-full grid-cols-[minmax(360px,430px)_1fr] gap-6 p-8">
        <section className="flex min-h-0 flex-col rounded-[32px] border border-border/60 bg-card/45 p-5 shadow-2xl shadow-black/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Meus Lugares</h1>
              <p className="mt-1 text-sm text-muted-foreground">Pontos salvos para criar lembretes mais rápido.</p>
            </div>
            <Button size="icon" className="rounded-2xl" onClick={clearForm}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar lugar..." className="h-12 rounded-2xl pl-11" />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                className={`rounded-full px-4 py-2 text-xs font-bold ${filter === category ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
            ) : filteredPlaces.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhum lugar salvo encontrado.</div>
            ) : (
              filteredPlaces.map((place) => (
                <button
                  key={place.id}
                  className={`w-full rounded-3xl border p-4 text-left transition-all ${selectedPlace?.id === place.id ? 'border-primary bg-primary/10' : 'border-border/60 bg-background/35 hover:bg-muted/40'}`}
                  onClick={() => setSelectedPlace(place)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                      <Bookmark className="h-5 w-5" style={{ color: place.color || '#19c37d' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{place.name}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{place.description || place.category || 'Lugar salvo'}</p>
                    </div>
                    {place.is_favorite && <Heart className="h-4 w-4 fill-red-500 text-red-500" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="grid min-h-0 grid-cols-[1fr_360px] gap-6">
          <div className="overflow-hidden rounded-[32px] border border-border/60 bg-card/35">
            {selectedPlace ? (
              <MiniMap
                preview
                center={[selectedPlace.lat, selectedPlace.lng]}
                marcadores={[{ lat: selectedPlace.lat, lng: selectedPlace.lng, nome: selectedPlace.name }]}
                forceStyle="dark"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                Selecione um lugar para ver no mapa
              </div>
            )}
          </div>

          <aside className="flex min-h-0 flex-col gap-4">
            <div className="rounded-[32px] border border-border/60 bg-card/45 p-5">
              <h2 className="text-lg font-bold">{editingPlace ? 'Editar lugar' : 'Novo lugar salvo'}</h2>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-20 rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="rounded-2xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-2xl" />
                </div>
                <Button className="h-12 w-full rounded-2xl" onClick={savePlace} disabled={saving}>
                  {saving ? 'Salvando...' : editingPlace ? 'Salvar alterações' : 'Criar lugar'}
                </Button>
              </div>
            </div>

            {selectedPlace && (
              <div className="rounded-[32px] border border-border/60 bg-card/45 p-5">
                <p className="text-xs font-bold uppercase text-muted-foreground">Detalhe</p>
                <h3 className="mt-2 text-2xl font-bold">{selectedPlace.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{selectedPlace.description || 'Sem descrição.'}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-2xl" onClick={() => startEdit(selectedPlace)}><Edit3 className="mr-2 h-4 w-4" />Editar</Button>
                  <Button variant="outline" className="rounded-2xl" onClick={() => toggleFavorite(selectedPlace)}><Heart className="mr-2 h-4 w-4" />Favorito</Button>
                  <AddReminderSheet
                    open={!!reminderPlace}
                    onOpenChange={(open) => !open && setReminderPlace(null)}
                    initialLocation={reminderPlace ? ({ lat: reminderPlace.lat, lng: reminderPlace.lng } as any) : null}
                    initialAddress={reminderPlace?.name}
                    initialName={reminderPlace?.name}
                    initialCategory={reminderPlace?.category || 'Outro'}
                  >
                    <Button className="rounded-2xl" onClick={() => setReminderPlace(selectedPlace)}>Lembrete</Button>
                  </AddReminderSheet>
                  <Button variant="destructive" className="rounded-2xl" onClick={() => deletePlace(selectedPlace)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>
    </MainLayout>
  );
}
