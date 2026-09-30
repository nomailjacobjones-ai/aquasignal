import { supabase } from '@/lib/supabaseClient';
import type { ObservationRow, EnvironmentalSignalRow, SignalContributionType, SignalEvidenceType } from '@/types';

// ── Constants ───────────────────────────────────────────

export const SIGNAL_WINDOW_HOURS = 48;
export const MIN_OBSERVATIONS_FOR_SIGNAL = 3;

// ── Internal types ──────────────────────────────────────

type IndicatorType =
  | 'unusual_water_appearance'
  | 'visible_pollution'
  | 'unusual_odour'
  | 'declining_vegetation'
  | 'improving_vegetation'
  | 'unusually_low_flow'
  | 'unusually_high_flow'
  | 'reduced_wildlife';

type DerivedSignalType =
  | 'possible_pollution_pattern'
  | 'unusual_water_condition'
  | 'habitat_condition_change'
  | 'unusual_flow_pattern';

interface SignalAnalysis {
  signalType: DerivedSignalType;
  title: string;
  description: string;
  observations: ObservationRow[];
  indicatorCounts: Map<IndicatorType, number>;
  uniqueIndicators: IndicatorType[];
  strength: number;
  reasoning: string[];
  evidenceItems: { type: SignalEvidenceType; label: string; value: string }[];
  firstObservedAt: string;
  lastObservedAt: string;
  timeSpanHours: number;
  incompleteCount: number;
  isDemo: boolean;
}

// ── Indicator labels ────────────────────────────────────

const SIGNAL_TITLES: Record<DerivedSignalType, string> = {
  possible_pollution_pattern: 'Possible Pollution Pattern',
  unusual_water_condition: 'Unusual Water Condition',
  habitat_condition_change: 'Habitat Condition Change',
  unusual_flow_pattern: 'Unusual Flow Pattern',
};

const INDICATOR_LABELS: Record<IndicatorType, string> = {
  unusual_water_appearance: 'Unusual water appearance',
  visible_pollution: 'Visible pollution',
  unusual_odour: 'Unusual odour',
  declining_vegetation: 'Declining vegetation',
  improving_vegetation: 'Improving vegetation',
  unusually_low_flow: 'Unusually low flow',
  unusually_high_flow: 'Unusually high flow',
  reduced_wildlife: 'Reduced wildlife activity',
};

// ── Helper functions ────────────────────────────────────

function normalize(value: string | null): string {
  if (!value) return '';
  return value.toLowerCase().replace(/_/g, ' ').trim();
}

function deriveIndicators(obs: ObservationRow): IndicatorType[] {
  const indicators: IndicatorType[] = [];
  const appearance = normalize(obs.water_appearance);
  const pollution = normalize(obs.visible_pollution);
  const odour = normalize(obs.odour);
  const vegetation = normalize(obs.vegetation_condition);
  const flow = normalize(obs.water_flow);
  const wildlife = normalize(obs.wildlife_observed);

  if (['cloudy', 'discoloured', 'murky', 'turbid', 'greenish', 'brown'].some(k => appearance.includes(k))) {
    indicators.push('unusual_water_appearance');
  }
  if (pollution && !pollution.includes('none visible') && pollution !== 'none') {
    indicators.push('visible_pollution');
  }
  if (odour && !odour.includes('none detected') && odour !== 'none' && !odour.includes('fresh')) {
    indicators.push('unusual_odour');
  }
  if (['browning', 'overgrowth', 'reduced growth'].some(k => vegetation.includes(k))) {
    indicators.push('declining_vegetation');
  }
  if (['improved', 'new growth', 'healthy and diverse'].some(k => vegetation.includes(k))) {
    indicators.push('improving_vegetation');
  }
  if (flow.includes('lower than usual') || flow === 'low' || flow.includes('dry') || flow.includes('no flow')) {
    indicators.push('unusually_low_flow');
  }
  if (flow.includes('higher than usual') || flow.includes('flooded')) {
    indicators.push('unusually_high_flow');
  }
  if (['reduced', 'fewer'].some(k => wildlife.includes(k))) {
    indicators.push('reduced_wildlife');
  }

  return indicators;
}

function computeCompleteness(obs: ObservationRow): number {
  const fields = [
    obs.water_appearance, obs.odour, obs.water_flow,
    obs.visible_pollution, obs.vegetation_condition,
    obs.wildlife_observed, obs.notes,
  ];
  const filled = fields.filter(f => f !== null && f.trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
}

function findBestWindow(observations: ObservationRow[], windowHours: number): ObservationRow[] {
  const sorted = [...observations].sort((a, b) =>
    new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  );
  let best: ObservationRow[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = new Date(sorted[i].submitted_at).getTime();
    const end = start + windowHours * 60 * 60 * 1000;
    const inWindow = sorted.filter(o => {
      const t = new Date(o.submitted_at).getTime();
      return t >= start && t <= end;
    });
    if (inWindow.length > best.length) best = inWindow;
  }
  return best;
}

function determineSignalType(indicatorCounts: Map<IndicatorType, number>): DerivedSignalType | null {
  const pollutionObs = indicatorCounts.get('visible_pollution') ?? 0;
  const odourObs = indicatorCounts.get('unusual_odour') ?? 0;
  const waterObs = indicatorCounts.get('unusual_water_appearance') ?? 0;
  const habitatDecline = indicatorCounts.get('declining_vegetation') ?? 0;
  const habitatImprove = indicatorCounts.get('improving_vegetation') ?? 0;
  const lowFlow = indicatorCounts.get('unusually_low_flow') ?? 0;
  const highFlow = indicatorCounts.get('unusually_high_flow') ?? 0;

  if (pollutionObs >= 2 || odourObs >= 2) return 'possible_pollution_pattern';
  if (waterObs >= 2) return 'unusual_water_condition';
  if (habitatDecline >= 2 || habitatImprove >= 2) return 'habitat_condition_change';
  if (lowFlow >= 2 || highFlow >= 2) return 'unusual_flow_pattern';
  return null;
}

function analyzeSite(observations: ObservationRow[], windowHours: number): SignalAnalysis | null {
  const windowObs = findBestWindow(observations, windowHours);
  if (windowObs.length < MIN_OBSERVATIONS_FOR_SIGNAL) return null;

  const obsIndicators = windowObs.map(obs => ({
    obs, indicators: deriveIndicators(obs), completeness: computeCompleteness(obs),
  }));

  const indicatorCounts = new Map<IndicatorType, number>();
  for (const { indicators } of obsIndicators) {
    for (const ind of indicators) {
      indicatorCounts.set(ind, (indicatorCounts.get(ind) ?? 0) + 1);
    }
  }

  const uniqueIndicators = [...indicatorCounts.keys()];
  const signalType = determineSignalType(indicatorCounts);
  if (!signalType) return null;

  const times = windowObs.map(o => new Date(o.submitted_at).getTime()).sort((a, b) => a - b);
  const firstObservedAt = new Date(times[0]).toISOString();
  const lastObservedAt = new Date(times[times.length - 1]).toISOString();
  const timeSpanHours = (times[times.length - 1] - times[0]) / (60 * 60 * 1000);

  const avgCompleteness = obsIndicators.reduce((s, oi) => s + oi.completeness, 0) / obsIndicators.length;
  const incompleteCount = obsIndicators.filter(oi => oi.completeness < 100).length;

  // ── Evidence Strength formula (0–100) ─────────────────
  // Deterministic, explainable, four weighted factors:
  // 1. Observation volume (max 25): min(count / 5 * 25, 25)
  // 2. Indicator corroboration (max 30): min(unique / 8 * 30, 30)
  // 3. Temporal concentration (max 20): max(0, (1 - span/window) * 20)
  // 4. Quality/completeness (max 25): avgCompleteness / 100 * 25
  const observationVolume = Math.min((windowObs.length / 5) * 25, 25);
  const indicatorCorroboration = Math.min((uniqueIndicators.length / 8) * 30, 30);
  const temporalConcentration = Math.max(0, (1 - timeSpanHours / windowHours) * 20);
  const qualityCompleteness = (avgCompleteness / 100) * 25;
  const strength = Math.round(observationVolume + indicatorCorroboration + temporalConcentration + qualityCompleteness);

  const reasoning: string[] = [];
  reasoning.push(`${windowObs.length} observations occurred at the same site within ${windowHours} hours.`);
  for (const [indicator, count] of indicatorCounts) {
    reasoning.push(`${count} observation${count !== 1 ? 's' : ''} reported ${INDICATOR_LABELS[indicator].toLowerCase()}.`);
  }
  if (incompleteCount > 0) {
    reasoning.push(`${incompleteCount} observation${incompleteCount !== 1 ? 's have' : ' has'} incomplete information.`);
  }

  const evidenceItems: { type: SignalEvidenceType; label: string; value: string }[] = [
    { type: 'observation_count', label: 'Observation count', value: `${windowObs.length} within ${windowHours}h` },
    { type: 'time_cluster', label: 'Time span', value: `${timeSpanHours.toFixed(1)} hours` },
  ];
  for (const [indicator, count] of indicatorCounts) {
    evidenceItems.push({ type: 'indicator', label: INDICATOR_LABELS[indicator], value: `${count} observation${count !== 1 ? 's' : ''}` });
  }
  if (incompleteCount > 0) {
    evidenceItems.push({ type: 'quality_check', label: 'Data quality', value: `${incompleteCount} incomplete` });
  }

  const description = `${windowObs.length} observations at this site within a ${windowHours}-hour window show ${uniqueIndicators.length} recurring environmental indicator${uniqueIndicators.length !== 1 ? 's' : ''}. Evidence strength: ${strength}/100. This is a deterministic pattern derived from citizen observations, not a scientific prediction.`;
  const isDemo = windowObs.every(o => o.is_demo);

  return {
    signalType, title: SIGNAL_TITLES[signalType], description,
    observations: windowObs, indicatorCounts, uniqueIndicators,
    strength, reasoning, evidenceItems,
    firstObservedAt, lastObservedAt, timeSpanHours,
    incompleteCount, isDemo,
  };
}

// ── Persistence ─────────────────────────────────────────

async function persistSignal(siteId: string, analysis: SignalAnalysis): Promise<EnvironmentalSignalRow | null> {
  const { data: existing } = await supabase
    .from('environmental_signals')
    .select('id')
    .eq('site_id', siteId)
    .eq('signal_type', analysis.signalType)
    .in('status', ['emerging', 'monitoring'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let signalId: string;

  if (existing) {
    const { data: updated, error } = await supabase
      .from('environmental_signals')
      .update({
        title: analysis.title, description: analysis.description,
        strength: analysis.strength,
        observation_count: analysis.observations.length,
        indicator_count: analysis.uniqueIndicators.length,
        first_observed_at: analysis.firstObservedAt,
        last_observed_at: analysis.lastObservedAt,
        reasoning: analysis.reasoning, is_demo: analysis.isDemo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    signalId = updated.id;
    await supabase.from('signal_observations').delete().eq('signal_id', signalId);
    await supabase.from('signal_evidence').delete().eq('signal_id', signalId);
  } else {
    const { data: created, error } = await supabase
      .from('environmental_signals')
      .insert({
        site_id: siteId, signal_type: analysis.signalType,
        title: analysis.title, description: analysis.description,
        status: 'emerging', strength: analysis.strength,
        observation_count: analysis.observations.length,
        indicator_count: analysis.uniqueIndicators.length,
        time_window_hours: SIGNAL_WINDOW_HOURS,
        first_observed_at: analysis.firstObservedAt,
        last_observed_at: analysis.lastObservedAt,
        reasoning: analysis.reasoning, is_demo: analysis.isDemo,
      })
      .select()
      .single();
    if (error) throw error;
    signalId = created.id;
  }

  await Promise.all(analysis.observations.map(async (obs) => {
    const contributionType: SignalContributionType = deriveIndicators(obs).length > 0 ? 'primary' : 'corroborating';
    await supabase.from('signal_observations').insert({
      signal_id: signalId, observation_id: obs.id, contribution_type: contributionType,
    });
  }));

  await Promise.all(analysis.evidenceItems.map(async (item) => {
    await supabase.from('signal_evidence').insert({
      signal_id: signalId, evidence_type: item.type,
      label: item.label, value: item.value,
    });
  }));

  const { data: finalSignal } = await supabase
    .from('environmental_signals')
    .select('*')
    .eq('id', signalId)
    .single();
  return finalSignal;
}

// ── Public API ──────────────────────────────────────────

export async function generateSignals(): Promise<EnvironmentalSignalRow[]> {
  const { data: sites, error } = await supabase.from('sites').select('id').order('name');
  if (error) throw error;
  if (!sites || sites.length === 0) return [];

  const results: EnvironmentalSignalRow[] = [];
  for (const site of sites) {
    try {
      const signal = await generateSiteSignals(site.id);
      if (signal) results.push(signal);
    } catch {
      // One site failing should not take down the rest
    }
  }
  return results;
}

export async function generateSiteSignals(siteId: string): Promise<EnvironmentalSignalRow | null> {
  const { data: observations, error } = await supabase
    .from('observations')
    .select('*')
    .eq('site_id', siteId)
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  if (!observations || observations.length < MIN_OBSERVATIONS_FOR_SIGNAL) return null;

  const analysis = analyzeSite(observations as ObservationRow[], SIGNAL_WINDOW_HOURS);
  if (!analysis) return null;

  return persistSignal(siteId, analysis);
}
