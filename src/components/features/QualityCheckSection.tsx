import { Loader2, CheckCircle2, AlertCircle, Info, Brain, ArrowLeft, ArrowRight } from 'lucide-react';
import type { QualityGateResult } from '@/types';
import { ConfidenceMeter } from '@/components/ui/ConfidenceMeter';
import { InfoBanner } from '@/components/ui/InfoBanner';

interface QualityCheckSectionProps {
  state: 'idle' | 'checking' | 'done' | 'unavailable';
  result: QualityGateResult | null;
  onRecheck: () => void;
  onUpdate: () => void;
  onContinueAnyway: () => void;
}

const statusConfig = {
  ready: {
    icon: CheckCircle2,
    title: 'Observation ready',
    bannerClass: 'bg-success-50 border-success-200 text-success-800',
    iconClass: 'text-success-600',
  },
  needs_clarification: {
    icon: AlertCircle,
    title: 'A few details need confirmation',
    bannerClass: 'bg-amber-50 border-amber-200 text-amber-800',
    iconClass: 'text-amber-600',
  },
  insufficient_information: {
    icon: Info,
    title: 'More information recommended',
    bannerClass: 'bg-aqua-50 border-aqua-200 text-aqua-800',
    iconClass: 'text-aqua-600',
  },
} as const;

export function QualityCheckSection({ state, result, onRecheck, onUpdate, onContinueAnyway }: QualityCheckSectionProps) {
  if (state === 'idle') {
    return (
      <div className="surface-soft p-5 border-l-4 border-l-aqua-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-sand-900">Observation Quality Check</h3>
            <p className="text-sm text-sand-500 mt-0.5">
              Run an AI-assisted quality check to look for missing information, contradictions, or areas that might benefit from clarification.
            </p>
            <button
              onClick={onRecheck}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-aqua-700 text-white rounded-lg hover:bg-aqua-800 transition-colors"
            >
              <Brain className="w-4 h-4" />
              Run Quality Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'checking') {
    return (
      <div className="surface-soft p-5 border-l-4 border-l-aqua-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center flex-shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-sand-900">Checking observation…</h3>
            <p className="text-sm text-sand-500 mt-0.5">
              The AI quality gate is reviewing your observation for completeness and consistency.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'unavailable') {
    return (
      <div className="surface-soft p-5 border-l-4 border-l-sand-300">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sand-100 text-sand-500 border border-sand-200 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-sand-900">Quality check unavailable</h3>
            <p className="text-sm text-sand-500 mt-0.5">
              Your observation can still be submitted. An AI quality check was not available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const config = statusConfig[result.overall_status];
  const StatusIcon = config.icon;

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bannerClass}`}>
        <div className="flex-shrink-0 mt-0.5">
          <StatusIcon className={`w-5 h-5 ${config.iconClass}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{config.title}</h3>
          <p className="text-sm mt-0.5 opacity-90">{result.explanation}</p>
        </div>
      </div>

      {/* Completeness */}
      <div className="surface-soft p-4">
        <ConfidenceMeter value={result.completeness} label="Completeness" size="md" />
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-2">
            Detected issues
          </h4>
          <div className="space-y-2">
            {result.issues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-sand-200">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  issue.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-aqua-100 text-aqua-600'
                }`}>
                  {issue.severity === 'warning' ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : (
                    <Info className="w-3 h-3" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-sand-700">{issue.field}</p>
                  <p className="text-sm text-sand-600 mt-0.5">{issue.issue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clarification questions */}
      {result.clarification_questions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-2">
            Clarification questions
          </h4>
          <div className="space-y-2">
            {result.clarification_questions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-700">{q.field}</p>
                  <p className="text-sm text-sand-700 mt-0.5">{q.question}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence observations */}
      {result.evidence_observations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-sand-500 uppercase tracking-wide mb-2">
            Evidence observations
          </h4>
          <div className="space-y-2">
            {result.evidence_observations.map((ev, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-success-50 border border-success-200">
                <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-sand-800">{ev.observation}</p>
                  <p className="text-xs text-sand-500 mt-0.5">{ev.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI disclaimer */}
      <InfoBanner type="info">
        <span className="flex items-center gap-1.5">
          <Brain className="w-4 h-4" />
          AI assists with data quality and consistency checks. The citizen observation remains the source of truth. Environmental experts make final decisions.
        </span>
      </InfoBanner>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={onUpdate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-white text-aqua-800 border border-aqua-200 rounded-xl hover:bg-aqua-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Update Observation
        </button>
        <button
          onClick={onRecheck}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-white text-sand-600 border border-sand-300 rounded-xl hover:bg-sand-50 transition-colors"
        >
          <Brain className="w-4 h-4" />
          Re-run Check
        </button>
        {result.overall_status !== 'ready' && (
          <button
            onClick={onContinueAnyway}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-aqua-700 text-white rounded-xl hover:bg-aqua-800 transition-colors"
          >
            Continue Anyway
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
