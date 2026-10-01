import { supabase } from '@/lib/supabaseClient';
import type { SignalReviewRow, SignalReviewDecision } from '@/types';

export async function getSignalReview(signalId: string): Promise<SignalReviewRow | null> {
  const { data, error } = await supabase
    .from('signal_reviews')
    .select('*')
    .eq('signal_id', signalId)
    .maybeSingle();

  if (error) throw error;
  return data as SignalReviewRow | null;
}

export async function saveSignalReview(
  signalId: string,
  decision: SignalReviewDecision,
  notes: string | null,
): Promise<SignalReviewRow> {
  const { data, error } = await supabase
    .from('signal_reviews')
    .upsert({
      signal_id: signalId,
      decision,
      notes: notes?.trim() || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'signal_id' })
    .select()
    .single();

  if (error) throw error;
  return data as SignalReviewRow;
}

export async function getAllReviews(): Promise<Map<string, SignalReviewRow>> {
  const { data, error } = await supabase
    .from('signal_reviews')
    .select('*');

  if (error) throw error;
  const map = new Map<string, SignalReviewRow>();
  for (const row of (data ?? []) as SignalReviewRow[]) {
    map.set(row.signal_id, row);
  }
  return map;
}

export const reviewDecisionLabels: Record<SignalReviewDecision, string> = {
  confirmed_for_follow_up: 'Follow-up Requested',
  needs_more_evidence: 'More Evidence Needed',
  dismissed: 'Dismissed by Reviewer',
};

export const reviewDecisionChipStyles: Record<SignalReviewDecision, string> = {
  confirmed_for_follow_up: 'bg-aqua-50 text-aqua-700 border-aqua-200',
  needs_more_evidence: 'bg-amber-50 text-amber-700 border-amber-200',
  dismissed: 'bg-sand-100 text-sand-500 border-sand-200',
};
