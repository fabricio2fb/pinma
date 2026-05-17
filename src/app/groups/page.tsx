'use client';

import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CreateGroupSheet } from '@/components/create-group-sheet';
import { ManageGroupSheet } from '@/components/manage-group-sheet';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Plus,
  Settings,
  Crown,
  MoreHorizontal,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function GroupsPage() {
  const [dbGroups, setDbGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  async function fetchGroups() {
    setIsLoading(true);

    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !groups) {
      setDbGroups([]);
      setIsLoading(false);
      return;
    }

    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        const { data: membersPreview } = await supabase
          .from('group_members')
          .select('id, user_id, role')
          .eq('group_id', group.id)
          .limit(4);

        return {
          ...group,
          members_count: count || 0,
          members_preview: membersPreview || [],
        };
      })
    );

    setDbGroups(groupsWithMembers);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    return dbGroups.filter((group) =>
      group.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [dbGroups, search]);

  return (
    <MainLayout>
      <div className="flex flex-col h-full lg:p-8">
        <div className="p-6 pt-10 lg:p-0">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Espaços compartilhados
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Meus Grupos
              </h1>

              <p className="text-muted-foreground text-sm lg:text-base mt-2 max-w-xl">
                Crie grupos, compartilhe pins e gerencie quem pode colaborar com você.
              </p>
            </div>

            <CreateGroupSheet>
              <Button className="rounded-2xl h-12 px-6 gap-2 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10">
                <Plus className="h-5 w-5" />
                Criar Novo Grupo
              </Button>
            </CreateGroupSheet>
          </div>

          <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar grupo..."
                className="
                  w-full h-12 rounded-2xl bg-card/50 border border-border/60
                  pl-11 pr-4 outline-none text-sm
                  focus:border-primary/60 focus:ring-4 focus:ring-primary/10
                  transition-all
                "
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {dbGroups.length} grupo{dbGroups.length === 1 ? '' : 's'} criado
              {dbGroups.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 lg:px-0 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[230px] rounded-[32px] bg-card/40 border border-border/50 animate-pulse"
                />
              ))}
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-32 lg:pb-0">
              {filteredGroups.map((group) => {
                const isOwner = Boolean(group.owner_id);

                return (
                  <div
                    key={group.id}
                    onClick={() => router.push(`/groups/${group.id}`)}
                    className="
                      group relative overflow-hidden cursor-pointer
                      rounded-[34px] border border-border/60
                      bg-card/45 backdrop-blur-md
                      p-6 min-h-[230px]
                      shadow-xl shadow-black/[0.03]
                      hover:border-primary/50 hover:bg-primary/[0.03]
                      hover:-translate-y-1
                      transition-all duration-300
                    "
                  >
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                              group.name || 'grupo'
                            )}`}
                          />
                          <AvatarFallback>
                            {group.name?.charAt(0)?.toUpperCase() || 'G'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <h3 className="font-bold text-xl truncate group-hover:text-primary transition-colors">
                            {group.name}
                          </h3>

                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {group.description || 'Sem descrição adicionada'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroup(group);
                        }}
                        className="
                          h-10 w-10 rounded-2xl
                          bg-background/70 border border-border/60
                          flex items-center justify-center
                          opacity-100 lg:opacity-0 lg:group-hover:opacity-100
                          hover:bg-muted transition-all
                        "
                        title="Gerenciar grupo"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="relative z-10 mt-6 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground px-3 py-1.5 text-xs font-semibold">
                        <Users className="h-3.5 w-3.5" />
                        {group.members_count || 0} membro
                        {(group.members_count || 0) === 1 ? '' : 's'}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold">
                        <Shield className="h-3.5 w-3.5" />
                        Compartilhado
                      </span>

                      {isOwner && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 text-yellow-500 px-3 py-1.5 text-xs font-semibold">
                          <Crown className="h-3.5 w-3.5" />
                          Dono
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 mt-7 flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {(group.members_preview || []).length > 0 ? (
                          group.members_preview.map((member: any, index: number) => (
                            <Avatar
                              key={member.id}
                              className="h-9 w-9 border-2 border-card shadow-sm"
                            >
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`}
                              />
                              <AvatarFallback>
                                {index + 1}
                              </AvatarFallback>
                            </Avatar>
                          ))
                        ) : (
                          <div className="h-9 px-3 rounded-full bg-muted text-xs text-muted-foreground flex items-center">
                            Sem membros
                          </div>
                        )}
                      </div>

                      <div className="h-10 w-10 rounded-2xl bg-muted/70 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <MoreHorizontal className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                );
              })}

              <CreateGroupSheet>
                <div
                  className="
                    hidden lg:flex min-h-[230px]
                    border-2 border-dashed border-border
                    rounded-[34px] p-6
                    items-center justify-center flex-col gap-3
                    group hover:border-primary/50 hover:bg-primary/[0.02]
                    transition-all cursor-pointer
                  "
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Plus size={26} />
                  </div>
                  <p className="font-semibold text-muted-foreground group-hover:text-primary">
                    Adicionar Grupo
                  </p>
                </div>
              </CreateGroupSheet>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-[40px]">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Users className="text-muted-foreground h-10 w-10" />
              </div>

              <h3 className="text-xl font-bold">Nenhum grupo encontrado</h3>

              <p className="text-muted-foreground max-w-[280px] text-center mt-2">
                Crie um grupo para compartilhar pins e lembretes com outras pessoas.
              </p>

              <CreateGroupSheet>
                <Button className="mt-6 rounded-2xl h-12 px-8 shadow-lg shadow-primary/10">
                  Criar meu primeiro grupo
                </Button>
              </CreateGroupSheet>
            </div>
          )}
        </div>
      </div>

      <ManageGroupSheet
        group={selectedGroup}
        open={!!selectedGroup}
        onOpenChange={(val) => {
          if (!val) {
            setSelectedGroup(null);

            setTimeout(() => {
              document.body.style.pointerEvents = '';
              document.body.style.overflow = '';
              document.documentElement.style.pointerEvents = '';
            }, 100);
          }
        }}
      />
    </MainLayout>
  );
}