// Shared types for AquaSignal
// Phase 1 types remain for mock data. Phase 2A database types added below.

export type ConcernLevel = 'low' | 'medium' | 'high' | 'positive';

export type SignalStatus =
  | 'active'
  | 'awaiting_review'
  | 'under_review'
  | 'action_required'
  | 'reviewed'
  | 'dismissed';

export type SignalType =
  | 'pollution'
  | 'turbidity'
  | 'habitat_improvement'
  | 'wildlife_decline'
  | 'temperature_anomaly'
  | 'algal_bloom';

export interface Site {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export interface Observation {
  id: string;
  siteId: string;
  siteName: string;
  observer: string;
  timestamp: string; // ISO
  waterAppearance: string;
  odour: string;
  waterFlow: string;
  visiblePollution: string;
  vegetationCondition: string;
  wildlifeObserved: string;
  notes?: string;
  hasPhoto: boolean;
  photoCount: number;
}

export interface EvidenceItem {
  id: string;
  type: 'citizen_observation' | 'photograph' | 'timestamp' | 'nearby_observation' | 'data_completeness' | 'ai_validation';
  label: string;
  description: string;
  status: 'verified' | 'pending' | 'flagged';
  weight: number; // 0-100 contribution to confidence
}

export interface EnvironmentalSignal {
  id: string;
  siteName: string;
  region: string;
  type: SignalType;
  title: string;
  description: string;
  concern: ConcernLevel;
  status: SignalStatus;
  confidence: number; // 0-100
  observationCount: number;
  photoCount: number;
  detectedAt: string; // ISO
  lastObserved: string; // ISO
  lat: number;
  lng: number;
  evidence: EvidenceItem[];
  explanation: string;
  recommendedAction: string;
}

export interface DashboardMetrics {
  activeSignals: number;
  observationsToday: number;
  awaitingReview: number;
  evidenceConfidence: number; // avg %
}

export interface ReviewItem {
  signalId: string;
  title: string;
  siteName: string;
  concern: ConcernLevel;
  confidence: number;
  observationCount: number;
  photoCount: number;
  patternDescription: string;
  recommendedAction: string;
  status: SignalStatus;
  detectedAt: string;
}

export interface MapMarker {
  id: string;
  type: 'observation' | 'signal' | 'site';
  label: string;
  lat: number;
  lng: number;
  concern?: ConcernLevel;
  status?: SignalStatus;
  signalType?: SignalType;
}

// =========================================================
// Phase 2A — Database types (Supabase)
// =========================================================

export interface SiteRow {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export type ObservationSource = 'citizen' | 'sensor' | 'officer' | 'imported';

export interface ObservationRow {
  id: string;
  site_id: string | null;
  submitted_at: string;
  water_appearance: string | null;
  odour: string | null;
  water_flow: string | null;
  visible_pollution: string | null;
  vegetation_condition: string | null;
  wildlife_observed: string | null;
  notes: string | null;
  source: ObservationSource;
  is_demo: boolean;
  created_at: string;
}

export interface ObservationPhotoRow {
  id: string;
  observation_id: string;
  storage_path: string;
  created_at: string;
}

export interface ObservationWithSite extends ObservationRow {
  sites: Pick<SiteRow, 'id' | 'name' | 'region' | 'latitude' | 'longitude'> | null;
}

// =========================================================
// Phase 3 — Quality Gate types
// =========================================================

export type QualityGateStatus = 'ready' | 'needs_clarification' | 'insufficient_information';
export type IssueSeverity = 'info' | 'warning';

export interface QualityIssue {
  field: string;
  issue: string;
  severity: IssueSeverity;
}

export interface ClarificationQuestion {
  field: string;
  question: string;
}

export interface EvidenceObservation {
  observation: string;
  detail: string;
}

export interface QualityGateResult {
  overall_status: QualityGateStatus;
  completeness: number;
  issues: QualityIssue[];
  clarification_questions: ClarificationQuestion[];
  evidence_observations: EvidenceObservation[];
  explanation: string;
}

// =========================================================
// Phase 4A — Evidence Chain Backend types
// =========================================================

export type QualityCheckEngineType = 'rules';

export interface ObservationQualityCheckRow {
  id: string;
  observation_id: string;
  overall_status: QualityGateStatus;
  completeness: number;
  issues: QualityIssue[];
  clarification_questions: ClarificationQuestion[];
  evidence_observations: EvidenceObservation[];
  explanation: string | null;
  engine_type: QualityCheckEngineType;
  created_at: string;
}

export type EnvironmentalSignalStatus = 'emerging' | 'monitoring' | 'resolved' | 'dismissed';

export type SignalContributionType = 'primary' | 'corroborating' | 'contextual';

export interface EnvironmentalSignalRow {
  id: string;
  site_id: string | null;
  signal_type: string;
  title: string;
  description: string | null;
  status: EnvironmentalSignalStatus;
  strength: number;
  observation_count: number;
  indicator_count: number;
  time_window_hours: number;
  first_observed_at: string | null;
  last_observed_at: string | null;
  reasoning: unknown[];
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignalObservationRow {
  id: string;
  signal_id: string;
  observation_id: string;
  contribution_type: SignalContributionType | null;
  created_at: string;
}

export type SignalEvidenceType =
  | 'observation_count'
  | 'time_cluster'
  | 'indicator'
  | 'photo'
  | 'quality_check';

export interface SignalEvidenceRow {
  id: string;
  signal_id: string;
  evidence_type: SignalEvidenceType;
  label: string;
  value: string | null;
  source_observation_id: string | null;
  created_at: string;
}

// =========================================================
// Phase 4C — AI Evidence Explanation types
// =========================================================

export interface SignalAIExplanationRow {
  id: string;
  signal_id: string;
  summary: string;
  supporting_evidence: string[];
  uncertainties: string[];
  recommended_review: string | null;
  disclaimer: string;
  provider: string | null;
  model: string | null;
  engine_type: string;
  is_fallback: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignalAIExplanation {
  summary: string;
  supporting_evidence: string[];
  uncertainties: string[];
  recommended_review: string;
  disclaimer: string;
  is_fallback: boolean;
  provider: string | null;
  model: string | null;
}

// =========================================================
// Phase 4D — Human Review types
// =========================================================

export type SignalReviewDecision = 'confirmed_for_follow_up' | 'needs_more_evidence' | 'dismissed';

export interface SignalReviewRow {
  id: string;
  signal_id: string;
  decision: SignalReviewDecision;
  notes: string | null;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
}

// =========================================================
// Phase 5A — One Health Context types
// =========================================================

export interface SignalOneHealthContextRow {
  id: string;
  signal_id: string;
  ecosystem_context: string;
  biodiversity_context: string;
  human_wellbeing_context: string;
  context_notes: string[];
  disclaimer: string;
  engine_type: string;
  created_at: string;
  updated_at: string;
}

export interface SignalOneHealthContext {
  ecosystem_context: string;
  biodiversity_context: string;
  human_wellbeing_context: string;
  context_notes: string[];
  disclaimer: string;
}

// =========================================================
// Phase 5B — FHIR R4 Interoperability types
// =========================================================

export interface FhirCoding {
  system: string;
  code: string;
  display: string;
}

export interface FhirCodeableConcept {
  coding: FhirCoding[];
  text?: string;
}

export interface FhirReference {
  reference: string;
  display?: string;
}

export interface FhirExtension {
  url: string;
  [key: string]: unknown;
}

export interface FhirObservationComponent {
  code: FhirCodeableConcept;
  valueString: string;
}

export interface FhirObservation {
  resourceType: 'Observation';
  id: string;
  status: 'preliminary' | 'final' | 'registered';
  code: FhirCodeableConcept;
  subject?: FhirReference;
  effectiveDateTime?: string;
  effectivePeriod?: { start: string; end: string };
  note?: { text: string }[];
  component: FhirObservationComponent[];
  extension?: FhirExtension[];
}

export interface FhirLocation {
  resourceType: 'Location';
  id: string;
  name: string;
  position?: { latitude: number; longitude: number };
  address?: { city?: string; region?: string; country?: string };
}

export interface FhirMedia {
  resourceType: 'Media';
  id: string;
  status: 'available';
  subject?: FhirReference;
  createdDateTime?: string;
  note?: { text: string }[];
}

export interface FhirBundleEntry {
  fullUrl: string;
  resource: FhirObservation | FhirLocation | FhirMedia;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  type: 'collection';
  timestamp: string;
  entry: FhirBundleEntry[];
}
