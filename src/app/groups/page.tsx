'use client';

import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronRight, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { CreateGroupSheet } from '@/components/create-group-sheet';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const GroupItem = ({ group }: { group: any }) => (
  <Link
    href={`/groups/${group.id}`}
    className="block transition-colors hover:bg-accent"
  >
    <div className="flex items-center p-4 gap-4">
      <div className="flex -space-x-3">
        <Avatar className="h-10 w-10 border-2 border-card">
          <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm">{group.name}</h3>
        <p className="text-sm text-muted-foreground">
          Grupo de Lembretes
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
    </div>
  </Link>
);

export default function GroupsPage() {
  const [dbGroups, setDbGroups] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase.from('groups').select('*');
      if (data && !error) {
        setDbGroups(data);
      }
    }
    fetchGroups();
  }, [supabase]);

  return (
    <MainLayout>
      <div className="flex flex-col h-full pb-28">
        <div className="p-4 pt-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Grupos</h1>
          <CreateGroupSheet>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </CreateGroupSheet>
        </div>

        {dbGroups.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {dbGroups.map((group) => (
                <GroupItem key={group.id} group={group} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">
              Você ainda não está em nenhum grupo.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
