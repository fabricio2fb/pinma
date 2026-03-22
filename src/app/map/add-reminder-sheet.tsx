'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ShoppingCart, Pill, Banknote, Home, Briefcase, Star, MapPin, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LatLng } from 'leaflet';

const categories = [
  { name: 'Mercado', icon: ShoppingCart },
  { name: 'Farmácia', icon: Pill },
  { name: 'Banco', icon: Banknote },
  { name: 'Casa', icon: Home },
  { name: 'Trabalho', icon: Briefcase },
  { name: 'Outro', icon: Star },
];

interface AddReminderSheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialLocation?: LatLng | null;
  initialName?: string;
  initialCategory?: string;
}

interface OSMPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
}

function isCEP(text: string) {
  const digits = text.replace('-', '').trim();
  return /^\d{8}$/.test(digits);
}

function getNomeExibicao(place: OSMPlace) {
  const parts = place.display_name.split(',').map(s => s.trim());
  return parts.slice(0, 3).join(', ');
}

import { createClient } from '@/lib/supabase/client';

export function AddReminderSheet({
  children,
  open,
  onOpenChange,
  initialLocation,
  initialName,
  initialCategory,
}: AddReminderSheetProps) {
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [radius, setRadius] = useState(100);
  const [priority, setPriority] = useState<'Normal' | 'Urgente'>('Normal');
  const [selectedCategory, setSelectedCategory] = useState<string>('Mercado');
  const [locationText, setLocationText] = useState('');
  const [reminderName, setReminderName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<OSMPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLat(initialLocation.lat);
      setSelectedLng(initialLocation.lng);
      setLocationText(`Lat: ${initialLocation.lat.toFixed(4)}, Lng: ${initialLocation.lng.toFixed(4)}`);
      setShowSuggestions(false);
    } else {
      setLocationText('');
      setSelectedLat(null);
      setSelectedLng(null);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (initialName) setReminderName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (!locationText || locationText.startsWith('Lat:')) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (isCEP(locationText)) {
          const cep = locationText.replace('-', '').trim();
          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await res.json();

          if (!data.erro) {
            const enderecoFormatado = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoFormatado)}&limit=1&countrycodes=br`;
            const geoRes = await fetch(geoUrl, { headers: { 'Accept-Language': 'pt-BR' } });
            const geoData = await geoRes.json();

            if (geoData.length > 0) {
              setSelectedLat(parseFloat(geoData[0].lat));
              setSelectedLng(parseFloat(geoData[0].lon));
            }

            setLocationText(enderecoFormatado);
            setShowSuggestions(false);
          } else {
            setSearchResults([]);
            setShowSuggestions(false);
          }

          setIsSearching(false);
          return;
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}&limit=7&addressdetails=1&extratags=1&namedetails=1&countrycodes=br`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
        const data = await res.json();
        setSearchResults(data);
        setShowSuggestions(data.length > 0);
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [locationText]);

  const Chip = ({ children, onClick, active }: { children: React.ReactNode; onClick: () => void; active: boolean }) => (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium border rounded-md transition-colors whitespace-nowrap',
        active ? 'bg-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground hover:bg-accent'
      )}
    >
      {children}
    </button>
  );

  const handleSalvar = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado para salvar um lembrete.');
        return;
      }

      const { error } = await supabase.from('reminders').insert({
        user_id: user.id,
        title: reminderName || 'Novo Lembrete',
        description: description,
        lat: selectedLat,
        lng: selectedLng,
        radius: radius,
        category: selectedCategory,
        priority: priority,
      });

      if (error) throw error;

      setReminderName('');
      setDescription('');
      onOpenChange?.(false);
      // Opcional: Recarregar a página ou usar um estado global/revalidate
      window.location.reload(); 
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar lembrete: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90%] rounded-t-[16px] bg-card border-t p-0 flex flex-col">
        <div className="w-full py-4 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <SheetHeader className="px-6 pb-2 text-left">
          <SheetTitle className="font-bold text-lg">Novo lembrete</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 no-scrollbar pb-6 relative">

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do lembrete</Label>
            <Input
              id="name"
              placeholder="Ex: Comprar manteiga"
              className="bg-muted h-12"
              value={reminderName}
              onChange={(e) => setReminderName(e.target.value)}
            />
          </div>

          {/* Descrição opcional */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Descrição</Label>
              <span className="text-xs text-muted-foreground">Opcional</span>
            </div>
            <Textarea
              id="description"
              placeholder="Ex: Comprar leite integral, pão de forma e queijo mussarela..."
              className="bg-muted resize-none min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
            />
            {description.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">{description.length}/300</p>
            )}
          </div>

          {/* Localização */}
          <div className="space-y-2 relative">
            <Label htmlFor="location">Localização</Label>
            <div className="relative">
              <Input
                id="location"
                placeholder="Rua, número, nome do lugar ou CEP"
                className="pr-10 bg-muted h-12"
                value={locationText}
                onChange={(e) => {
                  setLocationText(e.target.value);
                  setSelectedLat(null);
                  setSelectedLng(null);
                  if (!e.target.value) setShowSuggestions(false);
                }}
                onFocus={() => {
                  if (searchResults.length > 0 && !locationText.startsWith('Lat:')) setShowSuggestions(true);
                }}
              />
              {isSearching ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin h-5 w-5" />
              ) : (
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              )}
            </div>

            {selectedLat && selectedLng && !locationText.startsWith('Lat:') && (
              <p className="text-xs text-green-600">
                📍 {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
              </p>
            )}

            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-[80px] left-0 right-0 bg-popover border border-border rounded-md shadow-lg z-50 max-h-52 overflow-y-auto">
                {searchResults.map((place) => (
                  <div
                    key={place.place_id}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                    onClick={() => {
                      setSelectedLat(parseFloat(place.lat));
                      setSelectedLng(parseFloat(place.lon));
                      setLocationText(getNomeExibicao(place));
                      setShowSuggestions(false);
                    }}
                  >
                    <p className="text-sm font-medium">{getNomeExibicao(place)}</p>
                    <p className="text-xs text-muted-foreground truncate">{place.display_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raio */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <Label>Raio de ativação</Label>
              <span className="text-foreground font-medium text-sm">{radius}m</span>
            </div>
            <Slider defaultValue={[100]} max={1000} step={50} onValueChange={(value) => setRadius(value[0])} />
          </div>

          {/* Categoria */}
          <div className="space-y-3">
            <Label>Categoria</Label>
            <ScrollArea className="w-full whitespace-nowrap no-scrollbar">
              <div className="flex gap-2 pb-2">
                {categories.map(cat => (
                  <Chip key={cat.name} onClick={() => setSelectedCategory(cat.name)} active={selectedCategory === cat.name}>
                    {cat.name}
                  </Chip>
                ))}
              </div>
            </ScrollArea>
            {selectedCategory === 'Outro' && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="other-category" className="text-sm">Nome da categoria</Label>
                <Input id="other-category" placeholder="Ex: Academia" className="bg-muted h-12" />
              </div>
            )}
          </div>

          {/* Prioridade */}
          <div className="space-y-3">
            <Label>Prioridade</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPriority('Normal')}
                className={cn('h-12 rounded-md font-semibold transition-colors', priority === 'Normal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
              >
                Normal
              </button>
              <button
                onClick={() => setPriority('Urgente')}
                className={cn('h-12 rounded-md font-semibold transition-colors', priority === 'Urgente' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground')}
              >
                Urgente
              </button>
            </div>
          </div>
        </div>

        <SheetFooter className="p-4 bg-card border-t mt-auto">
          <Button asChild type="submit" size="lg" className="w-full h-12" onClick={handleSalvar}>
            <SheetClose>Salvar Lembrete</SheetClose>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}