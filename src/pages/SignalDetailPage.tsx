import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Camera, AlertCircle, ClipboardCheck,
  FileText, Droplets, Wind, Leaf, Bird, StickyNote, ImageOff,
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

export function SignalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [observation, setObservation] = useState<ObservationWithPhotos | null>(null);
  const [relatedObs, setRelatedObs] = useState<ObservationWithSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [photoErrors, setPhotoErrors] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const obs = await fetchObservationById(id);
      if (!obs) {
        setObservation(null);
        setLoading(false);
        return;
      }
      setObservation(obs);

      if (obs.site_id) {
        const related = await fetchObservationsBySite(obs.site_id, 6);
        setRelatedObs(related.filter((o) => o.id !== obs.id));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handlePhotoError = (path: string) => {
    setPhotoErrors((prev) => new Set(prev).add(path));
  };

  if (loading) {
    return (
      <LoadingState message="Loading observation…" />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="We could not load this observation. Please check your connection and try again."
        onRetry={load}
      />
    );
  }

  if (!observation) {
    return (
      <EmptyState
        title="Observation not found"
        message="This observation may have been removed or the ID is incorrect."
        icon={<AlertCircle className="w-8 h-8" />}
        action={<SecondaryButton to="/signals">Back to Observations</SecondaryButton>}
      />
    );
  }

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
