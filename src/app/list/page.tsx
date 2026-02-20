import { MainLayout } from '@/components/main-layout';
import { mockReminders } from '@/lib/data';
import type { Reminder } from '@/lib/types';
import { Banknote, Briefcase, Home, MoreVertical, Pill, ShoppingCart, Star, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const categoryIcons = {
  Mercado: <ShoppingCart className="h-5 w-5" />,
  Farmácia: <Pill className="h-5 w-5" />,
  Banco: <Banknote className="h-5 w-5" />,
  Casa: <Home className="h-5 w-5" />,
  Trabalho: <Briefcase className="h-5 w-5" />,
  Outro: <Star className="h-5 w-5" />,
};

const ReminderItem = ({ reminder }: { reminder: Reminder }) => (
  <div className="flex items-center gap-4 p-4">
    <div className="bg-muted h-10 w-10 flex items-center justify-center rounded-md text-foreground">
      {categoryIcons[reminder.category]}
    </div>
    <div className="flex-1">
      <div className='flex items-center gap-2'>
          {reminder.priority === 'Urgente' && <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />}
          <h3 className="font-semibold text-sm truncate">{reminder.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{reminder.location}</p>
    </div>
    <div className="text-xs text-muted-foreground whitespace-nowrap">{reminder.distance}</div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem><Check className="mr-2 h-4 w-4" />Concluir</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" />Deletar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export default function ListPage() {
  const filters = ['Todos', 'Ativos', 'Concluídos', 'Grupos'];
  const [activeFilter, setActiveFilter] = useState('Todos');

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="p-4 pt-6">
            <h1 className="text-2xl font-bold mb-4">Lembretes</h1>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                    {filters.map((filter) => (
                        <button 
                            key={filter} 
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium border rounded-md transition-colors",
                                activeFilter === filter ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                            )}
                        >
                        {filter}
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>

        {mockReminders.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {mockReminders.map(reminder => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Nenhum lembrete ainda.</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
