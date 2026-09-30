import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Camera, AlertCircle,
  FileText, Droplets, Wind, Leaf, Bird, StickyNote, ImageOff,
  TrendingUp, Layers, ChevronDown, Database,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { InfoBanner } from '@/components/ui/InfoBanner';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import {
  fetchObservationById,
  fetchObservationsBySite,
  getPhotoUrl,
  type ObservationWithPhotos,
  type ObservationWithSite,
} from '@/lib/dashboardService';
import {
  fetchSignalById,
  fetchSignalObservationsWithDetails,
  getSignalEvidence,
  type EnvironmentalSignalWithSite,
  type SignalObservationWithDetails,
} from '@/lib/evidenceService';
import { getObservationQualityCheck } from '@/lib/evidenceService';
import type { SignalEvidenceRow, ObservationQualityCheckRow, EnvironmentalSignalStatus } from '@/types';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

const statusConfig: Record<EnvironmentalSignalStatus, { label: string; chip: string; dot: string }> = {
  emerging: { label: 'Emerging', chip: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  monitoring: { label: 'Monitoring', chip: 'bg-aqua-50 text-aqua-700 border-aqua-200', dot: 'bg-aqua-500' },
  resolved: { label: 'Resolved', chip: 'bg-success-50 text-success-700 border-success-200', dot: 'bg-success-500' },
  dismissed: { label: 'Dismissed', chip: 'bg-sand-100 text-sand-500 border-sand-200', dot: 'bg-sand-400' },
};

type LoadMode = 'loading' | 'signal' | 'observation' | 'notfound' | 'error';

export function SignalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mode, setMode] = useState<LoadMode>('loading');
  const [signal, setSignal] = useState<EnvironmentalSignalWithSite | null>(null);
  const [signalObs, setSignalObs] = useState<SignalObservationWithDetails[]>([]);
  const [signalEvidence, setSignalEvidence] = useState<SignalEvidenceRow[]>([]);
  const [qualityChecks, setQualityChecks] = useState<Map<string, ObservationQualityCheckRow | null>>(new Map());

  const [observation, setObservation] = useState<ObservationWithPhotos | null>(null);
  const [relatedObs, setRelatedObs] = useState<ObservationWithSite[]>([]);
  const [photoErrors, setPhotoErrors] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!id) return;
    setMode('loading');
    setPhotoErrors(new Set());

    try {
      // Try signal first
      const sig = await fetchSignalById(id);
      if (sig) {
        setSignal(sig);
        const [obs, evidence] = await Promise.all([
          fetchSignalObservationsWithDetails(id),
          getSignalEvidence(id),
        ]);
        setSignalObs(obs);
        setSignalEvidence(evidence);

        // Fetch quality checks for linked observations
        const qChecks = new Map<string, ObservationQualityCheckRow | null>();
        for (const so of obs) {
          try {
            const qc = await getObservationQualityCheck(so.observation_id);
            qChecks.set(so.observation_id, qc);
          } catch {
            qChecks.set(so.observation_id, null);
          }
        }
        setQualityChecks(qChecks);
        setMode('signal');
        return;
      }

      // Try observation (backward compat)
      const obs = await fetchObservationById(id);
      if (obs) {
        setObservation(obs);
        if (obs.site_id) {
          const related = await fetchObservationsBySite(obs.site_id, 6);
          setRelatedObs(related.filter((o) => o.id !== obs.id));
        }
        setMode('observation');
        return;
      }

      setMode('notfound');
    } catch {
      setMode('error');
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handlePhotoError = (path: string) => {
    setPhotoErrors((prev) => new Set(prev).add(path));
  };

  // ── Loading ──────────────────────────────────────────────
  if (mode === 'loading') {
    return <LoadingState message="Loading…" />;
  }

  // ── Error ─────────────────────────────────────────────────
  if (mode === 'error') {
    return (
      <ErrorState
        message="We could not load this page. Please check your connection and try again."
        onRetry={load}
      />
    );
  }

  // ── Not found ────────────────────────────────────────────
  if (mode === 'notfound') {
    return (
      <EmptyState
        title="Not found"
        message="This signal or observation may have been removed or the ID is incorrect."
        icon={<AlertCircle className="w-8 h-8" />}
        action={<SecondaryButton to="/signals">Back to Signals</SecondaryButton>}
      />
    );
  }

  // ── Signal detail ─────────────────────────────────────────
  if (mode === 'signal' && signal) {
    const siteName = signal.sites?.name ?? 'Unknown site';
    const region = signal.sites?.region ?? '';
    const status = statusConfig[signal.status];
    const reasoning = (signal.reasoning ?? []) as string[];

    return (
      <>
        <PageHeader
          title="Environmental Signal"
          subtitle={signal.title}
          icon={<TrendingUp className="w-5.5 h-5.5" />}
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Signals', to: '/signals' },
            { label: signal.title },
          ]}
          actions={
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-sand-600 hover:text-aqua-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          }
        />

        {/* Signal summary */}
        <div className="surface p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`chip ${status.chip}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                  {status.label}
                </span>
                {signal.is_demo && (
                  <span className="chip bg-sand-100 text-sand-500 border-sand-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-sand-400" aria-hidden="true" />
                    Demo data
                  </span>
                )}
              </div>
              <h2 className="text-xl font-display font-semibold text-sand-900 mb-2">{signal.title}</h2>
              <p className="text-sm text-sand-600 leading-relaxed max-w-2xl">{signal.description}</p>

              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="w-4.5 h-4.5 text-aqua-500" />
                  <div>
                    <p className="text-sand-500 text-xs">Site</p>
                    <p className="text-sand-800 font-medium">{siteName}{region ? `, ${region}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <TrendingUp className="w-4.5 h-4.5 text-aqua-500" />
                  <div>
                    <p className="text-sand-500 text-xs">Evidence Strength</p>
                    <p className="text-sand-800 font-semibold tabular-nums">{signal.strength}/100</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="w-4.5 h-4.5 text-aqua-500" />
                  <div>
                    <p className="text-sand-500 text-xs">Time Window</p>
                    <p className="text-sand-800 font-medium">{signal.time_window_hours} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Database className="w-4.5 h-4.5 text-aqua-500" />
                  <div>
                    <p className="text-sand-500 text-xs">Observations</p>
                    <p className="text-sand-800 font-medium tabular-nums">{signal.observation_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Layers className="w-4.5 h-4.5 text-aqua-500" />
                  <div>
                    <p className="text-sand-500 text-xs">Indicators</p>
                    <p className="text-sand-800 font-medium tabular-nums">{signal.indicator_count}</p>
                  </div>
                </div>
                {signal.last_observed_at && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Clock className="w-4.5 h-4.5 text-aqua-500" />
                    <div>
                      <p className="text-sand-500 text-xs">Last Observed</p>
                      <p className="text-sand-800 font-medium">{formatDateTime(signal.last_observed_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-64 flex-shrink-0">
              <div className="surface-soft p-5">
                <div className="mb-4">
                  <p className="text-xs font-medium text-sand-500 mb-1">Signal Type</p>
                  <p className="text-sm text-sand-800 capitalize">{signal.signal_type.replace(/_/g, ' ')}</p>
                </div>
                <div className="pt-4 border-t border-sand-200">
                  <p className="text-xs font-medium text-sand-500 mb-1">Status</p>
                  <p className="text-sm text-sand-800">{status.label}</p>
                </div>
                {signal.first_observed_at && (
                  <div className="mt-4 pt-4 border-t border-sand-200">
                    <p className="text-xs font-medium text-sand-500 mb-1">First Observed</p>
                    <p className="text-sm text-sand-800">{formatDateTime(signal.first_observed_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Chain */}
        <div className="surface p-6 mb-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Layers className="w-5 h-5 text-aqua-600" />
            <h3 className="text-base font-semibold text-sand-900">Evidence Chain</h3>
          </div>

          {/* Chain visualization */}
          <div className="flex flex-col gap-3 mb-6">
            <ChainStep label="Environmental Signal" value={signal.title} active />
            <ChainArrow />
            <ChainStep label="Supporting Observations" value={`${signal.observation_count} observations`} />
            <ChainArrow />
            <ChainStep label="Repeated Indicators" value={`${signal.indicator_count} indicators detected`} />
            <ChainArrow />
            <ChainStep label="Quality Information" value={qualityChecks.size > 0 ? `${[...qualityChecks.values()].filter(qc => qc && qc.overall_status !== 'ready').length} need clarification` : 'Quality checks pending'} />
          </div>

          {/* Evidence items */}
          {signalEvidence.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-sand-700 mb-3">Evidence Items</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {signalEvidence.map((ev) => (
                  <div key={ev.id} className="surface-soft p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-aqua-500" />
                      <span className="text-xs font-medium text-sand-500 uppercase tracking-wide">{ev.evidence_type.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm font-medium text-sand-800">{ev.label}</p>
                    {ev.value && <p className="text-sm text-sand-600 mt-0.5">{ev.value}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deterministic reasoning */}
        {reasoning.length > 0 && (
          <div className="surface p-6 mb-6">
            <div className="flex items-center gap-2.5 mb-4">
              <FileText className="w-5 h-5 text-aqua-600" />
              <h3 className="text-base font-semibold text-sand-900">Deterministic Evidence Summary</h3>
            </div>
            <ul className="space-y-2.5">
              {reasoning.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-sand-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-aqua-400 flex-shrink-0 mt-1.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-sand-100">
              <p className="text-xs text-sand-400">
                This reasoning was produced by deterministic pattern detection, not AI. It reflects only the structured observation data available.
              </p>
            </div>
          </div>
        )}

        {/* Supporting observations */}
        {signalObs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-aqua-600" />
                <h2 className="text-lg font-semibold text-sand-900">Supporting Observations</h2>
              </div>
              <span className="text-sm text-sand-500">{signalObs.length} linked</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {signalObs.map((so) => (
                <SupportingObservationCard
                  key={so.id}
                  obs={so.observations}
                  contributionType={so.contribution_type}
                  qualityCheck={qualityChecks.get(so.observation_id) ?? null}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notice */}
        <InfoBanner type="info" title="Deterministic pattern — not a scientific prediction">
          This signal was generated by deterministic pattern detection from citizen observations.
          It has not been scientifically validated. An environmental expert should review the evidence before any action is taken.
        </InfoBanner>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/signals">
            <PrimaryButton>All Signals</PrimaryButton>
          </Link>
          <SecondaryButton to="/map">View on Map</SecondaryButton>
        </div>
      </>
    );
  }

  // ── Observation detail (backward compat) ─────────────────
  if (mode === 'observation' && observation) {
    const siteName = observation.sites?.name ?? 'Unknown site';
    const region = observation.sites?.region ?? '';
    const title = observation.water_appearance
      ? `${observation.water_appearance} at ${siteName}`
      : `Observation at ${siteName}`;

    return (
      <>
        <PageHeader
          title="Observation Details"
          subtitle={title}
          icon={<FileText className="w-5.5 h-5.5" />}
          breadcrumbs={[
            { label: 'Home', to: '/' },
            { label: 'Signals', to: '/signals' },
            { label: siteName },
          ]}
          actions={
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-sand-600 hover:text-aqua-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          }
        />

        {/* Observation summary */}
        <div className="surface p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`chip ${observation.is_demo ? 'bg-sand-100 text-sand-500 border-sand-200' : 'bg-aqua-50 text-aqua-700 border-aqua-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${observation.is_demo ? 'bg-sand-400' : 'bg-aqua-500'}`} aria-hidden="true" />
                  {observation.is_demo ? 'Demo data' : 'Citizen report'}
                </span>
                <span className="chip bg-amber-50 text-amber-700 border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                  Awaiting analysis
                </span>
              </div>
              <h2 className="text-xl font-display font-semibold text-sand-900 mb-2">{title}</h2>

              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="w-4.5 h-4.5 text-aqua-500" />
                  <div>
                    <p className="text-sand-500 text-xs">Location</p>
                    <p className="text-sand-800 font-medium">{siteName}{region ? `, ${region}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="w-4.5 h-4.5 text-aqua-500" />
                  <div>
                    <p className="text-sand-500 text-xs">Submitted</p>
                    <p className="text-sand-800 font-medium">{formatDateTime(observation.submitted_at)}</p>
                  </div>
                </div>
                {observation.sites?.latitude && observation.sites?.longitude && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPin className="w-4.5 h-4.5 text-aqua-500" />
                    <div>
                      <p className="text-sand-500 text-xs">Coordinates</p>
                      <p className="text-sand-800 font-mono text-xs">
                        {Number(observation.sites.latitude).toFixed(4)}, {Number(observation.sites.longitude).toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm">
                  <Camera className="w-4.5 h-4.5 text-aqua-500" />
                  <div>
                    <p className="text-sand-500 text-xs">Photographs</p>
                    <p className="text-sand-800 font-medium">{observation.photos.length} photo{observation.photos.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-64 flex-shrink-0">
              <div className="surface-soft p-5">
                <p className="text-xs font-medium text-sand-500 mb-1">Status</p>
                <p className="text-sm text-sand-800">Awaiting analysis</p>
                <div className="mt-4 pt-4 border-t border-sand-200">
                  <p className="text-xs font-medium text-sand-500 mb-1">Source</p>
                  <p className="text-sm text-sand-800 capitalize">{observation.source}</p>
                </div>
                {observation.is_demo && (
                  <div className="mt-4 pt-4 border-t border-sand-200">
                    <p className="text-xs text-sand-400">Prototype demonstration data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Environmental observations */}
        <div className="surface p-6 mb-6">
          <h3 className="text-base font-semibold text-sand-900 mb-4">Environmental Observations</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <ObsField icon={<Droplets className="w-4 h-4" />} label="Water appearance" value={observation.water_appearance} />
            <ObsField icon={<Wind className="w-4 h-4" />} label="Odour" value={observation.odour} />
            <ObsField icon={<Droplets className="w-4 h-4" />} label="Water flow" value={observation.water_flow} />
            <ObsField icon={<Leaf className="w-4 h-4" />} label="Vegetation condition" value={observation.vegetation_condition} />
            <ObsField icon={<AlertCircle className="w-4 h-4" />} label="Visible pollution" value={observation.visible_pollution} />
            <ObsField icon={<Bird className="w-4 h-4" />} label="Wildlife observed" value={observation.wildlife_observed} />
          </div>

          {observation.notes && (
            <div className="mt-4 pt-4 border-t border-sand-100">
              <div className="flex items-start gap-2.5">
                <StickyNote className="w-4 h-4 text-sand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-sand-500 mb-1">Notes</p>
                  <p className="text-sm text-sand-700 italic leading-relaxed">"{observation.notes}"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photos */}
        {observation.photos.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-aqua-600" />
                <h2 className="text-lg font-semibold text-sand-900">Linked Photographs</h2>
              </div>
              <span className="text-sm text-sand-500">{observation.photos.length} photo{observation.photos.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {observation.photos.map((photo) => {
                const url = getPhotoUrl(photo.storage_path);
                const hasError = photoErrors.has(photo.storage_path);
                return (
                  <div key={photo.id} className="surface p-3 overflow-hidden">
                    <div className="rounded-lg overflow-hidden bg-sand-100 aspect-video flex items-center justify-center">
                      {hasError ? (
                        <div className="flex flex-col items-center text-sand-400">
                          <ImageOff className="w-8 h-8 mb-1" />
                          <span className="text-xs">Image unavailable</span>
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt="Observation evidence"
                          className="w-full h-full object-cover"
                          onError={() => handlePhotoError(photo.storage_path)}
                        />
                      )}
                    </div>
                    <p className="text-xs text-sand-400 mt-2 font-mono truncate">{photo.storage_path.split('/').pop()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related observations at same site */}
        {relatedObs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-aqua-600" />
                <h2 className="text-lg font-semibold text-sand-900">Other Observations at This Site</h2>
              </div>
              <span className="text-sm text-sand-500">{relatedObs.length} observations</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedObs.map((obs) => (
                <Link
                  key={obs.id}
                  to={`/signals/${obs.id}`}
                  className="block surface p-4 hover:shadow-card hover:border-aqua-200 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-sand-700 group-hover:text-aqua-800 transition-colors">
                      {obs.water_appearance ?? 'Observation'}
                    </span>
                    <span className="text-xs text-sand-400">{formatTime(obs.submitted_at)}</span>
                  </div>
                  <p className="text-xs text-sand-500 line-clamp-2">
                    {obs.notes || `${obs.odour ?? ''} ${obs.water_flow ?? ''} ${obs.vegetation_condition ?? ''}`.trim() || 'No additional details'}
                  </p>
                  {obs.is_demo && (
                    <span className="inline-block mt-2 text-xs text-sand-400">Demo data</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Responsible notice */}
        <InfoBanner type="info" title="Citizen observation — awaiting analysis">
          This is a citizen-submitted observation. It has not been scientifically validated or AI-analysed yet.
          An environmental expert should review the evidence before any action is taken.
        </InfoBanner>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/signals">
            <PrimaryButton>All Observations</PrimaryButton>
          </Link>
          <SecondaryButton to="/map">View on Map</SecondaryButton>
        </div>
      </>
    );
  }

  return null;
}

// ── Signal sub-components ─────────────────────────────────

function ChainStep({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${active ? 'border-aqua-200 bg-aqua-50' : 'border-sand-200 bg-white'}`}>
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-aqua-500' : 'bg-sand-300'}`} />
      <div className="flex-1">
        <p className="text-xs font-medium text-sand-500">{label}</p>
        <p className="text-sm text-sand-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

function ChainArrow() {
  return (
    <div className="flex justify-center">
      <ChevronDown className="w-4 h-4 text-sand-300" />
    </div>
  );
}

function SupportingObservationCard({
  obs,
  contributionType,
  qualityCheck,
}: {
  obs: import('@/types').ObservationRow;
  contributionType: string | null;
  qualityCheck: ObservationQualityCheckRow | null;
}) {
  const contributionLabel = contributionType
    ? contributionType.charAt(0).toUpperCase() + contributionType.slice(1)
    : 'Contributing';

  return (
    <Link
      to={`/signals/${obs.id}`}
      className="block surface p-4 hover:shadow-card hover:border-aqua-200 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-sand-700 group-hover:text-aqua-800 transition-colors">
          {obs.water_appearance ?? 'Observation'}
        </span>
        <span className="text-xs text-sand-400">{formatTime(obs.submitted_at)}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="chip bg-aqua-50 text-aqua-700 border-aqua-200 text-xs">
          {contributionLabel}
        </span>
        {qualityCheck && (
          <span className={`chip text-xs ${qualityCheck.overall_status === 'ready' ? 'bg-success-50 text-success-700 border-success-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {qualityCheck.overall_status.replace(/_/g, ' ')}
          </span>
        )}
        {obs.is_demo && (
          <span className="chip bg-sand-100 text-sand-500 border-sand-200 text-xs">Demo</span>
        )}
      </div>

      <p className="text-xs text-sand-500 line-clamp-2">
        {obs.notes || `${obs.odour ?? ''} ${obs.water_flow ?? ''} ${obs.vegetation_condition ?? ''}`.trim() || 'No additional details'}
      </p>

      {(obs.water_appearance || obs.visible_pollution || obs.odour) && (
        <div className="mt-2 pt-2 border-t border-sand-100 flex flex-wrap gap-2 text-xs text-sand-500">
          {obs.water_appearance && <span>{obs.water_appearance}</span>}
          {obs.visible_pollution && !obs.visible_pollution.toLowerCase().includes('none') && <span>· {obs.visible_pollution}</span>}
          {obs.odour && !obs.odour.toLowerCase().includes('none') && <span>· {obs.odour}</span>}
        </div>
      )}
    </Link>
  );
}

function ObsField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-aqua-50 text-aqua-600 border border-aqua-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-sand-500">{label}</p>
        <p className="text-sm text-sand-800 mt-0.5">{value || 'Not recorded'}</p>
      </div>
    </div>
  );
}
