import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, ArrowRight, ArrowLeft, RotateCcw, Eye, Brain, Link2,
  ClipboardCheck, MapPin, Camera, Heart, Share, Sparkles,
  CheckCircle2, AlertTriangle, Download, FileJson, Table,
  TrendingUp, Layers, Database, Leaf, Fish, Users, RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { InfoBanner } from '@/components/ui/InfoBanner';
import { LoadingState, ErrorState } from '@/components/ui/States';
import {
  fetchSignalById,
  fetchSignalObservationsWithDetails,
  getSignalEvidence,
  type EnvironmentalSignalWithSite,
  type SignalObservationWithDetails,
} from '@/lib/evidenceService';
import { getObservationQualityCheck } from '@/lib/evidenceService';
import { getSignalExplanation } from '@/lib/aiExplanationService';
import { getOrGenerateOneHealthContext } from '@/lib/oneHealthService';
import { getSignalReview } from '@/lib/reviewService';
import type {
  SignalEvidenceRow,
  ObservationQualityCheckRow,
  SignalAIExplanation,
  SignalOneHealthContext,
  SignalReviewRow,
} from '@/types';

const RIVERSIDE_SIGNAL_ID = 'b171a780-aa39-42dc-bbfb-a9be95303adb';

const STEPS = [
  { label: 'Observation', icon: Eye },
  { label: 'Quality', icon: Brain },
  { label: 'Pattern', icon: TrendingUp },
  { label: 'Evidence', icon: Layers },
  { label: 'AI Brief', icon: Sparkles },
  { label: 'One Health', icon: Heart },
  { label: 'Review', icon: ClipboardCheck },
  { label: 'Export', icon: Share },
] as const;

type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface DemoData {
  signal: EnvironmentalSignalWithSite;
  observations: SignalObservationWithDetails[];
  evidence: SignalEvidenceRow[];
  qualityChecks: Map<string, ObservationQualityCheckRow | null>;
  aiExplanation: SignalAIExplanation | null;
  oneHealth: SignalOneHealthContext | null;
  review: SignalReviewRow | null;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function humanize(value: string | null): string {
  if (!value) return 'Not recorded';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DemoPage() {
  const [step, setStep] = useState<StepIndex | null>(null);
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadDemoData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const sig = await fetchSignalById(RIVERSIDE_SIGNAL_ID);
      if (!sig) throw new Error('Signal not found');

      const [obs, evidence] = await Promise.all([
        fetchSignalObservationsWithDetails(RIVERSIDE_SIGNAL_ID),
        getSignalEvidence(RIVERSIDE_SIGNAL_ID),
      ]);

      const qChecks = new Map<string, ObservationQualityCheckRow | null>();
      for (const so of obs) {
        try {
          const qc = await getObservationQualityCheck(so.observation_id);
          qChecks.set(so.observation_id, qc);
        } catch {
          qChecks.set(so.observation_id, null);
        }
      }

      let aiExplanation: SignalAIExplanation | null = null;
      try {
        aiExplanation = await getSignalExplanation(RIVERSIDE_SIGNAL_ID);
      } catch { /* null is fine */ }

      let oneHealth: SignalOneHealthContext | null = null;
      try {
        oneHealth = await getOrGenerateOneHealthContext(sig, evidence);
      } catch { /* null is fine */ }

      let review: SignalReviewRow | null = null;
      try {
        review = await getSignalReview(RIVERSIDE_SIGNAL_ID);
      } catch { /* null is fine */ }

      setData({ signal: sig, observations: obs, evidence, qualityChecks: qChecks, aiExplanation, oneHealth, review });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const startDemo = () => {
    if (!data) {
      loadDemoData();
    }
    setStep(0);
  };

  const restart = () => {
    setStep(null);
  };

  // ── Landing screen ──────────────────────────────────────
  if (step === null) {
    return (
      <>
        <PageHeader
          title="AquaSignal Demo"
          subtitle="Follow one freshwater event from citizen observation to human decision."
          icon={<Play className="w-5.5 h-5.5" />}
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Demo' }]}
        />

        {error && (
          <ErrorState
            message="We could not load the demo data. Please try again."
            onRetry={loadDemoData}
          />
        )}

        <div className="surface p-8 sm:p-12 text-center bg-gradient-to-b from-aqua-50/50 to-white mb-8">
          <div className="w-16 h-16 rounded-2xl bg-aqua-700 text-white flex items-center justify-center mx-auto mb-5">
            <Play className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-sand-900 text-balance">
            Follow a freshwater event from start to finish
          </h2>
          <p className="mt-3 text-sand-600 max-w-xl mx-auto leading-relaxed">
            This demonstration uses prototype data to show how AquaSignal connects observations, evidence, AI explanation, One Health context and human review.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={startDemo}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium bg-aqua-700 text-white rounded-xl hover:bg-aqua-800 transition-colors shadow-soft disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading demo data…
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Guided Demo
                </>
              )}
            </button>
            <Link
              to="/signals"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium text-aqua-700 bg-white border border-aqua-200 rounded-xl hover:bg-aqua-50 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Explore the App
            </Link>
          </div>
        </div>

        {/* Progress indicator preview */}
        <div className="surface p-5 mb-8">
          <p className="text-xs font-medium text-sand-500 mb-3">Demo journey — 8 steps</p>
          <div className="flex flex-wrap gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sand-50 border border-sand-100">
                  <span className="text-xs font-medium text-aqua-600 tabular-nums">{i + 1}</span>
                  <Icon className="w-3.5 h-3.5 text-sand-400" />
                  <span className="text-xs font-medium text-sand-600">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <InfoBanner type="info" title="Prototype demonstration">
          This demo uses seeded prototype data at Riverside Site A. It does not represent a verified real pollution event, laboratory measurements, or disease risk.
        </InfoBanner>
      </>
    );
  }

  if (loading && !data) return <LoadingState message="Loading demo data…" />;
  if (error && !data) return <ErrorState message="We could not load the demo data." onRetry={loadDemoData} />;
  if (!data) return <LoadingState message="Loading…" />;

  // ── Guided steps ────────────────────────────────────────
  const isFirst = step === 0;
  const isLast = step === 7;

  return (
    <>
      <PageHeader
        title="AquaSignal Demo"
        subtitle="Follow one freshwater event from citizen observation to human decision."
        icon={<Play className="w-5.5 h-5.5" />}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Demo' }]}
      />

      {/* Progress indicator */}
      <div className="surface p-4 mb-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button
                key={s.label}
                onClick={() => setStep(i as StepIndex)}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-aqua-700 text-white border-aqua-700'
                    : isDone
                    ? 'bg-aqua-50 text-aqua-700 border-aqua-200'
                    : 'bg-sand-50 text-sand-400 border-sand-100'
                }`}
                aria-label={`Step ${i + 1}: ${s.label}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className={`text-xs font-medium tabular-nums ${isActive ? 'text-white' : isDone ? 'text-aqua-600' : 'text-sand-400'}`}>{i + 1}</span>
                <Icon className="w-3.5 h-3.5" />
                <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-white' : isDone ? 'text-aqua-700' : 'text-sand-500'}`}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <DemoStep
        step={step}
        data={data}
      />

      {/* Controls */}
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        {!isFirst && (
          <button
            onClick={() => setStep((step - 1) as StepIndex)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-sand-700 bg-white border border-sand-300 rounded-xl hover:bg-sand-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        {!isLast ? (
          <button
            onClick={() => setStep((step + 1) as StepIndex)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-aqua-700 rounded-xl hover:bg-aqua-800 transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            to={`/signals/${RIVERSIDE_SIGNAL_ID}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-aqua-700 rounded-xl hover:bg-aqua-800 transition-colors"
          >
            View Full Signal
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        <button
          onClick={restart}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-sand-500 hover:text-sand-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Restart Demo
        </button>
      </div>
    </>
  );
}

// ── Step renderer ──────────────────────────────────────────

function DemoStep({ step, data }: { step: StepIndex; data: DemoData }) {
  switch (step) {
    case 0: return <StepObservation data={data} />;
    case 1: return <StepQuality data={data} />;
    case 2: return <StepPattern data={data} />;
    case 3: return <StepEvidence data={data} />;
    case 4: return <StepAIBrief data={data} />;
    case 5: return <StepOneHealth data={data} />;
    case 6: return <StepReview data={data} />;
    case 7: return <StepExport data={data} />;
  }
}

// ── Step 1: Citizen Observation ────────────────────────────

function StepObservation({ data }: { data: DemoData }) {
  const firstObs = data.observations[0]?.observations;
  const site = data.signal.sites;
  return (
    <div className="surface p-6">
      <DemoStepHeader icon={Eye} step="1" title="Citizen Observation" subtitle="What a community member reports at Riverside Site A" />
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <div className="surface-soft p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-aqua-500" />
              <span className="text-sm font-semibold text-sand-900">{site?.name ?? 'Riverside Site A'}</span>
              <span className="chip bg-sand-100 text-sand-500 border-sand-200 text-xs">Prototype data</span>
            </div>
            {firstObs && (
              <div className="space-y-2.5 text-sm">
                <ObsRow label="Water appearance" value={humanize(firstObs.water_appearance)} />
                <ObsRow label="Odour" value={humanize(firstObs.odour)} />
                <ObsRow label="Water flow" value={humanize(firstObs.water_flow)} />
                <ObsRow label="Visible pollution" value={humanize(firstObs.visible_pollution)} />
                <ObsRow label="Vegetation" value={humanize(firstObs.vegetation_condition)} />
                <ObsRow label="Wildlife" value={humanize(firstObs.wildlife_observed)} />
              </div>
            )}
            {firstObs?.notes && (
              <div className="mt-4 pt-4 border-t border-sand-200">
                <p className="text-xs font-medium text-sand-500 mb-1">Observer notes</p>
                <p className="text-sm text-sand-700 italic">"{firstObs.notes}"</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm text-sand-600 leading-relaxed mb-4">
            A community member visits Riverside Site A and notices discoloured water, a faint chemical odour, and an oily sheen near the drainage pipe outlet. They submit an observation through AquaSignal with structured fields and a written note.
          </p>
          <p className="text-sm text-sand-600 leading-relaxed">
            This is the starting point of every AquaSignal journey — a citizen report. No laboratory measurement, no clinical claim. Just what someone observed.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Quality Check ──────────────────────────────────

function StepQuality({ data }: { data: DemoData }) {
  const firstObsId = data.observations[0]?.observation_id;
  const qc = firstObsId ? data.qualityChecks.get(firstObsId) : null;
  const incompleteCount = Array.from(data.qualityChecks.values()).filter((q) => q && q.overall_status !== 'ready').length;

  return (
    <div className="surface p-6">
      <DemoStepHeader icon={Brain} step="2" title="Quality Check" subtitle="AquaSignal checks completeness and inconsistencies before treating observations as stronger evidence" />
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="surface-soft p-5">
          <p className="text-xs font-medium text-sand-500 mb-3">Quality gate result</p>
          {qc ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`chip text-xs ${qc.overall_status === 'ready' ? 'bg-success-50 text-success-700 border-success-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {qc.overall_status.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-semibold text-sand-800 tabular-nums">{qc.completeness}% complete</span>
              </div>
              {qc.explanation && <p className="text-sm text-sand-600 leading-relaxed">{qc.explanation}</p>}
              {qc.issues.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-sand-500 mb-1.5">Issues</p>
                  <ul className="space-y-1">
                    {qc.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-sand-600">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{issue.field}: {issue.issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-sand-500">Quality check data not available for this observation.</p>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm text-sand-600 leading-relaxed mb-4">
            Before AquaSignal treats an observation as strong evidence, it checks whether the report has enough structured fields filled in and whether the values are internally consistent.
          </p>
          <div className="surface-soft p-4">
            <p className="text-xs font-medium text-sand-500 mb-2">Across all {data.observations.length} observations</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-500" />
              <span className="text-sm text-sand-700">{data.observations.length - incompleteCount} ready</span>
              {incompleteCount > 0 && (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500 ml-3" />
                  <span className="text-sm text-sand-700">{incompleteCount} need clarification</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Corroborating Observations / Pattern ───────────

function StepPattern({ data }: { data: DemoData }) {
  const sig = data.signal;
  return (
    <div className="surface p-6">
      <DemoStepHeader icon={TrendingUp} step="3" title="Emerging Observation Pattern" subtitle="Multiple observations at the same site within a 48-hour window" />
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <div className="surface-soft p-5 mb-4">
            <p className="text-xs font-medium text-sand-500 mb-3">Observations at Riverside Site A</p>
            <div className="space-y-2">
              {data.observations.map((so, i) => (
                <div key={so.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-sand-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-aqua-50 text-aqua-700 text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                    <span className="text-xs text-sand-700">{formatDateTime(so.observations.submitted_at)}</span>
                  </div>
                  <span className="text-xs text-sand-500">{humanize(so.observations.water_appearance)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="surface-soft p-5">
            <h4 className="text-base font-semibold text-sand-900 mb-1">{sig.title}</h4>
            <p className="text-sm text-sand-600 leading-relaxed mb-4">{sig.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <MetricBox icon={TrendingUp} label="Evidence Strength" value={`${sig.strength}/100`} />
              <MetricBox icon={Eye} label="Observations" value={String(sig.observation_count)} />
              <MetricBox icon={Layers} label="Indicators" value={String(sig.indicator_count)} />
              <MetricBox icon={Database} label="Time Window" value={`${sig.time_window_hours}h`} />
            </div>
            <div className="mt-4">
              <span className="chip bg-amber-50 text-amber-700 border-amber-200 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                {sig.status}
              </span>
              <span className="chip bg-sand-100 text-sand-500 border-sand-200 text-xs ml-2">Prototype data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Evidence Chain ─────────────────────────────────

function StepEvidence({ data }: { data: DemoData }) {
  return (
    <div className="surface p-6">
      <DemoStepHeader icon={Layers} step="4" title="Evidence Chain" subtitle="Every derived pattern can be traced to its underlying observations" />
      <div className="mt-6">
        <div className="flex flex-col gap-2 max-w-md mx-auto">
          <ChainRow icon={TrendingUp} label="Environmental Signal" value={data.signal.title} active />
          <ChainArrow />
          <ChainRow icon={Eye} label="Source Observations" value={`${data.observations.length} citizen reports`} />
          <ChainArrow />
          <ChainRow icon={Layers} label="Indicators Detected" value={`${data.signal.indicator_count} recurring indicators`} />
          <ChainArrow />
          <ChainRow icon={Brain} label="Quality Checks" value={`${data.observations.length} checked`} />
        </div>

        <div className="mt-6 surface-soft p-5">
          <p className="text-xs font-medium text-sand-500 mb-3">Evidence items ({data.evidence.length})</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {data.evidence.map((e) => (
              <div key={e.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-sand-100">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${e.evidence_type === 'indicator' ? 'bg-aqua-500' : e.evidence_type === 'quality_check' ? 'bg-amber-500' : 'bg-sand-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sand-700 truncate">{e.label}</p>
                  <p className="text-xs text-sand-400">{e.value ?? '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-sand-600 leading-relaxed text-center">
          Each piece of evidence is traceable back to the citizen observations that produced it. Nothing is hidden.
        </p>
      </div>
    </div>
  );
}

// ── Step 5: AI Evidence Brief ──────────────────────────────

function StepAIBrief({ data }: { data: DemoData }) {
  const ai = data.aiExplanation;
  return (
    <div className="surface p-6">
      <DemoStepHeader icon={Sparkles} step="5" title="AI Evidence Brief" subtitle="An AI-assisted explanation of the evidence — or a deterministic fallback" />
      <div className="mt-6">
        {ai ? (
          <div className="surface-soft p-5">
            <div className="mb-3">
              {ai.is_fallback ? (
                <span className="chip bg-sand-100 text-sand-600 border-sand-200 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-sand-400" aria-hidden="true" />
                  Deterministic evidence summary
                </span>
              ) : (
                <span className="chip bg-aqua-50 text-aqua-700 border-aqua-200 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-aqua-500" aria-hidden="true" />
                  AI-assisted explanation
                </span>
              )}
            </div>
            <p className="text-sm text-sand-700 leading-relaxed mb-4">{ai.summary}</p>
            {ai.supporting_evidence.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-sand-600 mb-1.5">Supporting Evidence</p>
                <ul className="space-y-1">
                  {ai.supporting_evidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-sand-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-aqua-400 flex-shrink-0 mt-0.5" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ai.uncertainties.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-sand-600 mb-1.5">Uncertainty</p>
                <ul className="space-y-1">
                  {ai.uncertainties.map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-sand-600">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-sand-400 pt-3 border-t border-sand-100">{ai.disclaimer}</p>
          </div>
        ) : (
          <div className="surface-soft p-5">
            <p className="text-sm text-sand-500">
              No AI explanation has been generated yet for this signal. You can generate one on the full signal detail page.
            </p>
            <Link
              to={`/signals/${RIVERSIDE_SIGNAL_ID}`}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-aqua-700 rounded-lg hover:bg-aqua-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate on Signal Detail
            </Link>
          </div>
        )}
        <p className="mt-4 text-xs text-sand-400 leading-relaxed">
          AI assists with explanation of existing evidence. It does not replace environmental expertise or establish causation. A deterministic fallback is used when live AI is unavailable — it is never labelled as AI-generated.
        </p>
      </div>
    </div>
  );
}

// ── Step 6: One Health Context ─────────────────────────────

function StepOneHealth({ data }: { data: DemoData }) {
  const ctx = data.oneHealth;
  return (
    <div className="surface p-6">
      <DemoStepHeader icon={Heart} step="6" title="One Health Context" subtitle="Why this pattern may matter from a One Health perspective" />
      <div className="mt-6">
        {ctx ? (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <ContextCard icon={Leaf} label="Ecosystem" text={ctx.ecosystem_context} />
              <ContextCard icon={Fish} label="Biodiversity & Animals" text={ctx.biodiversity_context} />
              <ContextCard icon={Users} label="Human Wellbeing" text={ctx.human_wellbeing_context} />
            </div>
            {ctx.context_notes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-sand-100">
                <p className="text-xs font-medium text-sand-500 mb-2">Context Notes</p>
                <ul className="space-y-1.5">
                  {ctx.context_notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-sand-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-sand-300 flex-shrink-0 mt-1.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-sand-100">
              <p className="text-xs text-sand-400 leading-relaxed">{ctx.disclaimer}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-sand-500">One Health context is not available for this signal.</p>
        )}
      </div>
    </div>
  );
}

// ── Step 7: Human Review ───────────────────────────────────

function StepReview({ data }: { data: DemoData }) {
  const review = data.review;
  return (
    <div className="surface p-6">
      <DemoStepHeader icon={ClipboardCheck} step="7" title="Human Review" subtitle="An environmental expert reviews the evidence and makes a decision" />
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="surface-soft p-5">
          <p className="text-xs font-medium text-sand-500 mb-3">Review status</p>
          {review ? (
            <div className="space-y-3">
              <span className="chip bg-aqua-50 text-aqua-700 border-aqua-200 text-xs">
                {review.decision.replace(/_/g, ' ')}
              </span>
              <p className="text-xs text-sand-400">Reviewed {formatDateTime(review.reviewed_at)}</p>
              {review.notes && (
                <div className="p-3 rounded-lg bg-white border border-sand-100">
                  <p className="text-xs font-medium text-sand-500 mb-1">Reviewer notes</p>
                  <p className="text-sm text-sand-700 italic">"{review.notes}"</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="chip bg-amber-50 text-amber-700 border-amber-200 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                Awaiting Human Review
              </span>
              <p className="text-sm text-sand-600 mt-3 leading-relaxed">
                This signal has not yet been reviewed. An environmental expert can visit the Review page to inspect the evidence and make a decision.
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-4">
          <p className="text-sm text-sand-600 leading-relaxed">
            Human reviewers remain responsible for decisions. AI assists with explanation. The One Health context does not automatically change the review decision.
          </p>
          <Link
            to="/review"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-aqua-700 rounded-xl hover:bg-aqua-800 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            {review ? 'Change Review Decision' : 'Review This Signal'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Step 8: Export ─────────────────────────────────────────

function StepExport({ data }: { data: DemoData }) {
  return (
    <div className="surface p-6">
      <DemoStepHeader icon={Share} step="8" title="FHIR Interoperability" subtitle="Structured exports make the evidence package easier to move between systems" />
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <div className="surface-soft p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileJson className="w-5 h-5 text-aqua-600" />
            <span className="text-sm font-semibold text-sand-900">FHIR R4 JSON</span>
          </div>
          <p className="text-xs text-sand-500">Portable structured representation of this environmental evidence package.</p>
        </div>
        <div className="surface-soft p-4">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-5 h-5 text-sand-600" />
            <span className="text-sm font-semibold text-sand-900">JSON</span>
          </div>
          <p className="text-xs text-sand-500">Native AquaSignal structured export.</p>
        </div>
        <div className="surface-soft p-4">
          <div className="flex items-center gap-2 mb-2">
            <Table className="w-5 h-5 text-sand-600" />
            <span className="text-sm font-semibold text-sand-900">CSV</span>
          </div>
          <p className="text-xs text-sand-500">Tabular observation export.</p>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-lg bg-aqua-50 border border-aqua-100">
        <p className="text-xs font-medium text-aqua-700 mb-1">What is FHIR?</p>
        <p className="text-xs text-sand-600 leading-relaxed">
          FHIR is an interoperability standard for exchanging structured information between systems. AquaSignal provides a prototype FHIR R4-compatible export of environmental observations and related evidence. This is not formal HL7 certification or a validated OneAquaHealth profile.
        </p>
      </div>
      <Link
        to={`/signals/${RIVERSIDE_SIGNAL_ID}`}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-aqua-700 rounded-xl hover:bg-aqua-800 transition-colors"
      >
        <Share className="w-4 h-4" />
        Open Export on Signal Detail
      </Link>
      <p className="mt-4 text-xs text-sand-400 leading-relaxed">
        The export is generated locally in the browser. No data is uploaded to any external server. No secrets or credentials are included.
      </p>
    </div>
  );
}

// ── Small shared components ─────────────────────────────────

function DemoStepHeader({ icon: Icon, step, title, subtitle }: { icon: typeof Eye; step: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-aqua-600 tabular-nums">Step {step}</span>
        </div>
        <h3 className="text-lg font-semibold text-sand-900">{title}</h3>
        <p className="text-sm text-sand-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function ObsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-sand-500">{label}</span>
      <span className="text-sm font-medium text-sand-800">{value}</span>
    </div>
  );
}

function MetricBox({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-white border border-sand-100">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-aqua-500" />
        <span className="text-xs text-sand-500">{label}</span>
      </div>
      <p className="text-sm font-semibold text-sand-900 tabular-nums">{value}</p>
    </div>
  );
}

function ChainRow({ icon: Icon, label, value, active }: { icon: typeof Eye; label: string; value: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${active ? 'border-aqua-200 bg-aqua-50' : 'border-sand-200 bg-white'}`}>
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-aqua-500' : 'bg-sand-300'}`} />
      <Icon className={`w-4 h-4 ${active ? 'text-aqua-600' : 'text-sand-400'}`} />
      <div className="flex-1 text-left">
        <p className="text-xs font-medium text-sand-500">{label}</p>
        <p className="text-sm text-sand-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

function ChainArrow() {
  return (
    <div className="flex justify-center">
      <ArrowRight className="w-4 h-4 text-sand-300 rotate-90" />
    </div>
  );
}

function ContextCard({ icon: Icon, label, text }: { icon: typeof Leaf; label: string; text: string }) {
  return (
    <div className="surface-soft p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-aqua-500" />
        <span className="chip bg-aqua-50 text-aqua-700 border-aqua-200 text-xs">{label}</span>
      </div>
      <p className="text-xs font-medium text-sand-500 mb-1">Context</p>
      <p className="text-sm text-sand-700 leading-relaxed">{text}</p>
    </div>
  );
}
