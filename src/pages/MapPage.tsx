import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Layers, Eye, MapPinned, Database, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState, ErrorState } from '@/components/ui/States';
import {
  fetchSitesWithCounts,
  fetchRecentObservations,
  type SiteWithObservationCount,
  type ObservationWithSite,
} from '@/lib/dashboardService';
import { fetchSignalsWithSites, type EnvironmentalSignalWithSite } from '@/lib/evidenceService';
import type { EnvironmentalSignalStatus } from '@/types';

type MarkerType = 'site' | 'observation' | 'signal';

interface MapMarkerData {
  id: string;
  type: MarkerType;
  label: string;
  lat: number;
  lng: number;
  siteId?: string;
  isDemo?: boolean;
  observationCount?: number;
  signalStatus?: EnvironmentalSignalStatus;
  signalStrength?: number;
}

const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'site', label: 'Sites' },
  { value: 'observation', label: 'Observations' },
  { value: 'signal', label: 'Signals' },
];

const signalStatusColors: Record<EnvironmentalSignalStatus, string> = {
  emerging: 'bg-amber-500 border-amber-300',
  monitoring: 'bg-aqua-500 border-aqua-300',
  resolved: 'bg-success-500 border-success-300',
  dismissed: 'bg-sand-400 border-sand-300',
};

export function MapPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(null);

  const [sites, setSites] = useState<SiteWithObservationCount[]>([]);
  const [observations, setObservations] = useState<ObservationWithSite[]>([]);
  const [signals, setSignals] = useState<EnvironmentalSignalWithSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [siteData, obsData, signalData] = await Promise.all([
        fetchSitesWithCounts(),
        fetchRecentObservations(50),
        fetchSignalsWithSites(),
      ]);
      setSites(siteData);
      setObservations(obsData);
      setSignals(signalData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build markers from real data
  const markers: MapMarkerData[] = [
    ...sites
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({
        id: `site-${s.id}`,
        type: 'site' as const,
        label: s.name,
        lat: Number(s.latitude),
        lng: Number(s.longitude),
        siteId: s.id,
        observationCount: s.observation_count,
      })),
    ...observations
      .filter((o) => o.sites?.latitude != null && o.sites?.longitude != null)
      .map((o) => ({
        id: `obs-${o.id}`,
        type: 'observation' as const,
        label: `${o.sites?.name ?? 'Unknown'} — ${o.water_appearance ?? 'Observation'}`,
        lat: Number(o.sites!.latitude),
        lng: Number(o.sites!.longitude),
        siteId: o.site_id ?? undefined,
        isDemo: o.is_demo,
      })),
    ...signals
      .filter((s) => s.sites?.latitude != null && s.sites?.longitude != null)
      .map((s) => ({
        id: `signal-${s.id}`,
        type: 'signal' as const,
        label: s.title,
        lat: Number(s.sites!.latitude),
        lng: Number(s.sites!.longitude),
        siteId: s.site_id ?? undefined,
        signalStatus: s.status,
        signalStrength: s.strength,
      })),
  ];

  const filtered = markers.filter((m) => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    return true;
  });

  // Normalize lat/lng to positions on the placeholder map (0-100%)
  const validMarkers = filtered.length > 0 ? filtered : markers;
  const lats = validMarkers.map((m) => m.lat);
  const lngs = validMarkers.map((m) => m.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const normalize = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 80 + 10;
    const y = (1 - (lat - minLat) / (maxLat - minLat || 1)) * 80 + 10;
    return { x, y };
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Observation Map"
        subtitle="Freshwater observations, monitoring sites, and emerging environmental signals across the catchment area."
        icon={<MapPin className="w-5.5 h-5.5" />}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Map' }]}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          <Layers className="w-4 h-4 text-sand-400 flex-shrink-0" />
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap border transition-all ${
                typeFilter === f.value
                  ? 'bg-aqua-700 text-white border-aqua-700'
                  : 'bg-white text-sand-600 border-sand-200 hover:border-aqua-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading map data…" />
      ) : error ? (
        <ErrorState
          message="We could not load map data. Please check your connection and try again."
          onRetry={load}
        />
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          {/* Map placeholder */}
          <div className="relative surface overflow-hidden" style={{ minHeight: '500px' }}>
            {/* Stylized map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-aqua-50 via-sand-50 to-aqua-100/40" />
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, rgba(34,131,154,0.15) 0%, transparent 50%),
                               radial-gradient(circle at 70% 60%, rgba(34,131,154,0.1) 0%, transparent 50%)`,
            }} />
            {/* Grid lines for map feel */}
            <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#84d9e4" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {/* River lines */}
            <svg className="absolute inset-0 w-full h-full" aria-hidden="true" preserveAspectRatio="none">
              <path d="M 0 200 Q 200 180 400 220 T 800 200" fill="none" stroke="#84d9e4" strokeWidth="3" opacity="0.4" />
              <path d="M 100 0 Q 120 150 180 300 T 250 500" fill="none" stroke="#84d9e4" strokeWidth="2.5" opacity="0.3" />
              <path d="M 600 0 Q 580 200 620 400 T 580 500" fill="none" stroke="#84d9e4" strokeWidth="2" opacity="0.25" />
            </svg>

            {/* Markers */}
            {filtered.map((marker) => {
              const { x, y } = normalize(marker.lat, marker.lng);
              const isSite = marker.type === 'site';
              const isSignal = marker.type === 'signal';
              const isDemo = marker.isDemo;
              const size = isSite ? 'w-3.5 h-3.5' : isSignal ? 'w-5 h-5' : 'w-4 h-4';
              const colorClass = isSignal
                ? signalStatusColors[marker.signalStatus ?? 'emerging']
                : isSite
                  ? 'bg-aqua-500 border-aqua-300'
                  : isDemo
                    ? 'bg-sand-400 border-sand-300'
                    : 'bg-amber-500 border-amber-300';
              const isSelected = selectedMarker?.id === marker.id;

              return (
                <button
                  key={marker.id}
                  onClick={() => setSelectedMarker(marker)}
                  className={`absolute ${size} rounded-full border-2 ${colorClass} shadow-soft transition-all duration-200 hover:scale-125 ${
                    isSelected ? 'ring-4 ring-aqua-200 scale-125 z-10' : 'z-0'
                  } ${isSignal ? 'ring-2 ring-offset-1 ring-aqua-100' : ''}`}
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  aria-label={`${marker.type}: ${marker.label}`}
                />
              );
            })}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 surface px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-sand-700 mb-1">Legend</p>
              <div className="flex items-center gap-2 text-xs text-sand-600">
                <span className="w-3.5 h-3.5 rounded-full bg-aqua-500 border-2 border-aqua-300" /> Monitoring site
              </div>
              <div className="flex items-center gap-2 text-xs text-sand-600">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-amber-300" /> Citizen observation
              </div>
              <div className="flex items-center gap-2 text-xs text-sand-600">
                <span className="w-3 h-3 rounded-full bg-sand-400 border-2 border-sand-300" /> Demo observation
              </div>
              <div className="flex items-center gap-2 text-xs text-sand-600">
                <span className="w-5 h-5 rounded-full bg-amber-500 border-2 border-amber-300 ring-2 ring-aqua-100" /> Environmental signal
              </div>
            </div>

            {/* Map info badge */}
            <div className="absolute top-4 right-4 surface px-3 py-1.5">
              <p className="text-xs text-sand-500">{filtered.length} markers shown</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {selectedMarker ? (
              <div className="surface p-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  {selectedMarker.type === 'observation' && <Eye className="w-4.5 h-4.5 text-sand-500" />}
                  {selectedMarker.type === 'site' && <MapPinned className="w-4.5 h-4.5 text-sand-500" />}
                  {selectedMarker.type === 'signal' && <TrendingUp className="w-4.5 h-4.5 text-sand-500" />}
                  <span className="text-xs font-medium text-sand-500 uppercase tracking-wide">{selectedMarker.type}</span>
                </div>
                <h3 className="text-base font-semibold text-sand-900">{selectedMarker.label}</h3>
                {selectedMarker.isDemo && (
                  <span className="inline-block mt-2 text-xs text-sand-400">Demo data</span>
                )}
                <div className="mt-4 pt-4 border-t border-sand-100 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sand-500">Latitude</span>
                    <span className="text-sand-800 font-mono text-xs">{selectedMarker.lat.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Longitude</span>
                    <span className="text-sand-800 font-mono text-xs">{selectedMarker.lng.toFixed(4)}</span>
                  </div>
                  {selectedMarker.observationCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sand-500">Observations</span>
                      <span className="text-sand-800 font-medium">{selectedMarker.observationCount}</span>
                    </div>
                  )}
                  {selectedMarker.signalStrength !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sand-500">Evidence Strength</span>
                      <span className="text-sand-800 font-medium tabular-nums">{selectedMarker.signalStrength}/100</span>
                    </div>
                  )}
                  {selectedMarker.signalStatus && (
                    <div className="flex justify-between">
                      <span className="text-sand-500">Status</span>
                      <span className="text-sand-800 font-medium capitalize">{selectedMarker.signalStatus}</span>
                    </div>
                  )}
                </div>
                {selectedMarker.type === 'observation' && selectedMarker.id.replace('obs-', '') && (
                  <Link to={`/signals/${selectedMarker.id.replace('obs-', '')}`} className="mt-4 block">
                    <button className="w-full px-4 py-2 text-sm font-medium text-aqua-700 border border-aqua-200 rounded-lg hover:bg-aqua-50 transition-colors">
                      View Observation Details
                    </button>
                  </Link>
                )}
                {selectedMarker.type === 'signal' && selectedMarker.id.replace('signal-', '') && (
                  <Link to={`/signals/${selectedMarker.id.replace('signal-', '')}`} className="mt-4 block">
                    <button className="w-full px-4 py-2 text-sm font-medium text-aqua-700 border border-aqua-200 rounded-lg hover:bg-aqua-50 transition-colors">
                      View Signal Details
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="surface p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <MapPin className="w-5 h-5 text-aqua-500" />
                  <h3 className="text-sm font-semibold text-sand-900">Map Overview</h3>
                </div>
                <p className="text-sm text-sand-500">
                  Click any marker to see details. Use the filters above to focus on specific types.
                </p>
              </div>
            )}

            {/* Site list */}
            <div className="surface p-5">
              <h3 className="text-sm font-semibold text-sand-900 mb-3">Monitoring Sites</h3>
              <div className="space-y-2">
                {sites.map((site) => (
                  <div key={site.id} className="flex items-center gap-2 text-sm">
                    <MapPinned className="w-3.5 h-3.5 text-sand-400 flex-shrink-0" />
                    <span className="text-sand-700">{site.name}</span>
                    <span className="text-sand-400 text-xs ml-auto">{site.region ?? ''}</span>
                    <span className="text-aqua-600 text-xs font-medium">{site.observation_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
