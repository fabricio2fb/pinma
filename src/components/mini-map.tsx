'use client';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

const MapPin = ({ priority }: { priority: 'Normal' | 'Urgente' }) => (
    <div 
      className={`w-4 h-4 rounded-full shadow-md
        ${priority === 'Urgente' 
          ? 'bg-destructive' 
          : 'bg-primary border-2 border-card'
        }`
      } 
    />
);

export default function MiniMap({ position, priority }: { position: { lat: number; lng: number }, priority: 'Normal' | 'Urgente' }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID_DARK || 'a1ff1089ca40c26';

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-md">
        <div className="text-center text-muted-foreground p-4">
          <p className="text-xs">Mapa indisponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 w-full rounded-md overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={mapId}
          style={{ width: '100%', height: '100%' }}
          defaultCenter={position}
          defaultZoom={15}
          gestureHandling={'none'}
          disableDefaultUI={true}
        >
            <AdvancedMarker position={position}>
                <MapPin priority={priority} />
            </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
