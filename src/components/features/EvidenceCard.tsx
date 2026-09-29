import type { EvidenceItem } from '@/types';
import { Camera, Clock, Users, MapPin, FileCheck, Brain, CheckCircle2, AlertCircle, Clock3 } from 'lucide-react';

const typeIcons: Record<EvidenceItem['type'], typeof Camera> = {
  citizen_observation: Users,
  photograph: Camera,
  timestamp: Clock,
  nearby_observation: MapPin,
  data_completeness: FileCheck,
  ai_validation: Brain,
};

const statusConfig: Record<EvidenceItem['status'], { icon: typeof CheckCircle2; classes: string; label: string }> = {
  verified: { icon: CheckCircle2, classes: 'text-success-600 bg-success-50', label: 'Verified' },
  pending: { icon: Clock3, classes: 'text-amber-600 bg-amber-50', label: 'Pending' },
  flagged: { icon: AlertCircle, classes: 'text-error-600 bg-error-50', label: 'Flagged' },
};

export function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  const Icon = typeIcons[evidence.type];
  const StatusIcon = statusConfig[evidence.status].icon;
  const status = statusConfig[evidence.status];

  return (
    <div className="surface p-4 hover:shadow-soft transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-sand-900">{evidence.label}</h4>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.classes}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-sand-600 leading-relaxed">{evidence.description}</p>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-sand-200 rounded-full overflow-hidden">
              <div className="h-full bg-aqua-500 rounded-full" style={{ width: `${evidence.weight}%` }} />
            </div>
            <span className="text-xs text-sand-400 font-medium tabular-nums">+{evidence.weight}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
