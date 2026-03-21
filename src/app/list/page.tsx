'use client';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ReminderDetailSheet } from '@/components/reminder-detail-sheet';
import { ReminderItem } from '@/components/reminder-item';

export default function ListPage() {
  const filters = ['Todos', 'Ativos', 'Concluídos', 'Grupos'];
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [dbReminders, setDbReminders] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReminders() {
      const { data, error } = await supabase.from('reminders').select('*');
      if (data && !error) {
        setDbReminders(data);
      }
    }
    fetchReminders();
  }, [supabase]);

  return (
    <MainLayout>
      <div className="flex flex-col h-full pb-28">
        <div className="p-4 pt-6">
          <h1 className="text-2xl font-bold mb-4">Lembretes</h1>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium border rounded-md transition-colors",
                  activeFilter === filter ? "bg-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {dbReminders.length > 0 ? (
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {dbReminders.map(reminder => (
                <ReminderDetailSheet key={reminder.id} reminder={{ ...reminder, name: reminder.title }}>
                  <ReminderItem reminder={{ ...reminder, name: reminder.title }} />
                </ReminderDetailSheet>
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
