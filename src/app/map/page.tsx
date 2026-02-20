import { Plus, Search } from 'lucide-react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { AddReminderSheet } from '@/components/add-reminder-sheet';
import MapView from './map-view';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MapPage() {
  return (
    <MainLayout>
      <div className="relative h-full w-full">
        <Suspense fallback={<Skeleton className="h-full w-full bg-muted" />}>
           <MapView />
        </Suspense>

        <div className="absolute top-4 left-4 right-4 z-10">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar local..."
                    className="w-full h-12 pl-10 pr-4 rounded-md shadow-subtle bg-card border focus:ring-2 focus:ring-ring focus:outline-none"
                />
            </div>
        </div>
        
        <div className="absolute bottom-24 right-4 z-10">
          <AddReminderSheet>
            <Button size="icon" className="h-14 w-14 rounded-[14px] shadow-lg bg-[#0A0A0A] text-white hover:bg-[#0A0A0A]/90">
              <Plus className="h-7 w-7" />
            </Button>
          </AddReminderSheet>
        </div>

      </div>
    </MainLayout>
  );
}
