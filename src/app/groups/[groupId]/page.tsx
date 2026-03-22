'use client';

import { MainLayout } from '@/components/main-layout';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  Settings,
  LogOut,
  Shield,
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
import { ReminderItem } from '@/components/reminder-item';
import { InviteMemberSheet } from '@/components/invite-member-sheet';
import { ManageGroupSheet } from '@/components/manage-group-sheet';

export default function GroupDetailPage() {
  const params = useParams();
  const { groupId } = params;
  const { toast } = useToast();

  const [group, setGroup] = useState<any>(null);
  const [groupReminders, setGroupReminders] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('member');
  const [isLoading, setIsLoading] = useState(true);
  
  // States to control sheets
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [showManageSheet, setShowManageSheet] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchGroupData() {
      if (!groupId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [gRes, rRes, mRes] = await Promise.all([
        supabase.from('groups').select('*').eq('id', groupId).single(),
        supabase.from('reminders').select('*').eq('group_id', groupId),
        supabase.from('group_members').select('*, profile:user_id(full_name, email)').eq('group_id', groupId)
      ]);

      if (gRes.data) setGroup(gRes.data);
      if (rRes.data) setGroupReminders(rRes.data.map((r: any) => ({ ...r, name: r.title })));
      if (mRes.data) {
        setMembers(mRes.data);
        const me = mRes.data.find((m: any) => m.user_id === user.id);
        if (me) setUserRole(me.role);
      }

      setIsLoading(false);
    }
    fetchGroupData();
  }, [groupId, supabase]);

  if (isLoading) {
    return <MainLayout><div className="flex justify-center mt-10">Carregando...</div></MainLayout>;
  }

  const handleLeaveGroup = async () => {
    if (!confirm('Deseja realmente sair deste grupo?')) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: "Você saiu do grupo" });
      window.location.href = '/groups';
    } catch (error: any) {
      toast({ title: "Erro ao sair", description: error.message, variant: "destructive" });
    }
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
          <h1 className="text-lg font-bold truncate max-w-[200px]">{group?.name}</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowInviteSheet(true)}>
                Convidar membro
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setShowManageSheet(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar Grupo
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleLeaveGroup} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2" />
                Sair do grupo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden Sheet Triggers controlled by state */}
          <InviteMemberSheet 
            groupId={groupId as string} 
            groupName={group?.name} 
            inviteCode={group?.invite_code}
            open={showInviteSheet}
            onOpenChange={setShowInviteSheet}
          >
            <span className="hidden" />
          </InviteMemberSheet>

          <ManageGroupSheet 
            group={group}
            open={showManageSheet}
            onOpenChange={setShowManageSheet}
          >
            <span className="hidden" />
          </ManageGroupSheet>

        </div>

        <div className="px-6 py-4 flex flex-col items-center border-b border-border text-center">
          <div className="flex -space-x-4 mb-3">
             {members.slice(0, 3).map((m: any, i: number) => (
                <Avatar key={i} className="h-12 w-12 border-4 border-card shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.profile?.email}`} />
                  <AvatarFallback>{m.profile?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
             ))}
             {members.length > 3 && (
                <div className="h-12 w-12 rounded-full bg-muted border-4 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  +{members.length - 3}
                </div>
             )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold flex items-center justify-center gap-1">
              {members.length} membros 
              {userRole === 'admin' && <Shield className="h-3 w-3 text-primary" />}
            </p>
            {group?.description && (
              <p className="text-xs text-muted-foreground max-w-xs mx-auto italic line-clamp-2">
                "{group.description}"
              </p>
            )}
          </div>
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
              {groupReminders.map((reminder: any) => (
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
