'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { Reminder } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Pill, Banknote, Home, Briefcase, Star, Users } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import dynamic from 'next/dynamic';

const MapaPreview = dynamic(() => import('@/components/map'), { 
    ssr: false, 
    loading: () => <Skeleton className="h-48 w-full bg-muted rounded-md" />
});

const categoryIcons: { [key: string]: React.ReactNode } = {
  Mercado: <ShoppingCart className="h-5 w-5" />,
  Farmácia: <Pill className="h-5 w-5" />,
  Banco: <Banknote className="h-5 w-5" />,
  Casa: <Home className="h-5 w-5" />,
  Trabalho: <Briefcase className="h-5 w-5" />,
  Outro: <Star className="h-5 w-5" />,
};

export function ReminderDetailSheet({ reminder, children }: { reminder: Reminder, children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90%] rounded-t-[16px] bg-card border-t p-0 flex flex-col">
        <div className="w-full py-4 flex justify-center">
            <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <SheetHeader className="px-6 pb-4 text-left">
          <SheetTitle className="font-bold text-lg">{reminder.name}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-6 no-scrollbar pb-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="bg-muted h-10 w-10 flex items-center justify-center rounded-md text-foreground">
                        {categoryIcons[reminder.category]}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{reminder.category}</p>
                        <p className="text-sm text-muted-foreground">{reminder.location}</p>
                    </div>
                </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {reminder.priority === 'Urgente' ? (
                        <Badge variant="destructive" className="text-xs font-medium">Prioridade Urgente</Badge>
                     ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent text-xs font-medium hover:bg-muted">Prioridade Normal</Badge>
                     )}
                     <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent text-xs font-medium hover:bg-muted">
                        {reminder.status}
                     </Badge>
                     {reminder.group && (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent text-xs font-medium hover:bg-muted inline-flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            {reminder.group}
                        </Badge>
                     )}
                 </div>
            </div>
            
                <div className="h-48 w-full rounded-md overflow-hidden z-0 border relative">
                  {(reminder as any).lat && (reminder as any).lng ? (
                    <MapaPreview 
                      preview 
                      center={[(reminder as any).lat, (reminder as any).lng]} 
                      marcadores={[{ 
                        lat: (reminder as any).lat, 
                        lng: (reminder as any).lng, 
                        nome: reminder.name 
                      }]} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted">
                      <p className="text-xs text-muted-foreground">Localização não disponível</p>
                    </div>
                  )}
                </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
