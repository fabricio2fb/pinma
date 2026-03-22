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
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export function CreateGroupSheet({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar um grupo.",
          variant: "destructive"
        });
        return;
      }

      // 1. Criar o grupo
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name,
          owner_id: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. Adicionar o criador como admin membro (opcional dependendo da lógica do banco, 
      // mas o trigger ou a política podem exigir/automatizar. Aqui garantimos.)
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
          title: "Grupo criado!",
          description: `O grupo "${name}" foi criado com sucesso.`,
      });
      
      setName('');
      window.location.reload(); // Recarregar para mostrar o novo grupo
    } catch (error: any) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-auto rounded-t-[16px] bg-card border-t p-0 flex flex-col">
        <div className="w-full py-4 flex justify-center">
            <div className="w-9 h-1 rounded-full bg-border" />
        </div>
        <SheetHeader className="px-6 pb-2 text-left">
          <SheetTitle className="font-bold text-lg">Novo Grupo</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 space-y-6 no-scrollbar py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Nome do Grupo</Label>
            <Input 
              id="group-name" 
              placeholder="Ex: Família" 
              className="bg-muted h-12"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <SheetFooter className="p-4 bg-card border-t mt-auto">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !name.trim()}
            type="submit" 
            size="lg" 
            className="w-full h-12"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Salvar Grupo'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
