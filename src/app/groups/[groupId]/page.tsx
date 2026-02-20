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
import { ReminderDetailSheet } from '@/components/reminder-detail-sheet';
import { ReminderItem, categoryIcons } from '@/components/reminder-item';


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

  const handleManageMembers = () => {
    toast({
      title: 'Função em desenvolvimento',
      description: 'O gerenciamento de membros será implementado em breve.',
    });
  };

  const handleLeaveGroup = () => {
    toast({
      title: 'Função em desenvolvimento',
      description: 'A função para sair do grupo será implementada em breve.',
    });
  };

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
              <DropdownMenuItem onClick={handleManageMembers}>Gerenciar membros</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLeaveGroup} className="text-destructive focus:text-destructive focus:bg-destructive/10">Sair do grupo</DropdownMenuItem>
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
                <ReminderDetailSheet key={reminder.id} reminder={reminder}>
                  <ReminderItem reminder={reminder} />
                </ReminderDetailSheet>
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
