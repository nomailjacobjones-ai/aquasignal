import { Link } from 'react-router-dom';
import { Play, ArrowRight, Eye, Brain, Link2, ClipboardCheck, Clock, MapPin, Camera, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { InfoBanner } from '@/components/ui/InfoBanner';

const demoSteps = [
  { icon: Eye, title: 'Citizen Observation', description: 'A community member reports cloudy water and chemical odour at Riverside Site A.', duration: '~2 min' },
  { icon: Brain, title: 'AI Quality Gate', description: 'The observation passes consistency checks and is linked to 3 similar reports.', duration: 'Instant' },
  { icon: Link2, title: 'Evidence Chain', description: 'AquaSignal builds an evidence chain with 4 observations, 4 photographs, and a 48-hour pattern.', duration: 'Instant' },
  { icon: ClipboardCheck, title: 'Human Review', description: 'An environmental officer reviews the evidence and requests field verification.', duration: '~3 min' },
];

export function DemoPage() {
  return (
    <>
      <PageHeader
        title="AquaSignal Demo"
        subtitle="Follow one environmental event from the first citizen observation to human review."
        icon={<Play className="w-5.5 h-5.5" />}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Demo' }]}
      />

      {/* Hero CTA */}
      <div className="surface p-8 sm:p-12 text-center bg-gradient-to-b from-aqua-50/50 to-white mb-8">
        <div className="w-16 h-16 rounded-2xl bg-aqua-700 text-white flex items-center justify-center mx-auto mb-5">
          <Play className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-sand-900 text-balance">
          Follow a real environmental event from start to finish
        </h2>
        <p className="mt-3 text-sand-600 max-w-xl mx-auto leading-relaxed">
          This guided demo walks you through a possible pollution event at Riverside Site A — from the first
          citizen report through AI quality checks, evidence chain building, and expert review.
        </p>
        <Link
          to="/report"
          className="mt-6 inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium bg-aqua-700 text-white rounded-xl hover:bg-aqua-800 transition-colors shadow-soft"
        >
          <Play className="w-5 h-5" />
          Start Demo
        </Link>
      </div>

      {/* Demo steps preview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-sand-900 mb-4">What you'll see</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {demoSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="surface p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-sand-900">
                        <span className="text-aqua-600 tabular-nums">0{idx + 1}.</span> {step.title}
                      </h4>
                      <span className="flex items-center gap-1 text-xs text-sand-400">
                        <Clock className="w-3 h-3" />
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-sm text-sand-600 mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The story */}
      <div className="surface p-6 sm:p-8 mb-8">
        <h3 className="text-lg font-semibold text-sand-900 mb-4">The story</h3>
        <div className="space-y-4 text-sm text-sand-700 leading-relaxed">
          <p>
            On the morning of September 25th, a local resident — <strong>S. Williams</strong> — noticed an oily
            sheen and faint chemical smell near the drainage pipe outlet at <strong>Riverside Site A</strong>.
            They submitted an observation through AquaSignal, including a photograph of the surface foam.
          </p>
          <p>
            Later that afternoon, <strong>R. Okafor</strong> visited the same site and reported similar conditions —
            cloudy water and surface foam, though without the chemical odour. The next morning, two more
            observers — <strong>M. Chen</strong> and <strong>J. Patel</strong> — filed reports describing the
            same pattern: foam, sheen, and reduced wildlife near the outlet.
          </p>
          <p>
            AquaSignal's AI quality gate linked these four observations by site and time, identified a recurring
            48-hour pattern, and generated an <strong>environmental signal</strong> with 78% evidence confidence.
            The signal was sent to the Human Review queue with a recommended action: review photographic evidence
            and consider field verification.
          </p>
          <p>
            An environmental officer reviewed the evidence chain, confirmed the pattern was credible, and
            requested follow-up field assessment. The entire journey — from first observation to human
            decision — was transparent, traceable, and explainable.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="surface-soft p-3 text-center">
            <Users className="w-5 h-5 text-aqua-600 mx-auto mb-1" />
            <p className="text-xs text-sand-500">Observers</p>
            <p className="text-sm font-semibold text-sand-900">4 citizens</p>
          </div>
          <div className="surface-soft p-3 text-center">
            <Camera className="w-5 h-5 text-aqua-600 mx-auto mb-1" />
            <p className="text-xs text-sand-500">Photographs</p>
            <p className="text-sm font-semibold text-sand-900">4 photos</p>
          </div>
          <div className="surface-soft p-3 text-center">
            <Clock className="w-5 h-5 text-aqua-600 mx-auto mb-1" />
            <p className="text-xs text-sand-500">Pattern</p>
            <p className="text-sm font-semibold text-sand-900">48 hours</p>
          </div>
          <div className="surface-soft p-3 text-center">
            <MapPin className="w-5 h-5 text-aqua-600 mx-auto mb-1" />
            <p className="text-xs text-sand-500">Confidence</p>
            <p className="text-sm font-semibold text-sand-900">78%</p>
          </div>
        </div>
      </div>

      {/* Navigation to real pages */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link to="/report" className="surface p-5 hover:shadow-card hover:border-aqua-200 transition-all group">
          <Eye className="w-6 h-6 text-aqua-600 mb-3" />
          <h4 className="text-sm font-semibold text-sand-900 group-hover:text-aqua-800 transition-colors">Try the report form</h4>
          <p className="text-xs text-sand-500 mt-1">Step through the citizen observation workflow yourself.</p>
        </Link>
        <Link to="/signals/sig-001" className="surface p-5 hover:shadow-card hover:border-aqua-200 transition-all group">
          <Link2 className="w-6 h-6 text-aqua-600 mb-3" />
          <h4 className="text-sm font-semibold text-sand-900 group-hover:text-aqua-800 transition-colors">View the evidence chain</h4>
          <p className="text-xs text-sand-500 mt-1">See the full evidence chain for this signal.</p>
        </Link>
        <Link to="/review" className="surface p-5 hover:shadow-card hover:border-aqua-200 transition-all group">
          <ClipboardCheck className="w-6 h-6 text-aqua-600 mb-3" />
          <h4 className="text-sm font-semibold text-sand-900 group-hover:text-aqua-800 transition-colors">Visit the Action Centre</h4>
          <p className="text-xs text-sand-500 mt-1">Review signals and make decisions as an expert would.</p>
        </Link>
      </div>

      <InfoBanner type="info" title="Guided demo coming in Phase 2">
        This page currently links to the real pages so you can explore the journey manually. In Phase 2, this will
        become an automated, step-by-step guided walkthrough with narration and highlights.
      </InfoBanner>
    </>
  );
}
