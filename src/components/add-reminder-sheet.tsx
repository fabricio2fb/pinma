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
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShoppingCart, Pill, Banknote, Home, Briefcase, Star, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { LatLng } from 'leaflet';

const categories = [
  { name: 'Mercado', icon: ShoppingCart },
  { name: 'Farmácia', icon: Pill },
  { name: 'Banco', icon: Banknote },
  { name: 'Casa', icon: Home },
  { name: 'Trabalho', icon: Briefcase },
  { name: 'Outro', icon: Star },
];

export function AddReminderSheet({
  children,
  open,
  onOpenChange,
  initialLocation,
}: {
  children?: React.ReactNode,
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
  initialLocation?: LatLng | null,
}) {
  const [radius, setRadius] = useState(100);
  const [priority, setPriority] = useState<'Normal' | 'Urgente'>('Normal');
  const [selectedCategory, setSelectedCategory] = useState<string>('Mercado');
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const Chip = ({ children, onClick, active }: { children: React.ReactNode, onClick: () => void, active: boolean }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium border rounded-md transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Erro", description: "Dê um nome ao seu lembrete", variant: "destructive" });
      return;
    }
    if (!initialLocation) {
      toast({ title: "Erro", description: "Por favor, selecione um local no mapa", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para salvar", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const categoryToSave = selectedCategory === 'Outro' ? otherCategory : selectedCategory;

    const { error, data } = await supabase.from('reminders').insert({
      title: name,
      category: categoryToSave,
      priority: priority,
      radius: radius,
      lat: initialLocation.lat,
      lng: initialLocation.lng,
      location_text: locationName,
      user_id: user.id
    }).select();

    setIsSaving(false);

    if (error) {
      console.error("ERRO SUPABASE INSERT:", error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Lembrete salvo com sucesso!" });
      setName('');
      setLocationName('');
      if (onOpenChange) onOpenChange(false);
      // Em um app real, aqui o ideal é forçar o re-fetch da lista de reminders do MapPage
      // Como o React Router Next faz refresh via router.refresh() ou alterando state local,
      // vou recarregar a janela para simplificar e garantir que o map carrega os pinos
      window.location.reload();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent side="bottom" className="h-[90%] rounded-t-[16px] bg-card border-t p-0 flex flex-col">
        <div className="w-full py-4 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <SheetHeader className="px-6 pb-2 text-left">
          <SheetTitle className="font-bold text-lg">Novo lembrete</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-6 no-scrollbar">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do lembrete</Label>
            <Input id="name" placeholder="Ex: Comprar manteiga" className="bg-muted h-12" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização (Referência)</Label>
            <div className="relative">
              <Input id="location" placeholder="Rua, bairro ou nome do local..." value={locationName} onChange={e => setLocationName(e.target.value)} className="pr-10 bg-muted h-12" />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Raio de ativação</Label>
              <span className="text-foreground font-medium text-sm">{radius}m</span>
            </div>
            <Slider defaultValue={[100]} max={1000} step={50} onValueChange={(value) => setRadius(value[0])} />
          </div>

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
                <Input id="other-category" placeholder="Ex: Academia" value={otherCategory} onChange={e => setOtherCategory(e.target.value)} className="bg-muted h-12" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Prioridade</Label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPriority('Normal')} className={cn("h-12 rounded-md font-semibold", priority === 'Normal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>Normal</button>
              <button onClick={() => setPriority('Urgente')} className={cn("h-12 rounded-md font-semibold", priority === 'Urgente' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground')}>Urgente</button>
            </div>
          </div>

        </div>
        <SheetFooter className="p-4 bg-card border-t mt-auto">
          <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full h-12">
            {isSaving ? 'Salvando...' : 'Salvar Lembrete'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
