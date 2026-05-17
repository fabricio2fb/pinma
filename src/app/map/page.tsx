'use client';

import { Plus, Search, Loader2, MapPin, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { LatLng } from 'leaflet';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { AddReminderSheet } from './add-reminder-sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const Mapa = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full bg-muted" />,
});

type SearchResult = {
  display_name: string;
  display_full: string;
  lat: string;
  lon: string;
  source?: string;
  distance_km?: number;
};

type UserCoords = {
  lat: number;
  lng: number;
};

export default function MapPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newMarker, setNewMarker] = useState<LatLng | null>(null);
  const [newMarkerAddress, setNewMarkerAddress] = useState('');
  const [dbReminders, setDbReminders] = useState<any[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const supabase = useMemo(() => createClient(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [createOnMapMode, setCreateOnMapMode] = useState(false);
  const [focusedPoint, setFocusedPoint] = useState<[number, number] | null>(null);
  const [selectedSearchLocation, setSelectedSearchLocation] = useState<SearchResult | null>(null);

  useEffect(() => {
    async function fetchReminders() {
      const [{ data, error }, savedPlacesResult] = await Promise.all([
        supabase.from('reminders').select('*'),
        supabase.from('saved_places').select('*'),
      ]);
      if (data && !error) {
        setDbReminders(data);
      }
      if (!savedPlacesResult.error && savedPlacesResult.data) {
        setSavedPlaces(savedPlacesResult.data);
      } else if (savedPlacesResult.error) {
        console.warn('[Map] saved_places indisponível', savedPlacesResult.error.message);
      }
    }

    fetchReminders();
  }, [supabase]);

  // Pega a localização do usuário para priorizar resultados perto dele.
  // Se o usuário negar permissão, a API ainda usa um fallback no backend.
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setUserCoords(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 1000 * 60 * 10,
      }
    );
  }, []);

  const marcadores = useMemo(() => {
    const reminderMarkers = dbReminders.map((r) => ({
      lat: r.lat,
      lng: r.lng,
      nome: r.title,
      categoria: r.category,
      prioridade: r.priority,
      descricao: r.description,
      id: r.id,
      is_active: r.is_active,
      kind: 'reminder' as const,
    }));

    const savedPlaceMarkers = savedPlaces.map((place) => ({
      lat: place.lat,
      lng: place.lng,
      nome: place.name,
      categoria: place.category,
      descricao: place.description,
      id: place.id,
      kind: 'savedPlace' as const,
    }));

    return [...reminderMarkers, ...savedPlaceMarkers];
  }, [dbReminders, savedPlaces]);

  const reverseGeocodePoint = useCallback(async (lat: number, lng: number) => {
    try {
      const params = new URLSearchParams({ reverse: '1', lat: String(lat), lng: String(lng) });
      const res = await fetch(`/api/geocode?${params.toString()}`);
      if (!res.ok) return '';
      const data = await res.json();
      return data?.result?.display_full || data?.result?.display_name || '';
    } catch (error) {
      console.error('Erro no reverse geocode:', error);
      return '';
    }
  }, []);

  const handleAdicionarMarcador = useCallback(async (latlng: LatLng) => {
    setNewMarker(latlng);
    setNewMarkerAddress(await reverseGeocodePoint(latlng.lat, latlng.lng));
    setIsSheetOpen(true);
    setCreateOnMapMode(false);
  }, [reverseGeocodePoint]);

  const handleCloseSheet = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setNewMarker(null);
      setNewMarkerAddress('');
    }
  };

  const handleOpenSheetFromSearch = useCallback((lat: number, lng: number, address = '') => {
    setNewMarker({ lat, lng } as LatLng);
    setNewMarkerAddress(address);
    setIsSheetOpen(true);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);

      try {
        const params = new URLSearchParams({ q: query });

        if (userCoords) {
          params.set('lat', String(userCoords.lat));
          params.set('lng', String(userCoords.lng));
        }

        const res = await fetch(`/api/geocode?${params.toString()}`);

        if (!res.ok) {
          throw new Error('Erro ao buscar endereço');
        }

        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Erro na busca:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, userCoords]);

  const handleSelectSearchResult = (result: SearchResult) => {
    setSearchResults([]);
    setSearchQuery(result.display_name);
    setSelectedSearchLocation(result);
    setFocusedPoint([parseFloat(result.lat), parseFloat(result.lon)]);
  };

  return (
    <MainLayout>
      <div className="relative h-full w-full overflow-hidden">
        <Mapa
          marcadores={marcadores}
          onAdicionar={handleAdicionarMarcador}
          createOnMapMode={createOnMapMode}
          focusPoint={focusedPoint}
        />

        {/* ════════════ SEARCH OVERLAY (PC DESIGN) ════════════ */}
        <div className="absolute top-6 left-6 z-[9999] w-full max-w-[400px] hidden lg:block">
          <div className="bg-card/70 backdrop-blur-3xl border border-border/50 rounded-3xl shadow-2xl shadow-black/20 p-5 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Search className="text-primary-foreground" size={20} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold leading-tight">Explorar</h2>
                <p className="text-xs text-muted-foreground">Encontre locais para seus pins</p>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Buscar local, endereço ou CEP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-4 pr-10 rounded-2xl bg-muted/50 border border-border/40 focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto no-scrollbar pt-2 border-t border-border/30">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.lat}-${result.lon}-${index}`}
                    className="p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors flex flex-col gap-0.5 group"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {result.display_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {result.distance_km ? `${result.distance_km} km • ` : ''}
                      {result.display_full}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {selectedSearchLocation && (
              <div className="rounded-2xl border border-border/50 bg-muted/30 p-3">
                <p className="text-sm font-bold truncate">{selectedSearchLocation.display_name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {selectedSearchLocation.display_full}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() =>
                      handleOpenSheetFromSearch(
                        parseFloat(selectedSearchLocation.lat),
                        parseFloat(selectedSearchLocation.lon),
                        selectedSearchLocation.display_full
                      )
                    }
                  >
                    Criar lembrete aqui
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setSelectedSearchLocation(null);
                      setSearchQuery('');
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barra de busca - Mobile Only */}
        <div className="absolute top-4 left-4 right-4 z-[9999] lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar local, endereço ou CEP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-10 rounded-md lg:rounded-xl shadow-lg bg-card border lg:border-border border-transparent focus:ring-2 focus:ring-ring focus:outline-none lg:text-base transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
            )}

            {searchResults.length > 0 && (
              <div className="absolute top-14 left-0 right-0 lg:top-16 bg-card border rounded-md lg:rounded-xl shadow-2xl overflow-hidden mt-1">
                <ul className="max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <li
                      key={`${result.lat}-${result.lon}-${index}`}
                      className="px-4 py-3 border-b last:border-0 hover:bg-accent cursor-pointer"
                      onClick={() => handleSelectSearchResult(result)}
                    >
                      <p className="text-sm font-medium truncate">{result.display_name}</p>
                      {result.display_full && result.display_full !== result.display_name && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {result.distance_km ? `${result.distance_km} km • ` : ''}
                          {result.display_full}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Botão + - Desktop & Mobile */}
        {createOnMapMode && (
          <div className="absolute bottom-10 left-1/2 z-[500] hidden -translate-x-1/2 items-center gap-3 rounded-2xl border border-primary/30 bg-card/95 px-5 py-3 shadow-2xl lg:flex">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-bold">Clique no mapa para escolher o local</p>
              <p className="text-xs text-muted-foreground">O próximo clique abre o novo lembrete.</p>
            </div>
            <button
              type="button"
              className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setCreateOnMapMode(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="absolute bottom-10 right-10 z-[400] hidden lg:flex gap-3">
          <AddReminderSheet
            open={isSheetOpen}
            onOpenChange={handleCloseSheet}
            initialLocation={newMarker}
            initialAddress={newMarkerAddress}
          >
            <Button
              className="h-16 px-8 rounded-2xl shadow-2xl bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-bold text-lg border-2 border-white/10"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus className="h-6 w-6" />
              <span>Novo Lembrete</span>
            </Button>
          </AddReminderSheet>
          <Button
            variant={createOnMapMode ? 'default' : 'outline'}
            className="h-16 px-6 rounded-2xl shadow-2xl font-bold text-lg border-2 border-white/10"
            onClick={() => setCreateOnMapMode((current) => !current)}
          >
            <MapPin className="h-5 w-5 mr-2" />
            Criar no mapa
          </Button>
        </div>

        {/* Botão + - Mobile Only */}
        <div className="absolute bottom-24 right-4 z-10 lg:hidden">
          <AddReminderSheet
            open={isSheetOpen}
            onOpenChange={handleCloseSheet}
            initialLocation={newMarker}
            initialAddress={newMarkerAddress}
          >
            <Button
              size="icon"
              className="h-14 w-14 rounded-2xl shadow-xl bg-primary text-primary-foreground"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus className="h-7 w-7" />
            </Button>
          </AddReminderSheet>
        </div>
      </div>
    </MainLayout>
  );
}
