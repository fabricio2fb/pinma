'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Check, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export function InboxSheet({ children }: { children: React.ReactNode }) {
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchInvites = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('group_invites')
      .select('*, group:group_id(name)')
      .eq('invitee_id', user.id)
      .eq('status', 'pending');

    if (!error && data) {
      setInvites(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleAction = async (inviteId: string, groupId: string, action: 'accepted' | 'declined') => {
    setProcessingId(inviteId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (action === 'accepted') {
        // 1. Adicionar ao grupo
        const { error: joinError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: user.id,
            role: 'member'
          });
        
        if (joinError) throw joinError;
      }

      // 2. Atualizar status do convite
      const { error: updateError } = await supabase
        .from('group_invites')
        .update({ status: action })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      toast({
        title: action === 'accepted' ? "Convite aceito!" : "Convite recusado.",
        description: action === 'accepted' ? "Você agora faz parte do grupo." : "O convite foi removido.",
      });

      setInvites(invites.filter(i => i.id !== inviteId));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Sheet onOpenChange={(open) => open && fetchInvites()}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[70%] rounded-t-[16px] bg-card border-t p-0 flex flex-col">
        <div className="w-full py-4 flex justify-center">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <SheetHeader className="px-6 pb-2 text-left">
          <SheetTitle className="font-bold text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Caixa de Entrada
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length > 0 ? (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{invite.group?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      Convite para : {invite.group?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Deseja participar deste grupo?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      disabled={processingId === invite.id}
                      onClick={() => handleAction(invite.id, invite.group_id, 'declined')}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      className="h-9 w-9 bg-green-600 hover:bg-green-700 text-white"
                      disabled={processingId === invite.id}
                      onClick={() => handleAction(invite.id, invite.group_id, 'accepted')}
                    >
                      {processingId === invite.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">Sua caixa de entrada está vazia.</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
