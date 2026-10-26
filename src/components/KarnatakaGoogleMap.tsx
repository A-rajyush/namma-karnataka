import React, { useEffect, useState, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { KARNATAKA_DESTINATIONS, Destination } from '../data/karnatakaData';
import { Compass, ExternalLink, MapPin } from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCFzeGk_36Mh-Q-MvSkzZ83jTrBFtLRwJE';

interface KarnatakaGoogleMapProps {
  selectedDestinationId: string | null;
  onSelectDestination: (id: string) => void;
  onOpenDestinationGuide?: (id: string) => void;
  activeRouteIds: string[];
  theme: 'dark' | 'light';
}

export const QuotaErrorModal: React.FC = () => {
  const [exceeded, setExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaError = () => setExceeded(true);
    window.addEventListener('gmp-quota-error', handleQuotaError);
    return () => window.removeEventListener('gmp-quota-error', handleQuotaError);
  }, []);

  if (!exceeded) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          color: '#141413',
          padding: '24px',
          borderRadius: '14px',
          maxWidth: '440px',
          border: '1px solid #E6E4DD',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '18px', fontWeight: 700, color: '#B91C1C' }}>
          Demo Key Quota Reached
        </h2>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#4A4945' }}>
          The shared prototyping quota for the Google Maps Demo Key has been exhausted. To
          continue using Google Maps:
        </p>
        <ol style={{ fontSize: '13px', lineHeight: 1.6, color: '#4A4945', paddingLeft: '18px' }}>
          <li>
            Ask the AI Studio Agent to set up your own key (e.g.,{' '}
            <em>&quot;Set up my own Google Maps key&quot;</em>).
          </li>
          <li>
            Or manually add <code>VITE_GOOGLE_MAPS_API_KEY</code> in AI Studio Settings &rarr;
            Secrets.
          </li>
        </ol>
        <button
          onClick={() => setExceeded(false)}
          style={{
            marginTop: '14px',
            padding: '8px 16px',
            cursor: 'pointer',
            background: '#0F5338',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

interface RouteOverlayProps {
  activeRouteIds: string[];
  selectedDestinationId: string | null;
}

const MapControllerAndRouteOverlay: React.FC<RouteOverlayProps> = ({
  activeRouteIds,
  selectedDestinationId,
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !selectedDestinationId) return;
    const dest = KARNATAKA_DESTINATIONS.find((d) => d.id === selectedDestinationId);
    if (dest) {
      map.panTo({ lat: dest.lat, lng: dest.lng });
    }
  }, [map, selectedDestinationId]);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const stops = activeRouteIds
      .map((id) => KARNATAKA_DESTINATIONS.find((d) => d.id === id))
      .filter((d): d is Destination => Boolean(d));

    if (stops.length < 2) return;

    const path = stops.map((s) => ({
      lat: s.lat,
      lng: s.lng,
    }));

    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 3,
    };

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#0F5338',
      strokeOpacity: 0.9,
      strokeWeight: 3.5,
      icons: [
        {
          icon: lineSymbol,
          offset: '0',
          repeat: '16px',
        },
      ],
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, activeRouteIds]);

  return null;
};

export const KarnatakaGoogleMap: React.FC<KarnatakaGoogleMapProps> = ({
  selectedDestinationId,
  onSelectDestination,
  onOpenDestinationGuide,
  activeRouteIds,
  theme,
}) => {
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'terrain' | 'hybrid'>('terrain');
  const [infoOpen, setInfoOpen] = useState<boolean>(true);
  const isLight = theme === 'light';

  const selectedDestination =
    KARNATAKA_DESTINATIONS.find((d) => d.id === selectedDestinationId) ||
    KARNATAKA_DESTINATIONS[0];

  const handleMarkerClick = (id: string) => {
    onSelectDestination(id);
    setInfoOpen(true);
  };

  return (
    <div
      className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden surface-card shadow-sm"
      data-testid="karnataka-google-map"
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: 14.25, lng: 75.85 }}
          defaultZoom={7}
          mapTypeId={mapTypeId}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          streetViewControl={false}
          fullscreenControl={false}
          mapTypeControl={false}
          colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%', minHeight: '520px' }}
        >
          <MapControllerAndRouteOverlay
            activeRouteIds={activeRouteIds}
            selectedDestinationId={selectedDestinationId}
          />

          {KARNATAKA_DESTINATIONS.map((dest) => {
            const isSelected = dest.id === selectedDestinationId;
            const routeIndex = activeRouteIds.indexOf(dest.id);
            const isInRoute = routeIndex !== -1;

            return (
              <AdvancedMarker
                key={dest.id}
                position={{ lat: dest.lat, lng: dest.lng }}
                title={`${dest.name} (${dest.region})`}
                onClick={() => handleMarkerClick(dest.id)}
                zIndex={isSelected ? 50 : isInRoute ? 30 : 10}
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-[#0F5338] text-white border-white scale-110'
                      : isInRoute
                      ? 'bg-[#141413] text-white border-emerald-400 hover:scale-105'
                      : 'bg-white text-[#141413] border-stone-300 hover:border-[#0F5338] hover:scale-105'
                  }`}
                >
                  {isInRoute ? (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold">
                      {routeIndex + 1}
                    </span>
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-[#0F5338]'
                      }`}
                    />
                  )}
                  <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">
                    {dest.name}
                  </span>
                </div>
              </AdvancedMarker>
            );
          })}

          {infoOpen && selectedDestination && (
            <InfoWindow
              position={{
                lat: selectedDestination.lat,
                lng: selectedDestination.lng,
              }}
              pixelOffset={[0, -34]}
              maxWidth={290}
              onCloseClick={() => setInfoOpen(false)}
            >
              <div className="p-1 text-stone-900 font-sans">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#0F5338] font-semibold">
                    {selectedDestination.region}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500">
                    {selectedDestination.elevationMeters}m ASL
                  </span>
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {selectedDestination.name}{' '}
                  <span className="text-xs font-normal text-stone-500">
                    ({selectedDestination.kannadaName})
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                  {selectedDestination.tagline}
                </p>
                <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-stone-800 font-semibold">
                    INR {(selectedDestination.baseDailyCostINR ?? 3500).toLocaleString()}/day
                  </span>
                  {onOpenDestinationGuide && (
                    <button
                      type="button"
                      onClick={() => onOpenDestinationGuide(selectedDestination.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0F5338] hover:bg-[#0B3E2A] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      View Guide
                    </button>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Top-Left Map Layer Switcher */}
      <div
        className={`absolute top-3.5 left-3.5 z-10 flex items-center gap-1 p-1 rounded-lg border shadow-md backdrop-blur-md ${
          isLight
            ? 'bg-white/95 border-stone-200 text-stone-800'
            : 'bg-[#161918]/95 border-stone-700 text-stone-200'
        }`}
      >
        {(
          [
            { id: 'terrain', label: 'Terrain' },
            { id: 'roadmap', label: 'Road Map' },
            { id: 'hybrid', label: 'Satellite' },
          ] as const
        ).map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setMapTypeId(mode.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              mapTypeId === mode.id
                ? 'btn-primary font-semibold'
                : 'hover:opacity-80'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Top-Right Active Route Count */}
      <div
        className={`absolute top-3.5 right-3.5 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium shadow-md backdrop-blur-md ${
          isLight
            ? 'bg-white/95 border-stone-200 text-stone-800'
            : 'bg-[#161918]/95 border-stone-700 text-stone-200'
        }`}
      >
        <MapPin className="w-3.5 h-3.5 text-[#0F5338]" />
        <span>
          {activeRouteIds.length} {activeRouteIds.length === 1 ? 'Stop' : 'Stops'} in Current Route
        </span>
      </div>

      {/* Bottom Selected Destination Quick Bar */}
      {selectedDestination && (
        <div
          className={`absolute bottom-3.5 left-3.5 right-3.5 z-10 p-3.5 rounded-xl border shadow-lg backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLight
              ? 'bg-white/95 border-stone-200 text-stone-900'
              : 'bg-[#161918]/95 border-stone-700 text-stone-100'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium text-caption">
              <span className="font-semibold" style={{ color: 'var(--accent-text)' }}>
                {selectedDestination.region}
              </span>
              <span>•</span>
              <span className="font-mono">
                {selectedDestination.lat.toFixed(2)}°N, {selectedDestination.lng.toFixed(2)}°E
              </span>
              <span>•</span>
              <span className="font-mono">{selectedDestination.elevationMeters}m elevation</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h4 className="text-sm font-bold truncate">{selectedDestination.name}</h4>
              <span className="text-xs text-caption">{selectedDestination.kannadaName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedDestination.lat},${selectedDestination.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg surface-subtle text-xs font-medium hover:opacity-85 transition-opacity"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Maps
            </a>
            {onOpenDestinationGuide && (
              <button
                type="button"
                onClick={() => onOpenDestinationGuide(selectedDestination.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-primary text-xs font-semibold transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                Read Destination Guide
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
