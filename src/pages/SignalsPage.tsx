import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Filter, Activity, Eye, Clock, MapPin, Camera, Database, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { fetchRecentObservations, fetchDashboardMetrics, type ObservationWithSite, type DashboardMetricsData } from '@/lib/dashboardService';
import type { ObservationSource } from '@/types';

type FilterValue = 'all' | 'citizen' | 'demo' | 'today';

const filterOptions: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All observations' },
  { value: 'citizen', label: 'Citizen reports' },
  { value: 'today', label: 'Today' },
  { value: 'demo', label: 'Demo data' },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function deriveTitle(obs: ObservationWithSite): string {
  const parts: string[] = [];
  if (obs.water_appearance) parts.push(obs.water_appearance.toLowerCase());
  if (obs.visible_pollution && !obs.visible_pollution.toLowerCase().includes('none visible')) {
    parts.push(`${obs.visible_pollution.toLowerCase()} observed`);
  }
  if (parts.length === 0) return 'Environmental observation recorded';
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
}

export function SignalsPage() {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [observations, setObservations] = useState<ObservationWithSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetricsData | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [obsData, metricsData] = await Promise.all([
        fetchRecentObservations(50),
        fetchDashboardMetrics(),
      ]);
      setObservations(obsData);
      setMetrics(metricsData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayIso = startOfDay.toISOString();

  const filtered = observations.filter((obs) => {
    if (filter === 'citizen') return obs.source === 'citizen' && !obs.is_demo;
    if (filter === 'today') return obs.submitted_at >= todayIso;
    if (filter === 'demo') return obs.is_demo;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Observation Activity"
        subtitle="Recent environmental observations from citizen reports across monitored freshwater sites."
        icon={<LayoutDashboard className="w-5.5 h-5.5" />}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Signals' }]}
      />

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Observations" value={metrics?.totalObservations ?? '—'} icon={<Activity className="w-5 h-5" />} accent="aqua" />
        <MetricCard label="Sites Monitored" value={metrics?.sitesMonitored ?? '—'} icon={<MapPin className="w-5 h-5" />} accent="neutral" />
        <MetricCard label="Observations Today" value={metrics?.observationsToday ?? '—'} icon={<Eye className="w-5 h-5" />} accent="amber" />
        <MetricCard label="Confidence Scoring" value="Coming in analysis" icon={<Clock className="w-5 h-5" />} accent="success" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-thin pb-1">
        <Filter className="w-4 h-4 text-sand-400 flex-shrink-0" />
        {filterOptions.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap border transition-all ${
              filter === f.value
                ? 'bg-aqua-700 text-white border-aqua-700'
                : 'bg-white text-sand-600 border-sand-200 hover:border-aqua-200 hover:text-aqua-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading observations…" />
      ) : error ? (
        <ErrorState
          message="We could not load observations. Please check your connection and try again."
          onRetry={load}
        />
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((obs) => (
            <ObservationActivityCard key={obs.id} observation={obs} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No observations in this category"
          message="Try selecting a different filter to see observations in other categories."
          icon={<Activity className="w-8 h-8" />}
        />
      )}
    </>
  );
}

function ObservationActivityCard({ observation: obs }: { observation: ObservationWithSite }) {
  const siteName = obs.sites?.name ?? 'Unknown site';
  const region = obs.sites?.region ?? '';
  const title = deriveTitle(obs);
  const hasPollution = obs.visible_pollution && !obs.visible_pollution.toLowerCase().includes('none visible');

  return (
    <Link
      to={`/signals/${obs.id}`}
      className="block surface p-5 hover:shadow-card hover:border-aqua-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-sand-500 mb-1">
            <MapPin className="w-4 h-4 text-aqua-500 flex-shrink-0" />
            <span className="font-medium text-sand-700 truncate">{siteName}</span>
            {region && (
              <>
                <span className="text-sand-300">·</span>
                <span className="text-sand-400 truncate">{region}</span>
              </>
            )}
          </div>
          <h3 className="text-base font-semibold text-sand-900 group-hover:text-aqua-800 transition-colors">
            {title}
          </h3>
        </div>
        <ArrowRight className="w-5 h-5 text-sand-300 group-hover:text-aqua-500 transition-colors flex-shrink-0" />
      </div>

      <p className="text-sm text-sand-600 leading-relaxed mb-4 line-clamp-2">
        {obs.notes || `${obs.water_appearance ?? 'Water appearance recorded'}${obs.odour ? `, ${obs.odour.toLowerCase()} odour` : ''}${obs.water_flow ? `, ${obs.water_flow.toLowerCase()} flow` : ''}.`}
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`chip ${obs.is_demo ? 'bg-sand-100 text-sand-500 border-sand-200' : 'bg-aqua-50 text-aqua-700 border-aqua-200'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${obs.is_demo ? 'bg-sand-400' : 'bg-aqua-500'}`} aria-hidden="true" />
          {obs.is_demo ? 'Demo data' : 'Citizen report'}
        </span>
        <span className="chip bg-amber-50 text-amber-700 border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          Awaiting analysis
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-sand-100 flex items-center gap-4 text-xs text-sand-500">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(obs.submitted_at)}
        </span>
        {hasPollution && (
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            Pollution noted
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" />
          {obs.source === 'citizen' ? 'Citizen' : obs.source}
        </span>
      </div>
    </Link>
  );
}
