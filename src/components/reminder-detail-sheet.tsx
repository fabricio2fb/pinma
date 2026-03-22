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
import { ShoppingCart, Pill, Banknote, Home, Briefcase, Star, Users, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

import { Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ReminderDetailSheet({ reminder, children }: { reminder: any, children: React.ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleStatusUpdate = async (newStatus: boolean) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !newStatus })
        .eq('id', reminder.id);

      if (error) throw error;

      toast({
        title: newStatus ? "Lembrete concluído!" : "Lembrete reativado.",
        description: "O status foi atualizado com sucesso.",
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExcluir = async () => {
    if (!confirm('Tem certeza que deseja excluir este lembrete?')) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminder.id);

      if (error) throw error;

      toast({
        title: "Lembrete excluído",
        variant: "destructive"
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
                        <p className="text-sm text-muted-foreground">{reminder.location || 'Localização no mapa'}</p>
                    </div>
                </div>
                 <div className="flex flex-wrap items-center gap-2">
                     {reminder.priority === 'Urgente' ? (
                        <Badge variant="destructive" className="text-xs font-medium">Prioridade Urgente</Badge>
                     ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent text-xs font-medium hover:bg-muted">Prioridade Normal</Badge>
                     )}
                     <Badge variant={reminder.is_active ? "outline" : "default"} className={reminder.is_active ? "bg-muted text-muted-foreground border-transparent text-xs font-medium hover:bg-muted" : "bg-green-600 text-white border-transparent text-xs font-medium"}>
                        {reminder.is_active ? 'Ativo' : 'Concluído'}
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
        
        <div className="p-4 bg-card border-t grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12 border-destructive/20 text-destructive hover:bg-destructive/10"
            onClick={handleExcluir}
            disabled={isProcessing}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
          <Button 
            className={reminder.is_active ? "h-12 bg-green-600 hover:bg-green-700 text-white" : "h-12 bg-muted text-muted-foreground"}
            onClick={() => handleStatusUpdate(reminder.is_active)}
            disabled={isProcessing}
          >
            {isProcessing ? (
               <Loader2 className="h-4 w-4 animate-spin" />
            ) : reminder.is_active ? (
              <><CheckCircle2 className="h-4 w-4 mr-2" /> Concluir</>
            ) : (
              'Reativar'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
