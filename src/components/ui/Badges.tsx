import type { ConcernLevel, SignalStatus } from '@/types';

const concernConfig: Record<ConcernLevel, { label: string; classes: string; dot: string }> = {
  low: {
    label: 'Low concern',
    classes: 'bg-aqua-50 text-aqua-700 border-aqua-200',
    dot: 'bg-aqua-500',
  },
  medium: {
    label: 'Medium concern',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High concern',
    classes: 'bg-error-50 text-error-700 border-error-200',
    dot: 'bg-error-500',
  },
  positive: {
    label: 'Positive trend',
    classes: 'bg-success-50 text-success-700 border-success-200',
    dot: 'bg-success-500',
  },
};

export function ConcernBadge({ level, className = '' }: { level: ConcernLevel; className?: string }) {
  const config = concernConfig[level];
  return (
    <span className={`chip ${config.classes} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

const statusConfig: Record<SignalStatus, { label: string; classes: string; dot: string }> = {
  active: {
    label: 'Active',
    classes: 'bg-aqua-50 text-aqua-700 border-aqua-200',
    dot: 'bg-aqua-500',
  },
  awaiting_review: {
    label: 'Awaiting review',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  under_review: {
    label: 'Under review',
    classes: 'bg-aqua-50 text-aqua-700 border-aqua-200',
    dot: 'bg-aqua-400',
  },
  action_required: {
    label: 'Action required',
    classes: 'bg-error-50 text-error-700 border-error-200',
    dot: 'bg-error-500',
  },
  reviewed: {
    label: 'Reviewed',
    classes: 'bg-success-50 text-success-700 border-success-200',
    dot: 'bg-success-500',
  },
  dismissed: {
    label: 'Dismissed',
    classes: 'bg-sand-100 text-sand-500 border-sand-200',
    dot: 'bg-sand-400',
  },
};

export function StatusBadge({ status, className = '' }: { status: SignalStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={`chip ${config.classes} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${status === 'active' ? 'animate-pulse-soft' : ''}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export { concernConfig, statusConfig };
