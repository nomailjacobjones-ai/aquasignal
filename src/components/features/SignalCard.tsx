import type { EnvironmentalSignal } from '@/types';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Camera, ArrowRight } from 'lucide-react';
import { ConcernBadge, StatusBadge } from '@/components/ui/Badges';
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter';

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

interface SignalCardProps {
  signal: EnvironmentalSignal;
}

export function SignalCard({ signal }: SignalCardProps) {
  return (
    <Link
      to={`/signals/${signal.id}`}
      className="block surface p-5 hover:shadow-card hover:border-aqua-200 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-sand-500 mb-1">
            <MapPin className="w-4 h-4 text-aqua-500 flex-shrink-0" />
            <span className="font-medium text-sand-700 truncate">{signal.siteName}</span>
            <span className="text-sand-300">·</span>
            <span className="text-sand-400 truncate">{signal.region}</span>
          </div>
          <h3 className="text-base font-semibold text-sand-900 group-hover:text-aqua-800 transition-colors">
            {signal.title}
          </h3>
        </div>
        <ArrowRight className="w-5 h-5 text-sand-300 group-hover:text-aqua-500 transition-colors flex-shrink-0" />
      </div>

      <p className="text-sm text-sand-600 leading-relaxed mb-4 line-clamp-2">{signal.description}</p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ConcernBadge level={signal.concern} />
        <StatusBadge status={signal.status} />
      </div>

      <ConfidenceMeter value={signal.confidence} size="sm" />

      <div className="mt-4 pt-4 border-t border-sand-100 flex items-center gap-4 text-xs text-sand-500">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {signal.observationCount} obs
        </span>
        {signal.photoCount > 0 && (
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            {signal.photoCount} photos
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(signal.lastObserved)}
        </span>
      </div>
    </Link>
  );
}
