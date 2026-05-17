'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

import {
  ShoppingCart,
  Pill,
  Banknote,
  Home,
  Briefcase,
  Star,
  MapPin,
  Loader2,
} from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import type { LatLng } from 'leaflet';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

const MapaPreview = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
  ),
});

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
  initialAddress?: string;
  groupId?: string;
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
  const parts = place.display_name.split(',').map((s) => s.trim());
  return parts.slice(0, 3).join(', ');
}

export function AddReminderSheet({
  children,
  open,
  onOpenChange,
  initialLocation,
  initialName,
  initialCategory,
  initialAddress,
  groupId,
}: AddReminderSheetProps) {
  const supabase = createClient();

  const [isSaving, setIsSaving] = useState(false);
  const [radius, setRadius] = useState(100);
  const [priority, setPriority] = useState<'Normal' | 'Urgente'>('Normal');
  const [selectedCategory, setSelectedCategory] = useState<string>('Mercado');
  const [otherCategory, setOtherCategory] = useState('');

  const [locationText, setLocationText] = useState('');
  const [reminderName, setReminderName] = useState('');
  const [description, setDescription] = useState('');

  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  const [searchResults, setSearchResults] = useState<OSMPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();

    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLat(initialLocation.lat);
      setSelectedLng(initialLocation.lng);
      setLocationText(
        initialAddress ||
          `Lat: ${initialLocation.lat.toFixed(4)}, Lng: ${initialLocation.lng.toFixed(4)}`
      );
      setShowSuggestions(false);
    } else {
      setLocationText('');
      setSelectedLat(null);
      setSelectedLng(null);
    }
  }, [initialLocation, initialAddress]);

  useEffect(() => {
    if (initialName) setReminderName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (!initialCategory) return;
    const isKnown = categories.some((category) => category.name === initialCategory);
    if (!isKnown) {
      setSelectedCategory('Outro');
      setOtherCategory(initialCategory);
    }
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

            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              enderecoFormatado
            )}&limit=1&countrycodes=br`;

            const geoRes = await fetch(geoUrl, {
              headers: {
                'Accept-Language': 'pt-BR',
              },
            });

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

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationText
        )}&limit=7&addressdetails=1&extratags=1&namedetails=1&countrycodes=br`;

        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'pt-BR',
          },
        });

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

  const handleSalvar = async () => {
    try {
      setIsSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Você precisa estar logado para salvar um lembrete.');
        return;
      }

      if (!selectedLat || !selectedLng) {
        alert('Escolha um local para o lembrete.');
        return;
      }

      const categoryToSave =
        selectedCategory === 'Outro'
          ? otherCategory.trim() || 'Outro'
          : selectedCategory;

      const payload: Record<string, any> = {
        user_id: user.id,
        title: reminderName || 'Novo Lembrete',
        description: description.trim() || null,
        lat: selectedLat,
        lng: selectedLng,
        radius,
        category: categoryToSave,
        priority,
      };

      if (groupId) payload.group_id = groupId;
      if (locationText && !locationText.startsWith('Lat:')) payload.address = locationText;

      let { error } = await supabase.from('reminders').insert(payload);

      if (error && String(error.message || '').toLowerCase().includes('address')) {
        const { address, ...payloadWithoutAddress } = payload;
        const retry = await supabase.from('reminders').insert(payloadWithoutAddress);
        error = retry.error;
      }

      if (error) throw error;

      setReminderName('');
      setDescription('');
      setLocationText('');
      setSelectedLat(null);
      setSelectedLng(null);
      setRadius(100);
      setPriority('Normal');
      setSelectedCategory('Mercado');
      setOtherCategory('');

      onOpenChange?.(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar lembrete: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const Chip = ({
    children,
    onClick,
    active,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    active: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium border rounded-xl transition-all whitespace-nowrap',
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );

  const renderFormContent = () => (
    <>
      <div className="flex-1 overflow-y-auto px-6 space-y-6 no-scrollbar pb-6 relative">
        <div className="space-y-2">
          <Label htmlFor="reminder-name">Nome do lembrete</Label>

          <Input
            id="reminder-name"
            placeholder="Ex: Comprar manteiga"
            className="bg-muted/70 h-12 rounded-xl"
            value={reminderName}
            onChange={(e) => setReminderName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Descrição</Label>
            <span className="text-xs text-muted-foreground">Opcional</span>
          </div>

          <Textarea
            id="description"
            placeholder="Ex: Comprar leite integral, pão de forma e queijo mussarela..."
            className="bg-muted/70 resize-none min-h-[86px] rounded-xl"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
          />

          {description.length > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/300
            </p>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="location">Localização</Label>

          <div className="relative">
            <Input
              id="location"
              placeholder="Rua, número, nome do lugar ou CEP"
              className="pr-10 bg-muted/70 h-12 rounded-xl"
              value={locationText}
              onChange={(e) => {
                setLocationText(e.target.value);
                setSelectedLat(null);
                setSelectedLng(null);

                if (!e.target.value) setShowSuggestions(false);
              }}
              onFocus={() => {
                if (
                  searchResults.length > 0 &&
                  !locationText.startsWith('Lat:')
                ) {
                  setShowSuggestions(true);
                }
              }}
            />

            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin h-5 w-5" />
            ) : (
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            )}
          </div>

          {selectedLat && selectedLng && (
            <div className="mt-3 space-y-2">
              <div className="h-40 w-full rounded-2xl border overflow-hidden relative z-0">
                <MapaPreview
                  preview
                  center={[selectedLat, selectedLng]}
                  marcadores={[]}
                />
              </div>

              {!locationText.startsWith('Lat:') && (
                <p className="text-xs text-green-600">
                  📍 {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
                </p>
              )}
            </div>
          )}

          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute top-[80px] left-0 right-0 bg-popover border border-border rounded-xl shadow-xl z-[2147483647] max-h-52 overflow-y-auto">
              {searchResults.map((place) => (
                <button
                  type="button"
                  key={place.place_id}
                  className="w-full text-left p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                  onClick={() => {
                    setSelectedLat(parseFloat(place.lat));
                    setSelectedLng(parseFloat(place.lon));
                    setLocationText(getNomeExibicao(place));
                    setShowSuggestions(false);
                  }}
                >
                  <p className="text-sm font-medium">
                    {getNomeExibicao(place)}
                  </p>

                  <p className="text-xs text-muted-foreground truncate">
                    {place.display_name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <Label>Raio de ativação</Label>
            <span className="text-foreground font-semibold text-sm">
              {radius}m
            </span>
          </div>

          <Slider
            value={[radius]}
            max={1000}
            step={50}
            onValueChange={(value) => setRadius(value[0])}
          />
        </div>

        <div className="space-y-3">
          <Label>Categoria</Label>

          <ScrollArea className="w-full whitespace-nowrap no-scrollbar">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => (
                <Chip
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  active={selectedCategory === cat.name}
                >
                  {cat.name}
                </Chip>
              ))}
            </div>
          </ScrollArea>

          {selectedCategory === 'Outro' && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="other-category" className="text-sm">
                Nome da categoria
              </Label>

              <Input
                id="other-category"
                placeholder="Ex: Academia"
                value={otherCategory}
                onChange={(event) => setOtherCategory(event.target.value)}
                className="bg-muted/70 h-12 rounded-xl"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Prioridade</Label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPriority('Normal')}
              className={cn(
                'h-12 rounded-xl font-semibold transition-all',
                priority === 'Normal'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/70 text-muted-foreground'
              )}
            >
              Normal
            </button>

            <button
              type="button"
              onClick={() => setPriority('Urgente')}
              className={cn(
                'h-12 rounded-xl font-semibold transition-all',
                priority === 'Urgente'
                  ? 'bg-destructive text-destructive-foreground shadow-sm'
                  : 'bg-muted/70 text-muted-foreground'
              )}
            >
              Urgente
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-card border-t mt-auto">
        <Button
          type="button"
          size="lg"
          className="w-full h-12 rounded-xl font-semibold"
          onClick={handleSalvar}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Lembrete'
          )}
        </Button>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="
            z-[2147483647]
            p-0
            overflow-hidden
            max-w-[560px]
            h-[86vh]
            rounded-[32px]
            bg-card
            border
            border-border
            shadow-2xl
            flex
            flex-col
            outline-none
            focus:outline-none
            focus-visible:outline-none
          "
        >
          <DialogHeader className="px-6 pt-6 pb-3 text-left border-b border-border/60">
            <DialogTitle className="font-bold text-xl">
              Novo lembrete
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground">
              Crie um alerta baseado em localização.
            </DialogDescription>
          </DialogHeader>

          {renderFormContent()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        className="
          h-[92%]
          rounded-t-[28px]
          bg-card
          backdrop-blur-xl
          border-t
          border-border
          p-0
          flex
          flex-col
          shadow-2xl
          z-[2147483647]
        "
      >
        <div className="w-full py-3 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-border/60" />
        </div>

        <SheetHeader className="px-6 pb-3 text-left">
          <SheetTitle className="font-bold text-lg">
            Novo lembrete
          </SheetTitle>

          <SheetDescription className="sr-only">
            Preencha os dados abaixo para criar um novo lembrete baseado em
            localização.
          </SheetDescription>
        </SheetHeader>

        {renderFormContent()}
      </SheetContent>
    </Sheet>
  );
}
