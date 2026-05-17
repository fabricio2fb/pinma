'use client';

import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreateGroupSheet } from '@/components/create-group-sheet';
import { ManageGroupSheet } from '@/components/manage-group-sheet';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Plus,
  ChevronRight,
  Settings,
  Loader2,
} from 'lucide-react';

type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role?: string | null;
};

type GroupWithCount = {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  invite_code?: string | null;
  created_at?: string;
  total_members: number;
  members_preview: GroupMember[];
};

export default function GroupsPage() {
  const [dbGroups, setDbGroups] = useState<GroupWithCount[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithCount | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  async function fetchGroups() {
    setIsLoading(true);

    try {
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('Erro ao buscar grupos:', groupsError);
        setDbGroups([]);
        return;
      }

      if (!groups || groups.length === 0) {
        setDbGroups([]);
        return;
      }

      const groupIds = groups.map((group) => group.id);

      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, group_id, user_id, role')
        .in('group_id', groupIds);

      if (membersError) {
        console.error('Erro ao buscar membros:', membersError);
      }

      const safeMembers = members || [];

      const groupsWithCount = groups.map((group) => {
        const groupMembers = safeMembers.filter(
          (member) => member.group_id === group.id
        );

        return {
          ...group,
          total_members: groupMembers.length,
          members_preview: groupMembers.slice(0, 4),
        };
      });

      setDbGroups(groupsWithCount);
    } catch (error) {
      console.error('Erro inesperado ao buscar grupos:', error);
      setDbGroups([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openManageGroup = (group: GroupWithCount) => {
    setSelectedGroup(group);
    setManageOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex h-full flex-col lg:gap-8 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 p-6 pt-10 lg:flex-row lg:items-center lg:justify-between lg:p-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Grupos</h1>
            <p className="mt-1 text-sm text-muted-foreground lg:text-base">
              Colabore e compartilhe pins com amigos e família
            </p>
          </div>

          <CreateGroupSheet>
            <Button className="h-12 gap-2 rounded-2xl bg-primary px-6 text-white shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" />
              <span>Criar Novo Grupo</span>
            </Button>
          </CreateGroupSheet>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 lg:px-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dbGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 pb-32 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:pb-0">
              {dbGroups.map((group) => (
                <div
                  key={group.id}
                  className="group relative rounded-[36px] border border-border/60 bg-card/40 shadow-xl shadow-black/[0.03] backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-primary/10"
                >
                  <Link href={`/groups/${group.id}`} className="block p-6">
                    {/* Cabeçalho do card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <Avatar className="h-14 w-14 shrink-0 border-2 border-background shadow-md">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                              group.name || 'Grupo'
                            )}`}
                          />
                          <AvatarFallback>
                            {group.name?.charAt(0)?.toUpperCase() || 'G'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xl font-bold transition-colors group-hover:text-primary">
                            {group.name}
                          </h3>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Users size={13} />
                            Grupo compartilhado
                          </p>
                          {group.description ? (
                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                              {group.description}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Engrenagem — dentro do layout normal, não absolute */}
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="shrink-0 h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openManageGroup(group);
                        }}
                        title="Gerenciar grupo"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Rodapé do card: avatares + contagem */}
                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div className="flex items-center">
                        {group.members_preview.length > 0 ? (
                          group.members_preview.map((member, index) => (
                            <Avatar
                              key={member.id}
                              className="-ml-2 h-8 w-8 border-2 border-card first:ml-0"
                              style={{ zIndex: 10 - index }}
                            >
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`}
                              />
                              <AvatarFallback>
                                {member.user_id?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          ))
                        ) : (
                          <div className="flex h-8 items-center text-xs text-muted-foreground">
                            Sem membros
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium tabular-nums">
                          {group.total_members ?? 0}{' '}
                          {(group.total_members ?? 0) === 1 ? 'membro' : 'membros'}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}

              {/* Card de criar novo grupo (desktop only) */}
              <CreateGroupSheet>
                <div className="hidden cursor-pointer flex-col items-center justify-center gap-3 rounded-[36px] border-2 border-dashed border-border p-6 transition-all hover:border-primary/50 hover:bg-primary/[0.01] lg:flex">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <Plus size={24} />
                  </div>
                  <p className="font-semibold text-muted-foreground">
                    Adicionar Grupo
                  </p>
                </div>
              </CreateGroupSheet>
            </div>
          ) : (
            /* Estado vazio */
            <div className="flex flex-col items-center justify-center rounded-[40px] border border-dashed border-border bg-muted/20 py-20">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>

              <h3 className="text-xl font-bold">Nenhum grupo ainda</h3>

              <p className="mt-2 max-w-[280px] text-center text-muted-foreground">
                Crie um grupo para compartilhar pins e lembretes com outras pessoas.
              </p>

              <CreateGroupSheet>
                <Button className="mt-6 h-12 rounded-2xl px-8 shadow-lg shadow-primary/10">
                  Criar meu primeiro grupo
                </Button>
              </CreateGroupSheet>
            </div>
          )}
        </div>

        {/* Sheet de gerenciamento */}
        {selectedGroup && (
          <ManageGroupSheet
            group={selectedGroup as any}
            open={manageOpen}
            onOpenChange={(open) => {
              setManageOpen(open);
              if (!open) {
                setSelectedGroup(null);
                fetchGroups();
              }
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
