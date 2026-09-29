import type { Observation } from '@/types';
import { Camera, MapPin, Clock, User } from 'lucide-react';

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date('2026-09-26T10:00:00Z');
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

interface ObservationCardProps {
  observation: Observation;
  compact?: boolean;
}

export function ObservationCard({ observation: obs, compact = false }: ObservationCardProps) {
  return (
    <article className="surface p-5 hover:shadow-card transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-sand-500">
          <MapPin className="w-4 h-4 text-aqua-500" />
          <span className="font-medium text-sand-700">{obs.siteName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-sand-400">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(obs.timestamp)}
        </div>
      </div>

      {!compact && (
        <div className="flex items-center gap-2 text-xs text-sand-500 mb-3">
          <User className="w-3.5 h-3.5" />
          <span>Observer: {obs.observer}</span>
        </div>
      )}

      <dl className="space-y-2.5">
        <div className="flex items-start gap-2">
          <dt className="text-xs font-medium text-sand-500 w-28 flex-shrink-0">Water appearance</dt>
          <dd className="text-sm text-sand-800">{obs.waterAppearance}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="text-xs font-medium text-sand-500 w-28 flex-shrink-0">Odour</dt>
          <dd className="text-sm text-sand-800">{obs.odour}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="text-xs font-medium text-sand-500 w-28 flex-shrink-0">Water flow</dt>
          <dd className="text-sm text-sand-800">{obs.waterFlow}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="text-xs font-medium text-sand-500 w-28 flex-shrink-0">Visible pollution</dt>
          <dd className="text-sm text-sand-800">{obs.visiblePollution}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="text-xs font-medium text-sand-500 w-28 flex-shrink-0">Vegetation</dt>
          <dd className="text-sm text-sand-800">{obs.vegetationCondition}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="text-xs font-medium text-sand-500 w-28 flex-shrink-0">Wildlife</dt>
          <dd className="text-sm text-sand-800">{obs.wildlifeObserved}</dd>
        </div>
      </dl>

      {obs.notes && !compact && (
        <div className="mt-3 pt-3 border-t border-sand-100">
          <p className="text-sm text-sand-600 italic leading-relaxed">"{obs.notes}"</p>
        </div>
      )}

      {obs.hasPhoto && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-aqua-700">
          <Camera className="w-4 h-4" />
          <span>{obs.photoCount} photo{obs.photoCount > 1 ? 's' : ''} attached</span>
        </div>
      )}
    </article>
  );
}
