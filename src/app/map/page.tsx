import { Plus } from 'lucide-react';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { AddReminderSheet } from './add-reminder-sheet';
import MapView from './map-view';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MapPage() {
  return (
    <MainLayout>
      <div className="relative h-full w-full">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
           <MapView />
        </Suspense>

        <div className="absolute top-4 left-4 right-4 z-10">
            <input
                type="text"
                placeholder="Buscar local..."
                className="w-full h-12 px-4 rounded-full shadow-lg bg-card/80 backdrop-blur-md border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none"
            />
        </div>
        
        <div className="absolute bottom-24 right-4 z-10">
          <AddReminderSheet>
            <Button size="icon" className="h-16 w-16 rounded-full shadow-lg" style={{boxShadow: '0 4px 20px rgba(108,99,255,0.4)'}}>
              <Plus className="h-8 w-8" />
            </Button>
          </AddReminderSheet>
        </div>

      </div>
    </MainLayout>
  );
}
