'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

import {
  ShoppingCart,
  Pill,
  Banknote,
  Home,
  Briefcase,
  Star,
  Users,
  Loader2,
  CheckCircle2,
  Trash2,
  Edit3,
  Save,
  FileText,
  MapPin,
  CircleDashed,
  CalendarDays,
} from 'lucide-react';

const MapaPreview = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full bg-muted rounded-2xl" />,
});

const categoryIcons: Record<string, any> = {
  Mercado: ShoppingCart,
  Farmácia: Pill,
  Banco: Banknote,
  Casa: Home,
  Trabalho: Briefcase,
  Outro: Star,
};

export function ReminderDetailSheet({
  reminder,
  children,
}: {
  reminder: any;
  children: React.ReactNode;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: reminder.name || reminder.title || '',
    description: reminder.description || '',
    category: reminder.category || 'Outro',
    radius: String(reminder.radius || 100),
    priority: reminder.priority || 'Normal',
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const Icon = categoryIcons[reminder.category] || Star;

  const handleStatusUpdate = async (newStatus: boolean) => {
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_active: !newStatus })
        .eq('id', reminder.id);

      if (error) throw error;

      toast({
        title: newStatus ? 'Lembrete concluído!' : 'Lembrete reativado.',
        description: 'O status foi atualizado com sucesso.',
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
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
        title: 'Lembrete excluído',
        variant: 'destructive',
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsProcessing(true);

    try {
      const radius = Number(draft.radius);
      const { error } = await supabase
        .from('reminders')
        .update({
          title: draft.title.trim() || 'Novo Lembrete',
          description: draft.description.trim() || null,
          category: draft.category.trim() || 'Outro',
          radius: Number.isFinite(radius) ? radius : 100,
          priority: draft.priority,
        })
        .eq('id', reminder.id);

      if (error) throw error;

      toast({ title: 'Lembrete atualizado' });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Erro ao editar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Sem data';
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Sem data';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        side={isDesktop ? 'right' : 'bottom'}
        className="
          h-[92%]
          lg:h-full
          lg:w-[500px]
          rounded-t-[28px]
          lg:rounded-none
          lg:rounded-l-[32px]
          bg-card/95
          backdrop-blur-xl
          border-t
          lg:border-t-0
          lg:border-l
          border-border
          p-0
          flex
          flex-col
          shadow-2xl
          transition-all
          duration-500
        "
      >
        <div className="w-full py-3 flex justify-center lg:hidden">
          <div className="w-12 h-1.5 rounded-full bg-border/60" />
        </div>

        <SheetHeader className="px-6 pt-2 lg:pt-6 pb-4 text-left border-b border-border/50">
          <SheetTitle className="text-[24px] leading-tight font-bold pr-8">
            {reminder.name || reminder.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes e localização do lembrete selecionado.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 no-scrollbar">
          {/* HERO / RESUMO */}
          <div className="rounded-[26px] border border-border/60 bg-gradient-to-br from-muted/45 to-muted/10 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-background/80 border border-border/60 flex items-center justify-center shadow-sm">
                <Icon className="h-6 w-6 text-foreground" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-lg leading-none">
                  {reminder.category || 'Outro'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {reminder.location || 'Localização no mapa'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-semibold border-0',
                  reminder.priority === 'Urgente'
                    ? 'bg-red-500/15 text-red-500 hover:bg-red-500/15'
                    : 'bg-muted text-muted-foreground hover:bg-muted'
                )}
              >
                {reminder.priority === 'Urgente'
                  ? 'PRIORIDADE URGENTE'
                  : 'PRIORIDADE NORMAL'}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-semibold border-0',
                  reminder.is_active
                    ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15'
                    : 'bg-muted text-muted-foreground hover:bg-muted'
                )}
              >
                {reminder.is_active ? 'ATIVO' : 'CONCLUÍDO'}
              </Badge>

              {reminder.group_id && (
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold border-0 bg-muted text-muted-foreground inline-flex items-center gap-1.5 hover:bg-muted"
                >
                  <Users className="h-3 w-3" />
                  Grupo
                </Badge>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="rounded-[24px] border border-primary/25 bg-primary/5 p-4 space-y-3">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="min-h-24 rounded-2xl" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label>Raio</Label>
                  <Input value={draft.radius} onChange={(e) => setDraft({ ...draft, radius: e.target.value })} className="rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <select
                    value={draft.priority}
                    onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                    className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                  >
                    <option>Normal</option>
                    <option>Urgente</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* DESCRIÇÃO */}
          <div className="rounded-[24px] border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">Descrição</p>
                <p className="text-xs text-muted-foreground">
                  Detalhes do lembrete
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-background/40 px-4 py-3">
              {reminder.description && reminder.description.trim() !== '' ? (
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {reminder.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma descrição adicionada.
                </p>
              )}
            </div>
          </div>

          {/* MAPA */}
          <div className="rounded-[24px] border border-border/60 bg-muted/20 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">Localização</p>
                <p className="text-xs text-muted-foreground">
                  Visualização do ponto salvo
                </p>
              </div>
            </div>

            <div className="h-56 w-full rounded-[22px] overflow-hidden border border-border/60 relative bg-muted">
              {(reminder as any).lat && (reminder as any).lng ? (
                <MapaPreview
                  preview
                  center={[(reminder as any).lat, (reminder as any).lng]}
                  marcadores={[
                    {
                      lat: (reminder as any).lat,
                      lng: (reminder as any).lng,
                      nome: reminder.name || reminder.title,
                    },
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-muted">
                  <p className="text-xs text-muted-foreground">
                    Localização não disponível
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(reminder as any).address && (
                <div className="rounded-2xl border border-border/50 bg-background/40 p-3 sm:col-span-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Endereço</p>
                  </div>
                  <p className="font-semibold text-sm">{(reminder as any).address}</p>
                </div>
              )}
              <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CircleDashed className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Raio</p>
                </div>
                <p className="font-semibold text-sm">{reminder.radius || 100}m</p>
              </div>

              <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Latitude</p>
                </div>
                <p className="font-semibold text-sm truncate">
                  {(reminder as any).lat ?? '--'}
                </p>
              </div>

              <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Longitude</p>
                </div>
                <p className="font-semibold text-sm truncate">
                  {(reminder as any).lng ?? '--'}
                </p>
              </div>

              <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Criado em</p>
                </div>
                <p className="font-semibold text-sm">
                  {formatDate(reminder.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="p-4 border-t border-border/60 bg-card/95 backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-13 rounded-2xl shadow-none"
              onClick={() => (isEditing ? handleSaveEdit() : setIsEditing(true))}
              disabled={isProcessing}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="
                h-13
                rounded-2xl
                border-red-500/25
                text-red-500
                hover:bg-red-500/10
                hover:text-red-500
                shadow-none
              "
              onClick={handleExcluir}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </>
              )}
            </Button>

            <Button
              className={cn(
                'h-13 rounded-2xl font-semibold shadow-none',
                reminder.is_active
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted'
              )}
              onClick={() => handleStatusUpdate(reminder.is_active)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : reminder.is_active ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Concluir
                </>
              ) : (
                'Reativar'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
