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

export function CreateGroupSheet({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const handleSave = () => {
    // Here we would normally save the group to the database
    // For now, just show a success toast
    toast({
        title: "Grupo criado!",
        description: "Seu novo grupo foi criado com sucesso.",
    });
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
            <Input id="group-name" placeholder="Ex: Família" className="bg-muted h-12"/>
          </div>
          {/* We can add member invitation functionality here later */}
        </div>
        <SheetFooter className="p-4 bg-card border-t mt-auto">
            <SheetClose asChild>
                <Button onClick={handleSave} type="submit" size="lg" className="w-full h-12">
                    Salvar Grupo
                </Button>
            </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
