'use client';

import { Plus, Search, Loader2 } from 'lucide-react';
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
  loading: () => <Skeleton className="h-full w-full bg-muted" />
});

function isCEP(text: string) {
  const digits = text.replace('-', '').trim();
  return /^\d{8}$/.test(digits);
}

export default function MapPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [newMarker, setNewMarker] = useState<LatLng | null>(null);
  const [dbReminders, setDbReminders] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReminders() {
      const { data, error } = await supabase.from('reminders').select('*');
      if (data && !error) {
        setDbReminders(data);
      }
    }
    fetchReminders();
  }, [supabase]);

  const marcadores = useMemo(() => {
    const list = dbReminders.map(r => ({ 
      lat: r.lat, 
      lng: r.lng, 
      nome: r.title,
      categoria: r.category,
      prioridade: r.priority,
      descricao: r.description,
      id: r.id
    }));
    
    return list;
  }, [dbReminders, newMarker]);

  const handleAdicionarMarcador = useCallback((latlng: LatLng) => {
    setNewMarker(latlng);
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) setNewMarker(null);
  };

  const handleOpenSheetFromSearch = useCallback((lat: number, lng: number) => {
    setNewMarker({ lat, lng } as LatLng);
    setIsSheetOpen(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // CEP completo → ViaCEP
        if (isCEP(searchQuery)) {
          const cep = searchQuery.replace('-', '').trim();
          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await res.json();

          if (!data.erro) {
            const enderecoFormatado = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFormatado)}&limit=1&countrycodes=br`;
            const geoRes = await fetch(geoUrl, { headers: { 'Accept-Language': 'pt-BR' } });
            const geoData = await geoRes.json();

            if (geoData.length > 0) {
              setSearchResults([{
                display_name: enderecoFormatado,
                display_full: enderecoFormatado,
                lat: geoData[0].lat,
                lon: geoData[0].lon,
              }]);
            }
          } else {
            setSearchResults([]);
          }
          setIsSearching(false);
          return;
        }

        // Busca normal — Nominatim
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=7&addressdetails=1&extratags=1&namedetails=1&countrycodes=br`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
        const data = await res.json();

        const formatted = data.map((place: any) => {
          const parts = place.display_name.split(',').map((s: string) => s.trim());
          return {
            display_name: parts.slice(0, 3).join(', '),
            display_full: place.display_name,
            lat: place.lat,
            lon: place.lon,
          };
        });

        setSearchResults(formatted);
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: any) => {
    setSearchResults([]);
    setSearchQuery('');
    handleOpenSheetFromSearch(parseFloat(result.lat), parseFloat(result.lon));
  };

  return (
    <MainLayout>
      <div className="relative h-full w-full">
        <Mapa marcadores={marcadores} onAdicionar={handleAdicionarMarcador} />

        {/* Barra de busca */}
        <div className="absolute top-4 left-4 right-4 z-[9999]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar local, endereço ou CEP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-10 rounded-md shadow-lg bg-card border focus:ring-2 focus:ring-ring focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
            )}

            {searchResults.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-card border rounded-md shadow-2xl overflow-hidden mt-1">
                <ul className="max-h-60 overflow-y-auto">
                  {searchResults.map((result: any, index: number) => (
                    <li
                      key={index}
                      className="px-4 py-3 border-b last:border-0 hover:bg-accent cursor-pointer"
                      onClick={() => handleSelectSearchResult(result)}
                    >
                      <p className="text-sm font-medium truncate">{result.display_name}</p>
                      {result.display_full && result.display_full !== result.display_name && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{result.display_full}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Botão + */}
        <div className="absolute bottom-24 right-4 z-10">
          <AddReminderSheet
            open={isSheetOpen}
            onOpenChange={handleCloseSheet}
            initialLocation={newMarker}
          >
            <Button
              size="icon"
              className="h-14 w-14 rounded-[14px] shadow-lg bg-[#0A0A0A] text-white hover:bg-[#0A0A0A]/90"
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