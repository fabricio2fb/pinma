import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockGroups } from '@/lib/data';
import type { Group } from '@/lib/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const GroupCard = ({ group }: { group: Group }) => (
  <Card className="glassmorphism">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{group.name}</h3>
          <p className="text-sm text-muted-foreground">{group.members} membros • {group.activeReminders} lembretes</p>
        </div>
        <div className="flex -space-x-2">
          {group.avatars.slice(0, 3).map((avatarUrl, i) => (
            <Avatar key={i} className="h-8 w-8 border-2 border-card">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);


export default function GroupsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-headline text-3xl font-bold">Grupos</h1>
          <Button variant="ghost" size="icon">
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {mockGroups.length > 0 ? (
          <div className="space-y-4">
            {mockGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-20">
            <p className="text-muted-foreground">Você ainda não está em nenhum grupo.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
