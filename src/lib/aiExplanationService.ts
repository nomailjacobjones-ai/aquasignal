import { supabase } from '@/lib/supabaseClient';
import type {
  SignalAIExplanation,
  SignalAIExplanationRow,
  SignalEvidenceRow,
  ObservationQualityCheckRow,
} from '@/types';
import { fetchSignalById, fetchSignalObservationsWithDetails, getSignalEvidence, getObservationQualityCheck } from '@/lib/evidenceService';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-signal`;

interface EvidencePackage {
  signalTitle: string;
  signalType: string;
  siteName: string;
  status: string;
  evidenceStrength: number;
  observationCount: number;
  indicatorCount: number;
  timeWindowHours: number;
  firstObserved: string | null;
  lastObserved: string | null;
  reasoning: string[];
  evidenceItems: { type: string; label: string; value: string | null }[];
  observationSummaries: {
    submittedAt: string;
    waterAppearance: string | null;
    odour: string | null;
    waterFlow: string | null;
    visiblePollution: string | null;
    vegetationCondition: string | null;
    wildlifeObserved: string | null;
    contributionType: string | null;
    hasPhoto: boolean;
    qualityStatus: string | null;
  }[];
  incompleteCount: number;
}

async function buildEvidencePackage(signalId: string): Promise<EvidencePackage | null> {
  const signal = await fetchSignalById(signalId);
  if (!signal) return null;

  const [obsLinks, evidence] = await Promise.all([
    fetchSignalObservationsWithDetails(signalId),
    getSignalEvidence(signalId),
  ]);

  const qualityChecks = new Map<string, ObservationQualityCheckRow | null>();
  for (const link of obsLinks) {
    try {
      const qc = await getObservationQualityCheck(link.observation_id);
      qualityChecks.set(link.observation_id, qc);
    } catch {
      qualityChecks.set(link.observation_id, null);
    }
  }

  // Check for photos
  const observationSummaries: EvidencePackage['observationSummaries'] = [];
  let incompleteCount = 0;

  for (const link of obsLinks) {
    const obs = link.observations;
    const qc = qualityChecks.get(link.observation_id);

    // Check photo availability
    let hasPhoto = false;
    try {
      const { count } = await supabase
        .from('observation_photos')
        .select('id', { count: 'exact', head: true })
        .eq('observation_id', link.observation_id);
      hasPhoto = (count ?? 0) > 0;
    } catch {
      hasPhoto = false;
    }

    // Count incomplete (fields missing)
    const fields = [obs.water_appearance, obs.odour, obs.water_flow, obs.visible_pollution, obs.vegetation_condition, obs.wildlife_observed];
    const filled = fields.filter((f) => f !== null && f.trim() !== '').length;
    if (filled < fields.length) incompleteCount++;

    observationSummaries.push({
      submittedAt: obs.submitted_at,
      waterAppearance: obs.water_appearance,
      odour: obs.odour,
      waterFlow: obs.water_flow,
      visiblePollution: obs.visible_pollution,
      vegetationCondition: obs.vegetation_condition,
      wildlifeObserved: obs.wildlife_observed,
      contributionType: link.contribution_type,
      hasPhoto,
      qualityStatus: qc?.overall_status ?? null,
    });
  }

  return {
    signalTitle: signal.title,
    signalType: signal.signal_type,
    siteName: signal.sites?.name ?? 'Unknown site',
    status: signal.status,
    evidenceStrength: signal.strength,
    observationCount: signal.observation_count,
    indicatorCount: signal.indicator_count,
    timeWindowHours: signal.time_window_hours,
    firstObserved: signal.first_observed_at,
    lastObserved: signal.last_observed_at,
    reasoning: (signal.reasoning ?? []) as string[],
    evidenceItems: evidence.map((e: SignalEvidenceRow) => ({
      type: e.evidence_type,
      label: e.label,
      value: e.value,
    })),
    observationSummaries,
    incompleteCount,
  };
}

function validateExplanationResponse(data: unknown): data is SignalAIExplanation {
  if (typeof data !== 'object' || data === null) return false;
  const o = data as Record<string, unknown>;
  return (
    typeof o.summary === 'string' && o.summary.length > 0 &&
    Array.isArray(o.supporting_evidence) && o.supporting_evidence.every((e) => typeof e === 'string') &&
    Array.isArray(o.uncertainties) && o.uncertainties.every((u) => typeof u === 'string') &&
    typeof o.recommended_review === 'string' &&
    typeof o.disclaimer === 'string' && o.disclaimer.length > 0 &&
    typeof o.is_fallback === 'boolean'
  );
}

function buildClientFallback(pkg: EvidencePackage): SignalAIExplanation {
  const evidenceStatements = [...pkg.reasoning];
  for (const ev of pkg.evidenceItems) {
    evidenceStatements.push(`${ev.label}: ${ev.value ?? 'recorded'}`);
  }

  const uncertainties: string[] = [];
  if (pkg.incompleteCount > 0) {
    uncertainties.push(`${pkg.incompleteCount} observation${pkg.incompleteCount !== 1 ? 's have' : ' has'} incomplete information, which limits interpretation.`);
  }
  uncertainties.push('Citizen observations are subjective and have not been scientifically verified.');
  if (pkg.evidenceStrength < 50) {
    uncertainties.push('Evidence strength is moderate; additional observations would increase confidence in the pattern.');
  }
  uncertainties.push('This pattern does not establish causation or identify a specific pollution source.');

  const photoCount = pkg.observationSummaries.filter((o) => o.hasPhoto).length;
  if (photoCount > 0) {
    evidenceStatements.push(`${photoCount} observation${photoCount !== 1 ? 's include' : ' includes'} photographic evidence.`);
  }

  return {
    summary: `${pkg.observationCount} observations were recorded at ${pkg.siteName} within the configured ${pkg.timeWindowHours}-hour window. Multiple observations contained related environmental indicators, leading the deterministic engine to identify a "${pkg.signalTitle}" pattern. Evidence strength is ${pkg.evidenceStrength}/100.`,
    supporting_evidence: evidenceStatements,
    uncertainties,
    recommended_review: 'A qualified environmental professional should verify the reported indicators on-site, review any available photographs, and assess whether the pattern warrants further investigation or monitoring.',
    disclaimer: 'This is a deterministic evidence summary generated from citizen observations. It is decision support, not a scientific diagnosis, confirmed contamination, or environmental emergency declaration.',
    is_fallback: true,
    provider: null,
    model: null,
  };
}

export async function getSignalExplanation(signalId: string): Promise<SignalAIExplanation | null> {
  const { data, error } = await supabase
    .from('signal_ai_explanations')
    .select('*')
    .eq('signal_id', signalId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as SignalAIExplanationRow;
  return {
    summary: row.summary,
    supporting_evidence: row.supporting_evidence,
    uncertainties: row.uncertainties,
    recommended_review: row.recommended_review ?? '',
    disclaimer: row.disclaimer,
    is_fallback: row.is_fallback,
    provider: row.provider,
    model: row.model,
  };
}

export async function generateSignalExplanation(signalId: string): Promise<SignalAIExplanation> {
  const pkg = await buildEvidencePackage(signalId);
  if (!pkg) throw new Error('Signal not found');

  let explanation: SignalAIExplanation;

  try {
    const resp = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal_id: signalId, evidence_package: pkg }),
    });

    if (!resp.ok) throw new Error('Edge function failed');

    const data = await resp.json();
    if (!validateExplanationResponse(data)) throw new Error('Invalid response');

    explanation = {
      summary: data.summary,
      supporting_evidence: data.supporting_evidence,
      uncertainties: data.uncertainties,
      recommended_review: data.recommended_review,
      disclaimer: data.disclaimer,
      is_fallback: data.is_fallback,
      provider: data.provider ?? null,
      model: data.model ?? null,
    };
  } catch {
    explanation = buildClientFallback(pkg);
  }

  // Persist (upsert — one explanation per signal)
  const { error } = await supabase
    .from('signal_ai_explanations')
    .upsert({
      signal_id: signalId,
      summary: explanation.summary,
      supporting_evidence: explanation.supporting_evidence,
      uncertainties: explanation.uncertainties,
      recommended_review: explanation.recommended_review,
      disclaimer: explanation.disclaimer,
      provider: explanation.provider,
      model: explanation.model,
      engine_type: explanation.is_fallback ? 'deterministic_fallback' : 'llm',
      is_fallback: explanation.is_fallback,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'signal_id' })
    .select()
    .single();

  if (error) throw error;

  return explanation;
}

export async function checkExplanationExists(signalId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('signal_ai_explanations')
    .select('id', { count: 'exact', head: true })
    .eq('signal_id', signalId);

  if (error) return false;
  return (count ?? 0) > 0;
}
