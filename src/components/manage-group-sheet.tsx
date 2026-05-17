'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

import {
  MoreVertical,
  Crown,
  Shield,
  User,
  UserMinus,
  Loader2,
  Users,
  Pencil,
  Save,
  X,
  Copy,
  Check,
  Mail,
  UserPlus,
  Settings,
} from 'lucide-react';

import { cn } from '@/lib/utils';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string | null;
  joined_at?: string | null;
  profiles?: Profile | null;
};

type Group = {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  invite_code?: string | null;
  total_members?: number;
  members_preview?: GroupMember[];
};

type Props = {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    icon: Shield,
    color: 'text-blue-500',
  },
  {
    value: 'member',
    label: 'Membro',
    icon: User,
    color: 'text-muted-foreground',
  },
];

function getRoleBadge(role?: string | null) {
  if (role === 'owner') {
    return (
      <Badge className="gap-1.5 rounded-full bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10">
        <Crown size={11} />
        Dono
      </Badge>
    );
  }

  if (role === 'admin') {
    return (
      <Badge className="gap-1.5 rounded-full bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/10">
        <Shield size={11} />
        Admin
      </Badge>
    );
  }

  return (
    <Badge className="gap-1.5 rounded-full bg-muted text-muted-foreground border-transparent hover:bg-muted">
      <User size={11} />
      Membro
    </Badge>
  );
}

function getInitial(member: GroupMember) {
  const name = member.profiles?.full_name;
  const email = member.profiles?.email;

  if (name && name.trim() !== '') {
    return name.charAt(0).toUpperCase();
  }

  if (email && email.trim() !== '') {
    return email.charAt(0).toUpperCase();
  }

  return 'U';
}

function getMemberName(member: GroupMember) {
  const fullName = member.profiles?.full_name;
  const email = member.profiles?.email;

  if (fullName && fullName.trim() !== '') {
    return fullName;
  }

  if (email && email.trim() !== '') {
    return email.split('@')[0];
  }

  return 'Usuário sem nome';
}

function getMemberEmail(member: GroupMember) {
  const email = member.profiles?.email;

  if (email && email.trim() !== '') {
    return `@ ${email}`;
  }

  return '@ email não encontrado';
}

export function ManageGroupSheet({ group, open, onOpenChange }: Props) {
  const supabase = createClient();
  const { toast } = useToast();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const [copied, setCopied] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        document.documentElement.style.pointerEvents = '';
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!group) return;

    setGroupName(group.name || '');
    setGroupDescription(group.description || '');
    setIsEditing(false);
  }, [group]);

  async function fetchCurrentUser() {
    const { data } = await supabase.auth.getUser();
    setCurrentUserId(data.user?.id ?? null);
  }

  async function fetchMembers() {
    if (!group?.id) return;

    setIsLoading(true);

    try {
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('id, group_id, user_id, role, joined_at')
        .eq('group_id', group.id)
        .order('joined_at', { ascending: true });

      if (membersError) {
        console.error('Erro ao buscar membros:', membersError);

        toast({
          title: 'Erro ao buscar membros',
          description: membersError.message,
          variant: 'destructive',
        });

        setMembers([]);
        return;
      }

      const userIds = (membersData || []).map((member) => member.user_id);

      if (userIds.length === 0) {
        setMembers([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);

        const membersWithoutProfiles = (membersData || []).map((member) => ({
          ...member,
          profiles: null,
        }));

        setMembers(membersWithoutProfiles as GroupMember[]);
        return;
      }

      const profilesMap = new Map(
        (profilesData || []).map((profile) => [profile.id, profile])
      );

      const membersWithProfiles = (membersData || []).map((member) => ({
        ...member,
        profiles: profilesMap.get(member.user_id) || null,
      }));

      setMembers(membersWithProfiles as GroupMember[]);
    } catch (error: any) {
      console.error('Erro inesperado ao buscar membros:', error);

      toast({
        title: 'Erro inesperado',
        description: error.message,
        variant: 'destructive',
      });

      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (open && group?.id) {
      fetchCurrentUser();
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group?.id]);

  async function handleSaveGroup() {
    if (!group?.id) return;

    if (!groupName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite um nome para o grupo.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingGroup(true);

    const { error } = await supabase
      .from('groups')
      .update({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
      })
      .eq('id', group.id);

    setIsSavingGroup(false);

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Grupo atualizado',
      description: 'Nome e descrição foram salvos com sucesso.',
    });

    setIsEditing(false);
  }

  async function handleChangeRole(
    memberId: string,
    userId: string,
    newRole: string
  ) {
    if (!group) return;

    if (userId === group.owner_id) {
      toast({
        title: 'Não é possível alterar o cargo do dono.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingAction(memberId);

    const { error } = await supabase
      .from('group_members')
      .update({ role: newRole })
      .eq('id', memberId);

    setLoadingAction(null);

    if (error) {
      toast({
        title: 'Erro ao alterar cargo',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Cargo alterado com sucesso!',
    });

    fetchMembers();
  }

  async function handleRemoveMember(memberId: string, userId: string) {
    if (!group) return;

    if (userId === group.owner_id) {
      toast({
        title: 'Não é possível remover o dono do grupo.',
        variant: 'destructive',
      });
      return;
    }

    const confirmed = confirm('Tem certeza que deseja remover este membro?');

    if (!confirmed) return;

    setLoadingAction(memberId);

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId);

    setLoadingAction(null);

    if (error) {
      toast({
        title: 'Erro ao remover membro',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Membro removido',
      description: 'O membro foi removido do grupo.',
    });

    fetchMembers();
  }

  async function handleCopyInviteCode() {
    if (!group?.invite_code) return;

    await navigator.clipboard.writeText(group.invite_code);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);

    toast({
      title: 'Código copiado',
      description: 'Envie esse código para alguém entrar no grupo.',
    });
  }

  async function handleInviteByEmail() {
    if (!group?.id) return;

    const email = inviteEmail.trim().toLowerCase();

    if (!email) return;

    setIsInviting(true);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      setIsInviting(false);

      toast({
        title: 'Usuário não encontrado',
        description: 'Esse email precisa pertencer a um usuário cadastrado no app.',
        variant: 'destructive',
      });

      return;
    }

    const alreadyMember = members.some((member) => member.user_id === profile.id);

    if (alreadyMember) {
      setIsInviting(false);

      toast({
        title: 'Usuário já está no grupo',
        description: 'Esse email já faz parte deste grupo.',
        variant: 'destructive',
      });

      return;
    }

    const { error } = await supabase.from('group_invites').insert({
      group_id: group.id,
      inviter_id: currentUserId || group.owner_id,
      invitee_id: profile.id,
      status: 'pending',
    });

    setIsInviting(false);

    if (error) {
      toast({
        title: 'Erro ao enviar convite',
        description: error.message,
        variant: 'destructive',
      });

      return;
    }

    setInviteEmail('');

    toast({
      title: 'Convite enviado',
      description: `Convite enviado para ${email}.`,
    });
  }

  if (!group) return null;

  const isCurrentUserOwner = currentUserId === group.owner_id;
  const memberCount = members.length;

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);

        if (!value) {
          setTimeout(() => {
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
            document.documentElement.style.pointerEvents = '';
          }, 100);
        }
      }}
    >
      <SheetContent
        side="right"
        className="
        flex
        w-full
        flex-col
        gap-0
        p-0
        sm:max-w-[540px]
        bg-card
        border-l
        border-border
        rounded-l-[32px]
        overflow-hidden
      "
      >
        <SheetHeader className="border-b border-border/60 px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <SheetTitle className="flex items-center gap-2 text-2xl font-bold">
                <Settings className="h-5 w-5 text-primary" />
                Gerenciar grupo
              </SheetTitle>

              <p className="text-sm text-muted-foreground mt-1">
                {group.name} · {memberCount} membro
                {memberCount === 1 ? '' : 's'}
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 no-scrollbar">
          <div className="rounded-[28px] border border-border/60 bg-muted/20 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">Informações do grupo</p>
                <p className="text-xs text-muted-foreground">
                  Edite nome, descrição e código de convite.
                </p>
              </div>

              {isCurrentUserOwner && (
                <>
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl gap-2"
                      onClick={() => {
                        setIsEditing(false);
                        setGroupName(group.name || '');
                        setGroupDescription(group.description || '');
                      }}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nome do grupo</Label>
                <Input
                  value={groupName}
                  disabled={!isEditing}
                  onChange={(event) => setGroupName(event.target.value)}
                  className="
                    h-12
                    rounded-2xl
                    bg-background/60
                    disabled:opacity-100
                    disabled:cursor-default
                  "
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={groupDescription}
                  disabled={!isEditing}
                  onChange={(event) => setGroupDescription(event.target.value)}
                  placeholder="Ex: Grupo da família para lembretes compartilhados..."
                  className="
                    min-h-[95px]
                    rounded-2xl
                    bg-background/60
                    resize-none
                    disabled:opacity-100
                    disabled:cursor-default
                  "
                />
              </div>

              {isEditing && (
                <Button
                  className="w-full h-12 rounded-2xl gap-2"
                  onClick={handleSaveGroup}
                  disabled={isSavingGroup}
                >
                  {isSavingGroup ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar alterações
                </Button>
              )}
            </div>

            {group.invite_code && (
              <div className="rounded-2xl border border-border/60 bg-background/50 p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Código do grupo</p>
                  <p className="font-bold truncate">{group.invite_code}</p>
                </div>

                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-xl shrink-0"
                  onClick={handleCopyInviteCode}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {isCurrentUserOwner && (
            <div className="rounded-[28px] border border-border/60 bg-muted/20 p-5 space-y-4">
              <div>
                <p className="text-sm font-bold">Convidar membro</p>
                <p className="text-xs text-muted-foreground">
                  Convide alguém pelo email cadastrado no app.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="email@exemplo.com"
                    className="h-12 rounded-2xl bg-background/60 pl-11"
                  />
                </div>

                <Button
                  className="h-12 rounded-2xl px-4"
                  onClick={handleInviteByEmail}
                  disabled={isInviting || !inviteEmail.trim()}
                >
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-[28px] border border-border/60 bg-muted/20 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">Membros do grupo</p>
                <p className="text-xs text-muted-foreground">
                  Veja nome, email e cargo de cada pessoa.
                </p>
              </div>

              <div className="h-10 w-10 rounded-2xl bg-background/60 border border-border/60 flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl bg-background/40 border border-border/60">
                <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-semibold">Nenhum membro encontrado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Convide pessoas para começar a colaborar.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {members.map((member) => {
                  const isOwner = member.user_id === group.owner_id;
                  const isMe = member.user_id === currentUserId;
                  const isActionLoading = loadingAction === member.id;

                  const name = getMemberName(member);
                  const email = getMemberEmail(member);

                  return (
                    <li
                      key={member.id}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-border/60
                        bg-background/50
                        px-4
                        py-3
                        transition-colors
                        hover:bg-background/80
                      "
                    >
                      <Avatar className="h-12 w-12 shrink-0 border border-border shadow-sm">
                        <AvatarImage
                          src={
                            member.profiles?.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`
                          }
                        />
                        <AvatarFallback>{getInitial(member)}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {name}
                          {isMe && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (você)
                            </span>
                          )}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {email}
                        </p>

                        <div className="mt-2">
                          {getRoleBadge(isOwner ? 'owner' : member.role)}
                        </div>
                      </div>

                      {isCurrentUserOwner && !isOwner && (
                        <div className="shrink-0">
                          {isActionLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end" className="w-48">
                                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                  Alterar cargo
                                </p>

                                {ROLES.map((role) => (
                                  <DropdownMenuItem
                                    key={role.value}
                                    className="gap-2"
                                    disabled={member.role === role.value}
                                    onClick={() =>
                                      handleChangeRole(
                                        member.id,
                                        member.user_id,
                                        role.value
                                      )
                                    }
                                  >
                                    <role.icon
                                      className={cn('h-4 w-4', role.color)}
                                    />
                                    {role.label}

                                    {member.role === role.value && (
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        Atual
                                      </span>
                                    )}
                                  </DropdownMenuItem>
                                ))}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() =>
                                    handleRemoveMember(member.id, member.user_id)
                                  }
                                >
                                  <UserMinus className="h-4 w-4" />
                                  Remover do grupo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-border/60 px-5 py-4 bg-card">
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}