'use client';

import type { Reminder } from '@/lib/types';
import { Banknote, Briefcase, Home, MoreVertical, Pill, ShoppingCart, Star, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const categoryIcons: { [key: string]: React.ReactNode } = {
    Mercado: <ShoppingCart className="h-5 w-5" />,
    Farmácia: <Pill className="h-5 w-5" />,
    Banco: <Banknote className="h-5 w-5" />,
    Casa: <Home className="h-5 w-5" />,
    Trabalho: <Briefcase className="h-5 w-5" />,
    Outro: <Star className="h-5 w-5" />,
};

export const ReminderItem = ({ reminder }: { reminder: Reminder }) => (
  <div className="flex items-center gap-4 p-4 transition-colors hover:bg-accent cursor-pointer">
    <div className="bg-muted h-10 w-10 flex items-center justify-center rounded-md text-foreground">
      {categoryIcons[reminder.category]}
    </div>
    <div className="flex-1 min-w-0">
      <div className='flex items-center gap-2'>
          {reminder.priority === 'Urgente' && <div className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />}
          <h3 className="font-semibold text-sm truncate">{reminder.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground truncate">{reminder.location}</p>
    </div>
    {reminder.distance && <div className="text-xs text-muted-foreground whitespace-nowrap">{reminder.distance}</div>}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem><Check className="mr-2 h-4 w-4" />Concluir</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" />Deletar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
