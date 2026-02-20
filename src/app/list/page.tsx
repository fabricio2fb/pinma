import { MainLayout } from '@/components/main-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { mockReminders } from '@/lib/data';
import type { Reminder } from '@/lib/types';
import { Banknote, Briefcase, Home, MoreVertical, Pill, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const categoryIcons = {
  Mercado: <ShoppingCart className="h-6 w-6" />,
  Farmácia: <Pill className="h-6 w-6" />,
  Banco: <Banknote className="h-6 w-6" />,
  Casa: <Home className="h-6 w-6" />,
  Trabalho: <Briefcase className="h-6 w-6" />,
  Outro: <Star className="h-6 w-6" />,
};

const ReminderCard = ({ reminder }: { reminder: Reminder }) => (
  <Card className="glassmorphism overflow-hidden">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="bg-primary/20 p-3 rounded-xl text-primary">
        {categoryIcons[reminder.category]}
      </div>
      <div className="flex-1">
        <div className='flex justify-between items-start'>
            <div>
                <h3 className="font-bold">{reminder.name}</h3>
                <p className="text-sm text-muted-foreground">{reminder.location}</p>
            </div>
            {reminder.priority === 'Urgente' && <Badge variant="destructive" className="bg-secondary text-secondary-foreground border-0 h-6">Urgente</Badge>}
        </div>
        <div className="flex items-center gap-4 mt-2">
            <p className="text-xs text-accent">{reminder.distance}</p>
            {reminder.group && <Badge variant="outline" className="border-accent text-accent">{reminder.group}</Badge>}
        </div>
      </div>
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem><Check className="mr-2 h-4 w-4" />Concluir</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Deletar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardContent>
  </Card>
);

export default function ListPage() {
  const filters = ['Todos', 'Ativos', 'Concluídos', 'Grupos'];

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="font-headline text-3xl font-bold mb-4">Meus Lembretes</h1>
        <div className="flex gap-2 mb-6">
          {filters.map((filter, i) => (
            <Badge key={filter} variant={i === 0 ? 'default' : 'outline'} className={`px-4 py-2 text-sm rounded-full cursor-pointer ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-transparent border-primary text-primary'}`}>
              {filter}
            </Badge>
          ))}
        </div>

        {mockReminders.length > 0 ? (
          <div className="space-y-4">
            {mockReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-20">
            <p className="text-muted-foreground">Nenhum lembrete ainda.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
