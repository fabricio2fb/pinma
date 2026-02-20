'use client';

import { MainLayout } from '@/components/main-layout';
import { mockGroups, mockReminders } from '@/lib/data';
import type { Group, Reminder } from '@/lib/types';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  Trash2,
  Check,
  ShoppingCart,
  Pill,
  Banknote,
  Home,
  Briefcase,
  Star,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { AddReminderSheet } from '@/components/add-reminder-sheet';

const categoryIcons: { [key: string]: React.ReactNode } = {
  Mercado: <ShoppingCart className="h-5 w-5" />,
  Farmácia: <Pill className="h-5 w-5" />,
  Banco: <Banknote className="h-5 w-5" />,
  Casa: <Home className="h-5 w-5" />,
  Trabalho: <Briefcase className="h-5 w-5" />,
  Outro: <Star className="h-5 w-5" />,
};

const ReminderItem = ({ reminder }: { reminder: Reminder }) => (
  <div className="flex items-center gap-4 p-4">
    <div className="bg-muted h-10 w-10 flex items-center justify-center rounded-md text-foreground">
      {categoryIcons[reminder.category]}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        {reminder.priority === 'Urgente' && (
          <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
        )}
        <h3 className="font-semibold text-sm truncate">{reminder.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{reminder.location}</p>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Check className="mr-2 h-4 w-4" />
          Concluir
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export default function GroupDetailPage() {
  const params = useParams();
  const { groupId } = params;
  const { toast } = useToast();

  const group = mockGroups.find((g) => g.id === groupId);
  const groupReminders = mockReminders.filter((r) => r.group === group?.name);

  if (!group) {
    notFound();
  }

  const handleInvite = () => {
     toast({
      title: 'Função em desenvolvimento',
      description: 'Convidar membros será implementado em breve.',
    });
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full pb-28">
        <div className="p-4 pt-6 flex justify-between items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/groups">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-bold">{group.name}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleInvite}>Convidar membro</DropdownMenuItem>
              <DropdownMenuItem>Gerenciar membros</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Sair do grupo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="px-6 py-4 flex flex-col items-center border-b border-border">
            <div className="flex -space-x-4 mb-3">
                {group.avatars.map((avatarUrl, i) => (
                <Avatar key={i} className="h-12 w-12 border-4 border-card">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                </Avatar>
                ))}
            </div>
            <p className="text-sm text-muted-foreground">{group.members} membros</p>
        </div>
        
        <div className="flex justify-between items-center p-4">
            <h2 className="font-semibold">Lembretes do Grupo</h2>
            <AddReminderSheet>
              <Button variant="ghost" size="icon">
                  <Plus className="h-5 w-5" />
              </Button>
            </AddReminderSheet>
        </div>


        {groupReminders.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {groupReminders.map((reminder) => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center px-6">
            <p className="text-muted-foreground text-sm">
              Nenhum lembrete para este grupo ainda.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
