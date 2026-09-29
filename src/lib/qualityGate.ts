import type {
  QualityGateResult,
  QualityIssue,
  ClarificationQuestion,
  EvidenceObservation,
  QualityGateStatus,
} from '@/types';

export interface QualityGateInput {
  siteName: string;
  waterAppearance: string;
  odour: string;
  waterFlow: string;
  visiblePollution: string[];
  vegetationCondition: string;
  wildlifeObserved: string[];
  notes: string;
  hasPhoto: boolean;
}

function clampCompleteness(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function runQualityGate(input: QualityGateInput): QualityGateResult {
  const issues: QualityIssue[] = [];
  const questions: ClarificationQuestion[] = [];
  const evidence: EvidenceObservation[] = [];

  const fields = [
    { key: 'water_appearance', label: 'Water appearance', value: input.waterAppearance },
    { key: 'odour', label: 'Odour', value: input.odour },
    { key: 'water_flow', label: 'Water flow', value: input.waterFlow },
    { key: 'vegetation_condition', label: 'Vegetation condition', value: input.vegetationCondition },
  { key: 'visible_pollution', label: 'Visible pollution', value: input.visiblePollution.length > 0 ? input.visiblePollution.join(', ') : '' },
    { key: 'wildlife_observed', label: 'Wildlife observed', value: input.wildlifeObserved.length > 0 ? input.wildlifeObserved.join(', ') : '' },
    { key: 'notes', label: 'Notes', value: input.notes },
  { key: 'photo', label: 'Photo evidence', value: input.hasPhoto ? 'attached' : '' },
  { key: 'site', label: 'Site', value: input.siteName },
  ];

  const filledCount = fields.filter((f) => f.value !== '' && f.value.length > 0).length;
  const baseCompleteness = (filledCount / fields.length) * 100;

  // --- Missing information checks ---
  if (!input.notes || input.notes.trim().length === 0) {
    issues.push({
      field: 'notes',
      issue: 'No additional notes provided. Notes help reviewers understand context that structured fields may not capture.',
      severity: 'info',
    });
  }

  if (!input.hasPhoto) {
    issues.push({
      field: 'photo',
      issue: 'No photograph attached. Photos strengthen evidence and help reviewers verify observations.',
      severity: 'info',
    });
  }

  if (input.visiblePollution.length === 0) {
    issues.push({
      field: 'visible_pollution',
      issue: 'No visible pollution type selected. If pollution was observed, selecting a type helps categorise the report.',
      severity: 'info',
    });
  }

  if (input.wildlifeObserved.length === 0) {
    issues.push({
      field: 'wildlife_observed',
      issue: 'No wildlife observations recorded. Even noting "None observed" provides useful baseline data.',
      severity: 'info',
    });
  }

  // --- Contradiction checks ---
  const appearanceLower = input.waterAppearance.toLowerCase();
  const pollutionStr = input.visiblePollution.join(', ').toLowerCase();

  if (appearanceLower.includes('clear') && pollutionStr.length > 0 && !pollutionStr.includes('none visible')) {
    const contradiction: QualityIssue = {
      field: 'water_appearance',
      issue: `Water appearance is described as "${input.waterAppearance}" but visible pollution includes "${input.visiblePollution.join(', ')}". These may be inconsistent.`,
      severity: 'warning',
    };
    issues.push(contradiction);
    questions.push({
      field: 'water_appearance',
      question: `Could you confirm whether "${input.visiblePollution.join(', ')}" was actually visible? This differs from the otherwise clear-water observation.`,
    });
  }

  if (appearanceLower.includes('clear') && input.odour && !input.odour.toLowerCase().includes('none') && !input.odour.toLowerCase().includes('fresh')) {
    issues.push({
      field: 'odour',
      issue: `Water appearance is "Clear" but odour is described as "${input.odour}". Clear water with a noticeable odour may warrant confirmation.`,
      severity: 'warning',
    });
    questions.push({
      field: 'odour',
      question: `You noted clear water but also detected "${input.odour}". Could you confirm the odour description? This combination is less common.`,
    });
  }

  if (appearanceLower.includes('murky') || appearanceLower.includes('turbid') || appearanceLower.includes('cloudy')) {
    if (input.waterFlow && input.waterFlow.toLowerCase().includes('dry')) {
      issues.push({
        field: 'water_flow',
        issue: `Water appearance is "${input.waterAppearance}" but flow is described as "${input.waterFlow}". Murky or turbid water with no flow is unusual.`,
        severity: 'warning',
      });
      questions.push({
        field: 'water_flow',
        question: `You described the water as "${input.waterAppearance}" but also "${input.waterFlow}". Could you confirm the flow condition?`,
      });
    }
  }

  if (input.vegetationCondition && input.vegetationCondition.toLowerCase().includes('healthy')) {
    if (pollutionStr.length > 0 && !pollutionStr.includes('none visible') && !pollutionStr.includes('minor litter')) {
      issues.push({
        field: 'vegetation_condition',
        issue: `Vegetation is described as healthy, but visible pollution includes "${input.visiblePollution.join(', ')}". Healthy vegetation alongside notable pollution may deserve a second look.`,
        severity: 'info',
      });
    }
  }

  // --- Evidence observations ---
  if (input.hasPhoto) {
    evidence.push({
      observation: 'Photographic evidence attached',
      detail: 'A photo can help reviewers visually confirm the reported conditions.',
    });
  }

  if (input.notes && input.notes.trim().length > 0) {
    evidence.push({
      observation: 'Detailed notes provided',
      detail: 'Additional context from the observer helps reviewers understand the site conditions.',
    });
  }

  if (input.visiblePollution.length > 1) {
    evidence.push({
      observation: 'Multiple pollution types noted',
      detail: `${input.visiblePollution.length} types of visible pollution were recorded, which may indicate a compound issue.`,
    });
  }

  // --- Determine overall status ---
  const hasWarnings = issues.some((i) => i.severity === 'warning');
  const missingCore = !input.waterAppearance || !input.odour || !input.waterFlow || !input.vegetationCondition;

  let overallStatus: QualityGateStatus;
  if (missingCore) {
    overallStatus = 'insufficient_information';
  } else if (hasWarnings || questions.length > 0) {
    overallStatus = 'needs_clarification';
  } else {
    overallStatus = 'ready';
  }

  const penaltyPerIssue = 3;
  const completeness = clampCompleteness(baseCompleteness - issues.length * penaltyPerIssue);

  let explanation: string;
  if (overallStatus === 'ready') {
    explanation = 'Your observation is well-structured and internally consistent. It is ready for submission. An environmental reviewer will assess it alongside other observations from this site.';
  } else if (overallStatus === 'needs_clarification') {
    explanation = 'Your observation has been recorded, but a few details may benefit from confirmation. You can update your answers or continue as-is — the citizen observation remains the source of truth.';
  } else {
    explanation = 'Some core observation fields are missing. Adding more detail will help reviewers assess this report. You can still submit, but consider filling in the missing fields first.';
  }

  return {
    overall_status: overallStatus,
    completeness,
    issues,
    clarification_questions: questions,
    evidence_observations: evidence,
    explanation,
  };
}
