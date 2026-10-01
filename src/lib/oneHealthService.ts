import { supabase } from '@/lib/supabaseClient';
import type {
  SignalOneHealthContext,
  SignalOneHealthContextRow,
  EnvironmentalSignalRow,
  SignalEvidenceRow,
} from '@/types';

const DISCLAIMER =
  'One Health context is provided for environmental decision support. It does not diagnose disease, establish exposure, or prove causation. Human and environmental experts remain responsible for interpretation and action.';

// ── Deterministic context rules ──────────────────────────
//
// Maps signal types to cautious contextual statements across
// ecosystem, biodiversity/animal, and human wellbeing dimensions.
// These are NOT diagnoses, risk scores, or causal claims.

interface ContextRule {
  ecosystem: string;
  biodiversity: string;
  humanWellbeing: string;
  notes: string[];
}

const contextRules: Record<string, ContextRule> = {
  possible_pollution_pattern: {
    ecosystem:
      'Observed environmental changes may warrant closer assessment of local stream ecosystem conditions.',
    biodiversity:
      'Observed habitat changes may have relevance for local biodiversity and wildlife conditions and could justify additional field observation.',
    humanWellbeing:
      'Changes in an urban freshwater environment may be relevant to community wellbeing where people interact with the area.',
    notes: [
      'Context derived from detected pollution-pattern indicators.',
      'No laboratory confirmation is implied.',
    ],
  },
  unusual_water_condition: {
    ecosystem:
      'Changes in observed water appearance may be relevant to monitoring ecosystem condition and should be considered alongside other environmental measurements.',
    biodiversity:
      'Unusual water conditions may affect habitat quality for local species and could justify continued observation.',
    humanWellbeing:
      'Environmental conditions may warrant attention when a site is used for recreation or community activities.',
    notes: [
      'Context derived from citizen-reported water appearance changes.',
      'No water quality test results are available in this prototype.',
    ],
  },
  habitat_condition_change: {
    ecosystem:
      'Repeated observations of changing vegetation or habitat indicators may be relevant to ecosystem monitoring.',
    biodiversity:
      'Observed habitat changes may have relevance for local biodiversity and could justify additional field observation.',
    humanWellbeing:
      'Changes in habitat conditions at a community-accessible site may be relevant to environmental wellbeing in the area.',
    notes: [
      'Context derived from vegetation and habitat indicator changes.',
      'Reduced wildlife observations are recorded as citizen observations but do not establish wildlife decline.',
    ],
  },
  unusual_flow_pattern: {
    ecosystem:
      'Changes in water flow patterns may be relevant to stream dynamics and ecosystem monitoring.',
    biodiversity:
      'Altered flow conditions may affect aquatic habitat and could justify continued observation of local species.',
    humanWellbeing:
      'Environmental conditions may warrant attention when a site is used for recreation or community activities.',
    notes: [
      'Context derived from citizen-reported water flow changes.',
      'No hydrological measurements are available in this prototype.',
    ],
  },
};

const defaultRule: ContextRule = {
  ecosystem:
    'Observed environmental changes may warrant closer assessment of local ecosystem conditions.',
  biodiversity:
    'Observed environmental changes may have relevance for local biodiversity and could justify additional field observation.',
  humanWellbeing:
    'Changes in the observed environment may be relevant to community wellbeing where people interact with the area.',
  notes: [
    'Context derived from general environmental signal indicators.',
    'No specific laboratory or field verification data is available.',
  ],
};

function buildContext(
  signal: EnvironmentalSignalRow,
  evidence: SignalEvidenceRow[],
): SignalOneHealthContext {
  const rule = contextRules[signal.signal_type] ?? defaultRule;

  // Check for reduced wildlife observations in evidence
  const hasWildlifeIndicator = evidence.some(
    (e) => e.evidence_type === 'indicator' && e.label.toLowerCase().includes('wildlife'),
  );

  const notes = [...rule.notes];
  if (hasWildlifeIndicator) {
    notes.push(
      'Reduced wildlife observations are recorded as citizen observations but do not establish population decline.',
    );
  }

  return {
    ecosystem_context: rule.ecosystem,
    biodiversity_context: rule.biodiversity,
    human_wellbeing_context: rule.humanWellbeing,
    context_notes: notes,
    disclaimer: DISCLAIMER,
  };
}

// ── Public API ───────────────────────────────────────────

export async function getOneHealthContext(
  signalId: string,
): Promise<SignalOneHealthContextRow | null> {
  const { data, error } = await supabase
    .from('signal_one_health_context')
    .select('*')
    .eq('signal_id', signalId)
    .maybeSingle();

  if (error) throw error;
  return data as SignalOneHealthContextRow | null;
}

export async function generateAndSaveOneHealthContext(
  signal: EnvironmentalSignalRow,
  evidence: SignalEvidenceRow[],
): Promise<SignalOneHealthContext> {
  const context = buildContext(signal, evidence);

  const { error } = await supabase
    .from('signal_one_health_context')
    .upsert(
      {
        signal_id: signal.id,
        ecosystem_context: context.ecosystem_context,
        biodiversity_context: context.biodiversity_context,
        human_wellbeing_context: context.human_wellbeing_context,
        context_notes: context.context_notes,
        disclaimer: context.disclaimer,
        engine_type: 'rules',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'signal_id' },
    );

  if (error) throw error;
  return context;
}

export async function getOrGenerateOneHealthContext(
  signal: EnvironmentalSignalRow,
  evidence: SignalEvidenceRow[],
): Promise<SignalOneHealthContext> {
  try {
    const existing = await getOneHealthContext(signal.id);
    if (existing) {
      return {
        ecosystem_context: existing.ecosystem_context,
        biodiversity_context: existing.biodiversity_context,
        human_wellbeing_context: existing.human_wellbeing_context,
        context_notes: existing.context_notes ?? [],
        disclaimer: existing.disclaimer,
      };
    }
  } catch {
    // Fall through to generation
  }

  return generateAndSaveOneHealthContext(signal, evidence);
}
