import type {
  EnvironmentalSignalRow,
  ObservationRow,
  ObservationPhotoRow,
  SignalEvidenceRow,
  SignalReviewRow,
  SignalOneHealthContext,
  SignalAIExplanation,
  FhirObservation,
  FhirLocation,
  FhirMedia,
  FhirBundle,
  FhirBundleEntry,
  FhirCodeableConcept,
  FhirCoding,
  FhirExtension,
} from '@/types';

const CS_URL = 'https://aquasignal.app/fhir/CodeSystem/environmental-observation';
const SIGNAL_CS_URL = 'https://aquasignal.app/fhir/CodeSystem/environmental-signal';
const EXT_STRENGTH = 'https://aquasignal.app/fhir/StructureDefinition/evidence-strength';
const EXT_REVIEW = 'https://aquasignal.app/fhir/StructureDefinition/human-review';
const EXT_AI_BRIEF = 'https://aquasignal.app/fhir/StructureDefinition/ai-evidence-brief';
const EXT_ONE_HEALTH = 'https://aquasignal.app/fhir/StructureDefinition/one-health-context';

const componentFields: { field: keyof ObservationRow; code: string; display: string }[] = [
  { field: 'water_appearance', code: 'water-appearance', display: 'Water Appearance' },
  { field: 'odour', code: 'odour', display: 'Odour' },
  { field: 'water_flow', code: 'water-flow', display: 'Water Flow' },
  { field: 'visible_pollution', code: 'visible-pollution', display: 'Visible Pollution' },
  { field: 'vegetation_condition', code: 'vegetation-condition', display: 'Vegetation Condition' },
  { field: 'wildlife_observed', code: 'wildlife-observed', display: 'Wildlife Observed' },
];

function coding(system: string, code: string, display: string): FhirCoding {
  return { system, code, display };
}

function codeableConcept(coding: FhirCoding, text?: string): FhirCodeableConcept {
  const cc: FhirCodeableConcept = { coding: [coding] };
  if (text) cc.text = text;
  return cc;
}

// ── Resource builders ────────────────────────────────────

export function buildLocationResource(site: { id: string; name: string; latitude: number | null; longitude: number | null; city?: string | null; region?: string | null; country?: string | null }): FhirLocation {
  const loc: FhirLocation = {
    resourceType: 'Location',
    id: site.id,
    name: site.name,
  };
  if (site.latitude != null && site.longitude != null) {
    loc.position = { latitude: site.latitude, longitude: site.longitude };
  }
  const address: { city?: string; region?: string; country?: string } = {};
  if (site.city) address.city = site.city;
  if (site.region) address.region = site.region;
  if (site.country) address.country = site.country;
  if (Object.keys(address).length > 0) loc.address = address;
  return loc;
}

export function buildObservationResource(
  obs: ObservationRow,
  siteId: string | null,
): FhirObservation {
  const components = componentFields
    .filter((cf) => {
      const val = obs[cf.field];
      return val != null && val !== '';
    })
    .map((cf) => ({
      code: codeableConcept(coding(CS_URL, cf.code, cf.display), cf.display),
      valueString: String(obs[cf.field]),
    }));

  const resource: FhirObservation = {
    resourceType: 'Observation',
    id: obs.id,
    status: 'preliminary',
    code: codeableConcept(
      coding(CS_URL, 'citizen-environmental-observation', 'Citizen Environmental Observation'),
      'Citizen Environmental Observation',
    ),
    component: components,
  };

  if (siteId) {
    resource.subject = { reference: `Location/${siteId}` };
  }

  if (obs.submitted_at) {
    resource.effectiveDateTime = obs.submitted_at;
  }

  if (obs.notes) {
    resource.note = [{ text: obs.notes }];
  }

  return resource;
}

export function buildMediaResource(
  photo: ObservationPhotoRow,
  obsId: string,
  publicUrl?: string,
): FhirMedia {
  const media: FhirMedia = {
    resourceType: 'Media',
    id: photo.id,
    status: 'available',
    subject: { reference: `Observation/${obsId}` },
  };
  if (photo.created_at) {
    media.createdDateTime = photo.created_at;
  }
  const notes: { text: string }[] = [{ text: 'Citizen photographic evidence' }];
  if (publicUrl) {
    notes.push({ text: `Public URL: ${publicUrl}` });
  }
  media.note = notes;
  return media;
}

export function buildSignalResource(
  signal: EnvironmentalSignalRow,
  siteId: string | null,
  evidence: SignalEvidenceRow[],
  review: SignalReviewRow | null,
  aiExplanation: SignalAIExplanation | null,
  oneHealth: SignalOneHealthContext | null,
): FhirObservation {
  const signalCode = codeableConcept(
    coding(SIGNAL_CS_URL, signal.signal_type, signal.title),
    signal.title,
  );

  const resource: FhirObservation = {
    resourceType: 'Observation',
    id: signal.id,
    status: 'preliminary',
    code: signalCode,
    component: [],
  };

  if (siteId) {
    resource.subject = { reference: `Location/${siteId}` };
  }

  if (signal.first_observed_at && signal.last_observed_at) {
    resource.effectivePeriod = { start: signal.first_observed_at, end: signal.last_observed_at };
  }

  const notes: { text: string }[] = [];
  if (signal.description) {
    notes.push({ text: signal.description });
  }
  const reasoning = (signal.reasoning ?? []) as string[];
  if (reasoning.length > 0) {
    notes.push({ text: `Deterministic reasoning: ${reasoning.join('; ')}` });
  }
  if (evidence.length > 0) {
    notes.push({ text: `Evidence items: ${evidence.map((e) => e.label).join(', ')}` });
  }
  if (notes.length > 0) resource.note = notes;

  // Extensions
  const extensions: FhirExtension[] = [
    { url: EXT_STRENGTH, valueInteger: signal.strength },
    { url: `${EXT_STRENGTH}#description`, valueString: 'AquaSignal deterministic pattern metric (0-100), not a clinical or epidemiological probability.' },
  ];

  if (review) {
    extensions.push({
      url: EXT_REVIEW,
      valueString: `Decision: ${review.decision}${review.notes ? `. Notes: ${review.notes}` : ''}`,
    });
  }

  if (aiExplanation) {
    extensions.push({
      url: EXT_AI_BRIEF,
      valueString: `AI-assisted explanation (is_fallback=${aiExplanation.is_fallback}). Summary: ${aiExplanation.summary}. Disclaimer: ${aiExplanation.disclaimer}`,
    });
  }

  if (oneHealth) {
    extensions.push({
      url: EXT_ONE_HEALTH,
      valueString: `Ecosystem: ${oneHealth.ecosystem_context}. Biodiversity: ${oneHealth.biodiversity_context}. Human wellbeing: ${oneHealth.human_wellbeing_context}. Disclaimer: ${oneHealth.disclaimer}`,
    });
  }

  resource.extension = extensions;

  return resource;
}

export function buildSignalBundle(
  signal: EnvironmentalSignalRow,
  site: { id: string; name: string; latitude: number | null; longitude: number | null; city?: string | null; region?: string | null; country?: string | null } | null,
  observations: ObservationRow[],
  photos: ObservationPhotoRow[],
  photoUrls: Map<string, string>,
  evidence: SignalEvidenceRow[],
  review: SignalReviewRow | null,
  aiExplanation: SignalAIExplanation | null,
  oneHealth: SignalOneHealthContext | null,
): FhirBundle {
  const entries: FhirBundleEntry[] = [];

  // Location
  if (site) {
    entries.push({
      fullUrl: `urn:uuid:${site.id}`,
      resource: buildLocationResource(site),
    });
  }

  // Citizen observations
  for (const obs of observations) {
    entries.push({
      fullUrl: `urn:uuid:${obs.id}`,
      resource: buildObservationResource(obs, site?.id ?? null),
    });
  }

  // Media for photos
  for (const photo of photos) {
    const url = photoUrls.get(photo.id);
    entries.push({
      fullUrl: `urn:uuid:${photo.id}`,
      resource: buildMediaResource(photo, photo.observation_id, url),
    });
  }

  // Derived signal
  entries.push({
    fullUrl: `urn:uuid:${signal.id}`,
    resource: buildSignalResource(signal, site?.id ?? null, evidence, review, aiExplanation, oneHealth),
  });

  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: entries,
  };
}

// ── Native JSON export ────────────────────────────────────

export interface NativeJsonExport {
  signal: {
    id: string;
    title: string;
    signal_type: string;
    status: string;
    description: string | null;
    strength: number;
    observation_count: number;
    indicator_count: number;
    time_window_hours: number;
    first_observed_at: string | null;
    last_observed_at: string | null;
    reasoning: string[];
    is_demo: boolean;
    created_at: string;
  };
  site: {
    id: string;
    name: string;
    region: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  observations: Array<{
    id: string;
    submitted_at: string;
    water_appearance: string | null;
    odour: string | null;
    water_flow: string | null;
    visible_pollution: string | null;
    vegetation_condition: string | null;
    wildlife_observed: string | null;
    notes: string | null;
    source: string;
    photo_count: number;
  }>;
  evidence: Array<{
    id: string;
    evidence_type: string;
    label: string;
    value: string | null;
    source_observation_id: string | null;
  }>;
  quality_checks: Array<{
    observation_id: string;
    overall_status: string;
    completeness: number;
    explanation: string | null;
  }>;
  one_health_context: SignalOneHealthContext | null;
  review: {
    decision: string;
    notes: string | null;
    reviewed_at: string;
  } | null;
  ai_explanation: SignalAIExplanation | null;
}

export function buildNativeJsonExport(
  signal: EnvironmentalSignalRow,
  site: { id: string; name: string; latitude: number | null; longitude: number | null; city?: string | null; region?: string | null } | null,  observations: ObservationRow[],
  evidence: SignalEvidenceRow[],
  qualityChecks: Array<{ observation_id: string; overall_status: string; completeness: number; explanation: string | null }>,
  oneHealth: SignalOneHealthContext | null,
  review: SignalReviewRow | null,
  aiExplanation: SignalAIExplanation | null,
): NativeJsonExport {
  return {
    signal: {
      id: signal.id,
      title: signal.title,
      signal_type: signal.signal_type,
      status: signal.status,
      description: signal.description,
      strength: signal.strength,
      observation_count: signal.observation_count,
      indicator_count: signal.indicator_count,
      time_window_hours: signal.time_window_hours,
      first_observed_at: signal.first_observed_at,
      last_observed_at: signal.last_observed_at,
      reasoning: (signal.reasoning ?? []) as string[],
      is_demo: signal.is_demo,
      created_at: signal.created_at,
    },
    site: site ? {
      id: site.id,
      name: site.name,
      region: site.region,
      city: site.city,
      latitude: site.latitude,
      longitude: site.longitude,
    } : null,
    observations: observations.map((obs) => ({
      id: obs.id,
      submitted_at: obs.submitted_at,
      water_appearance: obs.water_appearance,
      odour: obs.odour,
      water_flow: obs.water_flow,
      visible_pollution: obs.visible_pollution,
      vegetation_condition: obs.vegetation_condition,
      wildlife_observed: obs.wildlife_observed,
      notes: obs.notes,
      source: obs.source,
      photo_count: 0,
    })),
    evidence: evidence.map((e) => ({
      id: e.id,
      evidence_type: e.evidence_type,
      label: e.label,
      value: e.value,
      source_observation_id: e.source_observation_id,
    })),
    quality_checks: qualityChecks,
    one_health_context: oneHealth,
    review: review ? {
      decision: review.decision,
      notes: review.notes,
      reviewed_at: review.reviewed_at,
    } : null,
    ai_explanation: aiExplanation,
  };
}

// ── CSV export ───────────────────────────────────────────

export function buildCsvExport(
  signal: EnvironmentalSignalRow,
  observations: ObservationRow[],
  siteName: string | null,
  review: SignalReviewRow | null,
): string {
  const headers = [
    'observation_id',
    'site_id',
    'site_name',
    'submitted_at',
    'water_appearance',
    'odour',
    'water_flow',
    'visible_pollution',
    'vegetation_condition',
    'wildlife_observed',
    'notes',
    'signal_id',
    'signal_type',
    'evidence_strength',
    'review_decision',
  ];

  const rows = observations.map((obs) => [
    obs.id,
    obs.site_id ?? '',
    siteName ?? '',
    obs.submitted_at,
    obs.water_appearance ?? '',
    obs.odour ?? '',
    obs.water_flow ?? '',
    obs.visible_pollution ?? '',
    obs.vegetation_condition ?? '',
    obs.wildlife_observed ?? '',
    (obs.notes ?? '').replace(/"/g, '""'),
    signal.id,
    signal.signal_type,
    String(signal.strength),
    review?.decision ?? '',
  ]);

  const csvLines = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))];
  return csvLines.join('\n');
}

// ── Download helpers ──────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadFhir(bundle: FhirBundle, signalId: string): void {
  downloadFile(JSON.stringify(bundle, null, 2), `aquasignal-fhir-r4-${signalId}.json`, 'application/fhir+json');
}

export function downloadNativeJson(data: NativeJsonExport, signalId: string): void {
  downloadFile(JSON.stringify(data, null, 2), `aquasignal-export-${signalId}.json`, 'application/json');
}

export function downloadCsv(csv: string, signalId: string): void {
  downloadFile(csv, `aquasignal-observations-${signalId}.csv`, 'text/csv');
}
