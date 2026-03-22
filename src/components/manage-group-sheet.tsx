'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Settings, UserCog, UserMinus, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ManageGroupSheet({ 
  group, 
  children,
  open,
  onOpenChange
}: { 
  group: any, 
  children: React.ReactNode,
  open?: boolean,
  onOpenChange?: (open: boolean) => void
}) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [members, setMembers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setIsOwner(group.owner_id === user.id);

    const { data: membersData } = await supabase
      .from('group_members')
      .select('*, profile:user_id(full_name, email)')
      .eq('group_id', group.id);
    
    if (membersData) setMembers(membersData);
  };

  useEffect(() => {
    loadData();
  }, [group.id]);

  const handleUpdateGroup = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name, description })
        .eq('id', group.id);
      
      if (error) throw error;

      toast({ title: "Sucesso", description: "Configurações do grupo atualizadas." });
      window.location.reload();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('group_id', group.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      setMembers(members.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
      toast({ title: "Cargo atualizado" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      setMembers(members.filter(m => m.user_id !== userId));
      toast({ title: "Membro removido" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => {
      onOpenChange?.(val);
      if (val) loadData();
    }}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90%] rounded-t-[16px] bg-card border-t p-0 flex flex-col">
        <div className="w-full py-4 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <SheetHeader className="px-6 pb-2 text-left border-b border-border">
          <SheetTitle className="font-bold text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Grupo
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6 py-6 no-scrollbar">
          <div className="space-y-8 pb-10">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Informações Gerais</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="g-name" className="text-xs">Nome do Grupo</Label>
                  <Input 
                    id="g-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="bg-muted h-12"
                    disabled={!isOwner}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g-desc" className="text-xs">Descrição</Label>
                  <Textarea 
                    id="g-desc" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="bg-muted resize-none min-h-[80px]"
                    placeholder="Sobre o que é este grupo?"
                    disabled={!isOwner}
                  />
                </div>
                {isOwner && (
                  <Button onClick={handleUpdateGroup} disabled={isSaving} className="w-full h-11">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Alterações'}
                  </Button>
                )}
              </div>
            </div>

            {/* Gerenciar Membros */}
            <div className="space-y-4">
              <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Membros ({members.length})</Label>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.profile?.email}`} />
                        <AvatarFallback>{member.profile?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">@{member.profile?.full_name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          {member.role === 'admin' ? <ShieldCheck className="h-3 w-3 text-primary" /> : <UserCog className="h-3 w-3" />}
                          {member.role === 'admin' ? 'Administrador' : 'Membro'}
                        </p>
                      </div>
                    </div>
                    
                    {isOwner && member.user_id !== group.owner_id && (
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 text-muted-foreground hover:text-primary"
                          onClick={() => toggleAdmin(member.user_id, member.role)}
                          title={member.role === 'admin' ? 'Tirar Admin' : 'Tornar Admin'}
                        >
                          <ShieldCheck className={`h-5 w-5 ${member.role === 'admin' ? 'fill-primary text-primary' : ''}`} />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 text-destructive hover:bg-destructive/10"
                          onClick={() => removeMember(member.user_id)}
                          title="Remover"
                        >
                          <UserMinus className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
