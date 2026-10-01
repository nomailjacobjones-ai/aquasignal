# aquasignal

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-yc79sceg)

## FHIR Interoperability

AquaSignal supports a prototype FHIR R4-compatible export of environmental observation and signal data.

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

### Important Disclaimers

- This is **not** formal HL7 certification or conformance testing.
- This is **not** a validated OneAquaHealth profile.
- Environmental observations are citizen reports, not laboratory-confirmed measurements.
- The derived signal is a deterministic pattern detection, not a clinical diagnosis.
- One Health context statements are contextual, not medical advice or disease predictions.
- No patient records, medical records, or personal health information are created or exported.
- The export is local and downloadable — no data is uploaded to any external FHIR server.
