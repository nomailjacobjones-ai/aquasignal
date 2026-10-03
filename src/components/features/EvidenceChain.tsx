import { useState } from 'react';
import type { EvidenceItem } from '@/types';
import { EvidenceCard } from './EvidenceCard';
import { ChevronDown, Link2 } from 'lucide-react';

interface EvidenceChainProps {
  evidence: EvidenceItem[];
  explanation: string;
}

const chainSteps = [
  { label: 'Observation', icon: 'observation', description: 'Citizen reports environmental conditions' },
  { label: 'Validation', icon: 'validation', description: 'Quality Gate checks consistency' },
  { label: 'Corroboration', icon: 'corroboration', description: 'Multiple observations cross-referenced' },
  { label: 'Signal', icon: 'signal', description: 'Pattern identified and evidence organised' },
  { label: 'Human Review', icon: 'review', description: 'Expert reviews and decides on action' },
];

export function EvidenceChain({ evidence, explanation }: EvidenceChainProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Chain visualization */}
      <div className="surface p-6">
        <h3 className="text-base font-semibold text-sand-900 mb-1">Evidence Chain</h3>
        <p className="text-sm text-sand-500 mb-6">How observations become trusted environmental signals</p>

        <ol className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-aqua-200 via-aqua-300 to-aqua-200" aria-hidden="true" />

          {chainSteps.map((step, idx) => (
            <li key={step.label} className="relative flex items-start gap-4 pb-6 last:pb-0">
              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-aqua-300 flex items-center justify-center text-aqua-700 font-semibold text-sm shadow-soft">
                {idx + 1}
              </div>
              <div className="flex-1 pt-1.5">
                <h4 className="text-sm font-semibold text-sand-900">{step.label}</h4>
                <p className="text-sm text-sand-500 mt-0.5">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Evidence cards */}
      <div>
        <h3 className="text-base font-semibold text-sand-900 mb-4">Supporting Evidence</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {evidence.map((item) => (
            <EvidenceCard key={item.id} evidence={item} />
          ))}
        </div>
      </div>

      {/* Expandable explanation */}
      <div className="surface overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-sand-50 transition-colors"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-sand-900">Why was this signal generated?</h3>
              <p className="text-sm text-sand-500">Transparent explanation of the deterministic pattern detection</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-sand-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className="px-5 pb-5 animate-fade-in">
            <div className="pt-4 border-t border-sand-100">
              <p className="text-sm text-sand-700 leading-relaxed">{explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
