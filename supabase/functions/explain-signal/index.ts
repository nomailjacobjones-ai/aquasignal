// Phase 4C — AI Evidence Explanation Edge Function
// Receives a signal_id, gathers the deterministic evidence chain from the database,
// sends a compact evidence package to an AI provider (if configured), and returns
// a validated structured explanation. Falls back to a deterministic explanation
// if no AI secret is set, the provider is unavailable, or the response is malformed.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

interface AIExplanationResponse {
  summary: string;
  supporting_evidence: string[];
  uncertainties: string[];
  recommended_review: string;
  disclaimer: string;
}

const SYSTEM_PROMPT = `You are an evidence explanation assistant for an environmental decision-support prototype. You do not create environmental conclusions. You explain only the structured evidence supplied to you. Never invent observations, measurements, photographs, causes, diagnoses, probabilities, or facts. Distinguish observations from interpretations. State uncertainty explicitly. Recommend human verification when evidence is incomplete. Do not provide medical diagnosis or claim environmental causation.

You must respond with a JSON object matching this schema exactly:
{
  "summary": "A concise explanation of why the deterministic engine identified this pattern (2-4 sentences).",
  "supporting_evidence": ["Factual evidence statement 1", "Factical evidence statement 2", ...],
  "uncertainties": ["Limitation 1", "Limitation 2", ...],
  "recommended_review": "A concise suggestion for what a human reviewer should verify next.",
  "disclaimer": "A statement that this is decision support, not a scientific diagnosis or confirmation."
}

Do not include any text outside the JSON object.`;

function buildFallbackExplanation(pkg: EvidencePackage): AIExplanationResponse {
  const evidenceStatements: string[] = [];
  for (const r of pkg.reasoning) {
    evidenceStatements.push(r);
  }
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

  const photoCount = pkg.observationSummaries.filter(o => o.hasPhoto).length;
  if (photoCount > 0) {
    evidenceStatements.push(`${photoCount} observation${photoCount !== 1 ? 's include' : ' includes'} photographic evidence.`);
  }

  return {
    summary: `${pkg.observationCount} observations were recorded at ${pkg.siteName} within the configured ${pkg.timeWindowHours}-hour window. Multiple observations contained related environmental indicators, leading the deterministic engine to identify a "${pkg.signalTitle}" pattern. Evidence strength is ${pkg.evidenceStrength}/100.`,
    supporting_evidence: evidenceStatements,
    uncertainties,
    recommended_review: 'A qualified environmental professional should verify the reported indicators on-site, review any available photographs, and assess whether the pattern warrants further investigation or monitoring.',
    disclaimer: 'This is a deterministic evidence summary generated from citizen observations. It is decision support, not a scientific diagnosis, confirmed contamination, or environmental emergency declaration.',
  };
}

function validateAIResponse(obj: unknown): obj is AIExplanationResponse {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.summary === 'string' && o.summary.length > 0 &&
    Array.isArray(o.supporting_evidence) && o.supporting_evidence.every((e) => typeof e === 'string') &&
    Array.isArray(o.uncertainties) && o.uncertainties.every((u) => typeof u === 'string') &&
    typeof o.recommended_review === 'string' &&
    typeof o.disclaimer === 'string' && o.disclaimer.length > 0
  );
}

async function callAIProvider(pkg: EvidencePackage): Promise<AIExplanationResponse | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;

  const userContent = `Explain the following environmental evidence pattern. Respond only with the JSON schema.

Signal: ${pkg.signalTitle} (${pkg.signalType})
Site: ${pkg.siteName}
Status: ${pkg.status}
Evidence Strength: ${pkg.evidenceStrength}/100
Observations: ${pkg.observationCount}
Indicators: ${pkg.indicatorCount}
Time Window: ${pkg.timeWindowHours} hours
First Observed: ${pkg.firstObserved ?? 'N/A'}
Last Observed: ${pkg.lastObserved ?? 'N/A'}

Deterministic Reasoning:
${pkg.reasoning.map((r) => `- ${r}`).join('\n')}

Evidence Items:
${pkg.evidenceItems.map((e) => `- ${e.label}: ${e.value ?? 'recorded'}`).join('\n')}

Observation Summaries:
${pkg.observationSummaries.map((o, i) => `  ${i + 1}. ${o.submittedAt} — Appearance: ${o.waterAppearance ?? 'N/A'}, Odour: ${o.odour ?? 'N/A'}, Flow: ${o.waterFlow ?? 'N/A'}, Pollution: ${o.visiblePollution ?? 'N/A'}, Vegetation: ${o.vegetationCondition ?? 'N/A'}, Wildlife: ${o.wildlifeObserved ?? 'N/A'}, Contribution: ${o.contributionType ?? 'N/A'}, Photo: ${o.hasPhoto ? 'yes' : 'no'}, Quality: ${o.qualityStatus ?? 'N/A'}`).join('\n')}

Incomplete observations: ${pkg.incompleteCount}`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return null;

    const parsed = JSON.parse(content);
    if (!validateAIResponse(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { signal_id, evidence_package } = body;

    if (typeof signal_id !== 'string') {
      return new Response(JSON.stringify({ error: 'signal_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!evidence_package || typeof evidence_package !== 'object') {
      return new Response(JSON.stringify({ error: 'evidence_package is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pkg = evidence_package as EvidencePackage;

    // Try AI provider, fall back to deterministic explanation
    const aiResult = await callAIProvider(pkg);
    const isFallback = aiResult === null;
    const explanation = aiResult ?? buildFallbackExplanation(pkg);

    return new Response(JSON.stringify({
      signal_id,
      ...explanation,
      is_fallback: isFallback,
      provider: isFallback ? null : 'openai',
      model: isFallback ? null : 'gpt-4o-mini',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
