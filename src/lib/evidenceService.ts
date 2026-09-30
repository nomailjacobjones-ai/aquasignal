import { supabase } from '@/lib/supabaseClient';
import type {
  ObservationQualityCheckRow,
  EnvironmentalSignalRow,
  SignalObservationRow,
  SignalEvidenceRow,
  QualityGateResult,
  SignalContributionType,
  SignalEvidenceType,
  SiteRow,
  ObservationRow,
} from '@/types';

// ── Observation quality checks ──────────────────────────

export async function saveObservationQualityCheck(
  observationId: string,
  result: QualityGateResult,
  engineType: 'rules' = 'rules',
): Promise<ObservationQualityCheckRow | null> {
  const { data, error } = await supabase
    .from('observation_quality_checks')
    .insert({
      observation_id: observationId,
      overall_status: result.overall_status,
      completeness: result.completeness,
      issues: result.issues,
      clarification_questions: result.clarification_questions,
      evidence_observations: result.evidence_observations,
      explanation: result.explanation,
      engine_type: engineType,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getObservationQualityCheck(
  observationId: string,
): Promise<ObservationQualityCheckRow | null> {
  const { data, error } = await supabase
    .from('observation_quality_checks')
    .select('*')
    .eq('observation_id', observationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ── Environmental signals ───────────────────────────────

export interface CreateSignalInput {
  site_id: string | null;
  signal_type: string;
  title: string;
  description?: string | null;
  status?: EnvironmentalSignalRow['status'];
  strength: number;
  observation_count?: number;
  indicator_count?: number;
  time_window_hours: number;
  first_observed_at?: string | null;
  last_observed_at?: string | null;
  reasoning?: unknown[];
  is_demo?: boolean;
}

export async function createEnvironmentalSignal(
  input: CreateSignalInput,
): Promise<EnvironmentalSignalRow> {
  const { data, error } = await supabase
    .from('environmental_signals')
    .insert({
      site_id: input.site_id,
      signal_type: input.signal_type,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'emerging',
      strength: input.strength,
      observation_count: input.observation_count ?? 0,
      indicator_count: input.indicator_count ?? 0,
      time_window_hours: input.time_window_hours,
      first_observed_at: input.first_observed_at ?? null,
      last_observed_at: input.last_observed_at ?? null,
      reasoning: input.reasoning ?? [],
      is_demo: input.is_demo ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Signal ↔ Observation links ──────────────────────────

export async function linkObservationToSignal(
  signalId: string,
  observationId: string,
  contributionType?: SignalContributionType,
): Promise<SignalObservationRow | null> {
  const { data, error } = await supabase
    .from('signal_observations')
    .insert({
      signal_id: signalId,
      observation_id: observationId,
      contribution_type: contributionType ?? null,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getSignalObservations(
  signalId: string,
): Promise<SignalObservationRow[]> {
  const { data, error } = await supabase
    .from('signal_observations')
    .select('*')
    .eq('signal_id', signalId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ── Signal evidence ─────────────────────────────────────

export interface AddSignalEvidenceInput {
  signal_id: string;
  evidence_type: SignalEvidenceType;
  label: string;
  value?: string | null;
  source_observation_id?: string | null;
}

export async function addSignalEvidence(
  input: AddSignalEvidenceInput,
): Promise<SignalEvidenceRow | null> {
  const { data, error } = await supabase
    .from('signal_evidence')
    .insert({
      signal_id: input.signal_id,
      evidence_type: input.evidence_type,
      label: input.label,
      value: input.value ?? null,
      source_observation_id: input.source_observation_id ?? null,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getSignalEvidence(
  signalId: string,
): Promise<SignalEvidenceRow[]> {
  const { data, error } = await supabase
    .from('signal_evidence')
    .select('*')
    .eq('signal_id', signalId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ── Signal fetch helpers (Phase 4B) ─────────────────────

export interface EnvironmentalSignalWithSite extends EnvironmentalSignalRow {
  sites: Pick<SiteRow, 'id' | 'name' | 'region' | 'latitude' | 'longitude'> | null;
}

export interface SignalObservationWithDetails extends SignalObservationRow {
  observations: ObservationRow;
}

export async function fetchSignalsWithSites(): Promise<EnvironmentalSignalWithSite[]> {
  const { data, error } = await supabase
    .from('environmental_signals')
    .select(`
      *,
      sites:site_id (
        id, name, region, latitude, longitude
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as EnvironmentalSignalWithSite[];
}

export async function fetchSignalById(id: string): Promise<EnvironmentalSignalWithSite | null> {
  const { data, error } = await supabase
    .from('environmental_signals')
    .select(`
      *,
      sites:site_id (
        id, name, region, latitude, longitude
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as EnvironmentalSignalWithSite | null;
}

export async function fetchSignalObservationsWithDetails(signalId: string): Promise<SignalObservationWithDetails[]> {
  const { data, error } = await supabase
    .from('signal_observations')
    .select(`
      *,
      observations:observation_id (*)
    `)
    .eq('signal_id', signalId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as SignalObservationWithDetails[];
}
