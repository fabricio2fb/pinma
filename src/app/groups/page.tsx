import { MainLayout } from '@/components/main-layout';
import { mockGroups } from '@/lib/data';
import type { Group } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const GroupItem = ({ group }: { group: Group }) => (
  <div className="flex items-center p-4 gap-4">
    <div className="flex -space-x-3">
      {group.avatars.slice(0, 3).map((avatarUrl, i) => (
        <Avatar key={i} className="h-10 w-10 border-2 border-card">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-sm">{group.name}</h3>
      <p className="text-sm text-muted-foreground">{group.members} membros • {group.activeReminders} lembretes</p>
    </div>
  </div>
);


export default function GroupsPage() {
  return (
    <MainLayout>
       <div className="flex flex-col h-full">
        <div className="p-4 pt-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Grupos</h1>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {mockGroups.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="divide-y">
                {mockGroups.map(group => (
                  <GroupItem key={group.id} group={group} />
                ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">Você ainda não está em nenhum grupo.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
