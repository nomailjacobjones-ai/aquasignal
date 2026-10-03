# aquasignal

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-yc79sceg)

AquaSignal is a prototype environmental intelligence platform that turns citizen freshwater observations into explainable environmental signals. It was built for the IEEE OneAquaHealth Global Hackathon 2026.

## What AquaSignal does

Communities report what they see at freshwater sites — water appearance, odour, flow, vegetation condition, visible pollution, and wildlife. AquaSignal organises those reports through a structured pipeline:

1. **Citizen Observation** — Community members submit structured observations with optional photographs.
2. **Quality Gate** — A deterministic rules engine checks each observation for completeness and internal consistency before it is treated as stronger evidence.
3. **Signal Engine** — Multiple observations at the same site within a time window are evaluated for recurring indicators. If the deterministic thresholds are met, an environmental signal is generated with an evidence-strength score (0–100).
4. **Evidence Chain** — Every signal is traceable to its source observations, indicators, and quality checks. Nothing is hidden.
5. **AI Evidence Brief** — An AI-assisted explanation of the evidence is generated through a secure Edge Function. If no AI provider is configured, a deterministic fallback is used — clearly labelled as a "Deterministic evidence summary", never as AI-generated.
6. **One Health Context** — Cautious contextual statements about why a detected pattern may matter for ecosystem health, biodiversity, and human wellbeing. These are context, not medical diagnoses, disease predictions, or causation claims.
7. **Human Review** — Environmental experts review signals and decide whether to request follow-up, ask for more evidence, or dismiss. AI assists; humans decide.
8. **FHIR Interoperability Export** — The evidence package can be exported as FHIR R4-compatible JSON, native JSON, or CSV.

## Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL database, storage, Edge Functions)
- **Icons:** Lucide React
- **Routing:** React Router

### Key services

| Service | Purpose |
|---------|---------|
| `observationService.ts` | Citizen observation submission + photo upload |
| `qualityGate.ts` | Deterministic quality-check rules engine |
| `signalEngine.ts` | Deterministic signal detection from observation patterns |
| `evidenceService.ts` | Signal CRUD, evidence chain, observation linking |
| `aiExplanationService.ts` | AI Evidence Brief generation + deterministic fallback |
| `oneHealthService.ts` | Deterministic One Health context generation |
| `reviewService.ts` | Human review workflow |
| `fhirService.ts` | FHIR R4-compatible export, native JSON, CSV |
| `dashboardService.ts` | Dashboard metrics, site/observation queries |

### Database tables

- `sites` — Monitoring locations with coordinates
- `observations` — Citizen environmental reports
- `observation_photos` — Photo metadata linked to observations
- `observation_quality_checks` — Quality gate results per observation
- `environmental_signals` — Detected environmental patterns
- `signal_observations` — Signal-to-observation links
- `signal_evidence` — Evidence items supporting each signal
- `signal_ai_explanations` — AI Evidence Briefs (one per signal)
- `signal_reviews` — Human review decisions (one per signal)
- `signal_one_health_context` — One Health context statements (one per signal)

All tables have Row Level Security enabled.

## FHIR Interoperability

AquaSignal supports a **FHIR R4-compatible prototype export** of environmental observation and signal data.

### Resources

- **Observation** — Citizen environmental observations are represented as FHIR R4 `Observation` resources with `status: preliminary`. Each observation uses `Observation.component` for structured fields (water appearance, odour, water flow, visible pollution, vegetation condition, wildlife observed) with `valueString` values. Qualitative citizen selections are never converted to fake numeric measurements.
- **Location** — Monitoring sites are represented as FHIR `Location` resources with name, position (latitude/longitude), and address fields where real data exists. Coordinates come from the actual site record — no fabricated values.
- **Media** — Observation photographs are represented as FHIR `Media` metadata (not embedded binaries). Each Media resource references its parent Observation and includes the public storage URL where available.
- **Bundle** — All resources for a signal are grouped in a FHIR `Bundle` with `type: collection`. The bundle includes Location, citizen Observations, Media, and a derived signal Observation.

### Custom Coding System

AquaSignal uses a prototype coding system for environmental concepts:

```
https://aquasignal.app/fhir/CodeSystem/environmental-observation
```

Codes: `water-appearance`, `odour`, `water-flow`, `visible-pollution`, `vegetation-condition`, `wildlife-observed`

Signal types use:

```
https://aquasignal.app/fhir/CodeSystem/environmental-signal
```

### Extensions

- **Evidence Strength** (`https://aquasignal.app/fhir/StructureDefinition/evidence-strength`) — Integer 0-100. Evidence Strength is an AquaSignal deterministic pattern metric, not a clinical or epidemiological probability.
- **Human Review** (`https://aquasignal.app/fhir/StructureDefinition/human-review`) — Reviewer decision and notes.
- **AI Evidence Brief** (`https://aquasignal.app/fhir/StructureDefinition/ai-evidence-brief`) — AI-assisted explanation, preserved as narrative with disclaimer.
- **One Health Context** (`https://aquasignal.app/fhir/StructureDefinition/one-health-context`) — Contextual statements, clearly labeled as context, not clinical observations.

### Example

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "timestamp": "2026-10-01T12:00:00Z",
  "entry": [
    {
      "fullUrl": "urn:uuid:site-uuid",
      "resource": {
        "resourceType": "Location",
        "id": "site-uuid",
        "name": "Riverside Site A",
        "position": { "latitude": -33.8, "longitude": 151.2 }
      }
    },
    {
      "fullUrl": "urn:uuid:obs-uuid",
      "resource": {
        "resourceType": "Observation",
        "id": "obs-uuid",
        "status": "preliminary",
        "code": {
          "coding": [{
            "system": "https://aquasignal.app/fhir/CodeSystem/environmental-observation",
            "code": "citizen-environmental-observation",
            "display": "Citizen Environmental Observation"
          }]
        },
        "subject": { "reference": "Location/site-uuid" },
        "effectiveDateTime": "2026-09-30T10:00:00Z",
        "component": [
          {
            "code": {
              "coding": [{
                "system": "https://aquasignal.app/fhir/CodeSystem/environmental-observation",
                "code": "water-appearance",
                "display": "Water Appearance"
              }]
            },
            "valueString": "brown"
          }
        ]
      }
    }
  ]
}
```

### OAH-FHIR status

The OneAquaHealth FHIR Implementation Guide exists as a **draft CI build (version 0.1.0-ci-build)** at `http://hl7.eu/fhir/ig/oah/`. AquaSignal's export is a **FHIR R4-compatible prototype** and does not claim formal conformance to the draft OAH-FHIR profiles. The OAH IG is still in draft and profiles may change. When the IG stabilises, the exporter can be aligned to specific OAH profiles.

### Important Disclaimers

- This is **not** formal HL7 certification or conformance testing.
- This is **not** a validated OneAquaHealth FHIR profile.
- Environmental observations are citizen reports, not laboratory-confirmed measurements.
- The derived signal is a deterministic pattern detection, not a clinical diagnosis.
- One Health context statements are contextual, not medical advice or disease predictions.
- No patient records, medical records, or personal health information are created or exported.
- The export is local and downloadable — no data is uploaded to any external FHIR server.

## Setup

### Environment variables

The following are pre-configured in the Bolt environment:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key (public, read-only client access)

No secrets are exposed in client code. The `OPENAI_API_KEY` for the AI Evidence Brief Edge Function is optional and stored server-side only. If not configured, the deterministic fallback is used.

### Running locally

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run typecheck
```

## Limitations

- AquaSignal is a prototype. It does not diagnose disease, establish exposure, or prove causation.
- Environmental signals are generated by deterministic pattern detection from citizen observations. They have not been scientifically validated.
- AI assists with explanation. Environmental experts remain responsible for interpretation and action.
- The FHIR export is a prototype R4-compatible package, not a formally conformant implementation.
- The OAH-FHIR Implementation Guide is still in draft CI build status.
- No authentication is implemented. The prototype uses anon-level Supabase access with RLS policies.
- Prototype data is seeded for demonstration at Riverside Site A.
