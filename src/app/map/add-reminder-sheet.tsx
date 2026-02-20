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

const categories = [
  { name: 'Mercado', icon: ShoppingCart },
  { name: 'Farmácia', icon: Pill },
  { name: 'Banco', icon: Banknote },
  { name: 'Casa', icon: Home },
  { name: 'Trabalho', icon: Briefcase },
  { name: 'Outro', icon: Star },
];

export function AddReminderSheet({ children }: { children: React.ReactNode }) {
  const [radius, setRadius] = useState(100);
  const [priority, setPriority] = useState<'Normal' | 'Urgente'>('Normal');

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90%] rounded-t-[24px] bg-[#0F3460] border-t-0 p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 text-left">
          <SheetTitle className="font-headline">Novo Lembrete</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do lembrete</Label>
            <Input id="name" placeholder="Ex: Comprar manteiga" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <div className="relative">
              <Input id="location" placeholder="Buscar local ou endereço" className="pr-10" />
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Raio de ativação</Label>
                <span className="text-primary font-bold">{radius}m</span>
            </div>
            <Slider defaultValue={[100]} max={1000} step={50} onValueChange={(value) => setRadius(value[0])} />
          </div>

          <div className="space-y-3">
             <Label>Ícone / Categoria</Label>
             <div className="grid grid-cols-3 gap-3">
                {categories.map(cat => (
                    <Button key={cat.name} variant="outline" className="flex flex-col h-20 gap-2 border-white/10 bg-white/5">
                        <cat.icon className="h-6 w-6 text-accent" />
                        <span className="text-xs text-muted-foreground">{cat.name}</span>
                    </Button>
                ))}
             </div>
          </div>
          
          <div className="space-y-3">
             <Label>Prioridade</Label>
             <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setPriority('Normal')} variant={priority === 'Normal' ? 'default' : 'outline'} className="h-12">Normal</Button>
                <Button onClick={() => setPriority('Urgente')} variant={priority === 'Urgente' ? 'secondary' : 'outline'} className="h-12 bg-opacity-50 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">Urgente</Button>
             </div>
          </div>
          
        </div>
        <SheetFooter className="p-6 bg-[#0F3460]">
            <Button asChild type="submit" size="lg" className="w-full">
                <SheetClose>Salvar Lembrete</SheetClose>
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
