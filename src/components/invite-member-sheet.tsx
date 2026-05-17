'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Copy, UserPlus, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function InviteMemberSheet({ 
  groupId, 
  groupName, 
  inviteCode, 
  open,
  onOpenChange
}: { 
  groupId: string, 
  groupName: string, 
  inviteCode: string, 
  open?: boolean,
  onOpenChange?: (open: boolean) => void
}) {
  const [username, setUsername] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleInviteByUsername = async () => {
    if (!username.trim()) return;
    setIsInviting(true);

    try {
      const cleanUsername = username.replace('@', '').trim();
      
      // 1. Buscar o ID do usuário pelo username (guardado no full_name)
      const { data: invitee, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', cleanUsername)
        .single();

      if (findError || !invitee) {
        throw new Error('Usuário não encontrado. Verifique o @handle.');
      }

      const { data: { user: inviter } } = await supabase.auth.getUser();
      if (!inviter) return;

      // 2. Criar o convite
      const { error: inviteError } = await supabase
        .from('group_invites')
        .insert({
          group_id: groupId,
          inviter_id: inviter.id,
          invitee_id: invitee.id,
          status: 'pending'
        });

      if (inviteError) {
        if (inviteError.code === '23505') {
            throw new Error('Este usuário já foi convidado ou já faz parte do grupo.');
        }
        throw inviteError;
      }

      toast({
        title: "Convite enviado!",
        description: `Enviamos um convite para @${cleanUsername}.`,
      });
      setUsername('');
    } catch (error: any) {
      toast({
        title: "Erro ao convidar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/groups/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Compartilhe o link com quem você deseja convidar.",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-[16px] bg-card border-t p-0 flex flex-col">
        <div className="w-full py-4 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <SheetHeader className="px-6 pb-2 text-left flex flex-row justify-between items-center">
          <SheetTitle className="font-bold text-lg">Convidar para {groupName}</SheetTitle>
          <SheetClose className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            ✕
          </SheetClose>
        </SheetHeader>
        
        <div className="px-6 py-6 space-y-8 pb-10">
          <div className="space-y-4">
            <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Convidar por @username</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Ex: @joao_silva" 
                className="bg-muted h-12"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button 
                onClick={handleInviteByUsername} 
                disabled={isInviting || !username.trim()}
                className="h-12 px-6"
              >
                {isInviting ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou compartilhe o link</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={copyInviteLink}
              className="w-full h-14 border-dashed border-2 flex items-center justify-between px-6 bg-muted/50 hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-primary" />
                <span className="font-semibold">Link de convite</span>
              </div>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </Button>
            <p className="text-[10px] text-center text-muted-foreground italic">Qualquer pessoa com este link poderá entrar no grupo.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
