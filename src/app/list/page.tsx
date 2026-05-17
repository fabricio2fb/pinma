'use client';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ReminderDetailSheet } from '@/components/reminder-detail-sheet';
import { ReminderItem } from '@/components/reminder-item';
import {
  List,
  Search,
  X,
  CheckCircle2,
  Clock,
  Users,
  Layers,
} from 'lucide-react';

export default function ListPage() {
  const filters = [
    {
      label: 'Todos',
      icon: Layers,
    },
    {
      label: 'Ativos',
      icon: Clock,
    },
    {
      label: 'Concluídos',
      icon: CheckCircle2,
    },
    {
      label: 'Grupos',
      icon: Users,
    },
  ];

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [dbReminders, setDbReminders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchReminders() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setDbReminders(data);
      }

      setIsLoading(false);
    }

    fetchReminders();
  }, [supabase]);

  const getFilterCount = (filter: string) => {
    if (filter === 'Todos') return dbReminders.length;
    if (filter === 'Ativos') {
      return dbReminders.filter((item) => item.is_active === true).length;
    }
    if (filter === 'Concluídos') {
      return dbReminders.filter((item) => item.is_active === false).length;
    }
    if (filter === 'Grupos') {
      return dbReminders.filter((item) => Boolean(item.group_id)).length;
    }

    return 0;
  };

  const filteredReminders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return dbReminders.filter((reminder) => {
      const title = String(reminder.title || reminder.name || '').toLowerCase();
      const description = String(reminder.description || '').toLowerCase();
      const category = String(reminder.category || '').toLowerCase();

      const matchesSearch =
        !term ||
        title.includes(term) ||
        description.includes(term) ||
        category.includes(term);

      const matchesFilter =
        activeFilter === 'Todos'
          ? true
          : activeFilter === 'Ativos'
            ? reminder.is_active === true
            : activeFilter === 'Concluídos'
              ? reminder.is_active === false
              : activeFilter === 'Grupos'
                ? Boolean(reminder.group_id)
                : true;

      return matchesSearch && matchesFilter;
    });
  }, [dbReminders, searchTerm, activeFilter]);

  const emptyTitle =
    dbReminders.length === 0
      ? 'Nenhum lembrete'
      : 'Nenhum resultado encontrado';

  const emptyDescription =
    dbReminders.length === 0
      ? 'Você ainda não criou nenhum lembrete geo-localizado.'
      : 'Tente mudar o filtro ou buscar por outro termo.';

  return (
    <MainLayout>
      <div className="flex h-full flex-col lg:p-8 lg:gap-8">
        <div className="px-5 pt-8 pb-4 lg:p-0 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[28px] leading-tight lg:text-4xl font-bold tracking-tight">
                Seus Lembretes
              </h1>

              <p className="text-muted-foreground text-sm lg:text-base mt-1 max-w-[280px] lg:max-w-none">
                Gerencie seus pins e notificações
              </p>
            </div>

            <div className="hidden lg:block text-sm text-muted-foreground">
              {filteredReminders.length} de {dbReminders.length} lembrete
              {dbReminders.length === 1 ? '' : 's'}
            </div>
          </div>

          <div className="lg:hidden text-xs text-muted-foreground">
            {filteredReminders.length} de {dbReminders.length} lembrete
            {dbReminders.length === 1 ? '' : 's'}
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar lembrete..."
              className="
                w-full
                h-11
                lg:h-12
                rounded-2xl
                bg-card/55
                border
                border-border/60
                pl-11
                pr-11
                text-sm
                outline-none
                transition-all
                placeholder:text-muted-foreground/80
                focus:border-primary/60
                focus:ring-4
                focus:ring-primary/10
              "
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  h-7
                  w-7
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-muted-foreground
                  hover:text-foreground
                  hover:bg-muted
                  transition-all
                "
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="-mx-5 px-5 overflow-x-auto no-scrollbar">
            <div className="flex w-max gap-2 rounded-2xl lg:bg-muted/30 lg:p-1.5 lg:border lg:border-border/40">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const count = getFilterCount(filter.label);
                const active = activeFilter === filter.label;

                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => setActiveFilter(filter.label)}
                    className={cn(
                      `
                        h-10
                        px-4
                        rounded-2xl
                        text-sm
                        font-semibold
                        flex
                        items-center
                        gap-2
                        whitespace-nowrap
                        border
                        transition-all
                        lg:border-0
                      `,
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-black/10'
                        : 'bg-card/45 text-muted-foreground border-border/50 hover:text-foreground hover:bg-card/80'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{filter.label}</span>
                    <span
                      className={cn(
                        'text-xs rounded-full px-1.5 py-0.5',
                        active
                          ? 'bg-primary-foreground/15 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 lg:px-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 pb-32 lg:pb-0">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[78px] lg:h-[96px] rounded-[28px] bg-card/40 border border-border/50 animate-pulse"
                />
              ))}
            </div>
          ) : filteredReminders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 pb-32 lg:pb-0">
              {filteredReminders.map((reminder) => (
                <ReminderDetailSheet
                  key={reminder.id}
                  reminder={{
                    ...reminder,
                    name: reminder.title,
                  }}
                >
                  <div className="group cursor-pointer">
                    <div
                      className="
                        bg-card/45
                        backdrop-blur-md
                        border
                        border-border/50
                        rounded-[28px]
                        lg:rounded-[32px]
                        px-5
                        py-4
                        lg:p-6
                        min-h-[78px]
                        lg:min-h-[96px]
                        flex
                        items-center
                        hover:border-primary/50
                        hover:bg-primary/[0.02]
                        transition-all
                        duration-300
                        shadow-lg
                        shadow-black/[0.02]
                        hover:shadow-primary/5
                      "
                    >
                      <ReminderItem
                        className="bg-transparent p-0 hover:bg-transparent w-full"
                        reminder={{
                          ...reminder,
                          name: reminder.title,
                        }}
                      />
                    </div>
                  </div>
                </ReminderDetailSheet>
              ))}
            </div>
          ) : (
            <div className="mx-1 flex flex-col items-center justify-center py-16 bg-muted/20 border border-dashed border-border rounded-[32px]">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <List className="text-muted-foreground h-8 w-8" />
              </div>

              <h3 className="text-lg font-bold">{emptyTitle}</h3>

              <p className="text-muted-foreground max-w-[260px] text-center mt-2 text-sm">
                {emptyDescription}
              </p>

              {dbReminders.length === 0 ? (
                <Button asChild className="mt-6 rounded-2xl" variant="outline">
                  <a href="/map">Ir para o Mapa</a>
                </Button>
              ) : (
                <Button
                  className="mt-6 rounded-2xl"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('Todos');
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
