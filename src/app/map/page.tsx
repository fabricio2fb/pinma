'use client';

import { Plus, Search } from 'lucide-react';
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
    const list = dbReminders.map(r => ({ lat: r.lat, lng: r.lng, nome: r.title }));

    // Se o usuário clicou no mapa para adicionar novo, exibe temporariamente o Pino
    if (newMarker) {
      list.push({ lat: newMarker.lat, lng: newMarker.lng, nome: "Novo Lembrete" });
    }
    return list;
  }, [dbReminders, newMarker]);

  const handleAdicionarMarcador = useCallback((latlng: LatLng) => {
    // Quando o usuário clicar no mapa
    setNewMarker(latlng);
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setNewMarker(null);
    }
  }

  const handleOpenSheetFromSearch = useCallback((lat: number, lng: number) => {
    setNewMarker({ lat, lng } as LatLng);
    setIsSheetOpen(true);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 4) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();

        if (data && data.features) {
          const formatted = data.features.map((f: any) => {
            const p = f.properties;
            const nameParts = [p.name || p.street, p.housenumber, p.district, p.city, p.state].filter(Boolean);
            return {
              display_name: nameParts.join(', '),
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0]
            };
          });
          setSearchResults(formatted);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Erro na busca:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

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

        <div className="absolute top-4 left-4 right-4 z-[9999]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar local (ex: Rua Augusta, 1500)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-md shadow-lg bg-card border focus:ring-2 focus:ring-ring focus:outline-none"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                Buscando...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-card border rounded-md shadow-2xl overflow-hidden mt-2">
                <ul className="max-h-60 overflow-y-auto">
                  {searchResults.map((result: any, index: number) => (
                    <li
                      key={index}
                      className="px-4 py-3 border-b last:border-0 hover:bg-accent cursor-pointer text-sm truncate"
                      onClick={() => handleSelectSearchResult(result)}
                    >
                      {result.display_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-24 right-4 z-10">
          {/* Se ele simplesmente apertar no +, abrimos o Sheet no local atual (coordenadas null passadas depois se quisermos) */}
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

      </div >
    </MainLayout >
  );
}
