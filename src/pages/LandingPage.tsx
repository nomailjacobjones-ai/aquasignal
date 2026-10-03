import { Link } from 'react-router-dom';
import {
  Droplets, Eye, Brain, Link2, Shield, Activity, FileJson, ArrowRight,
  Users, Camera, ClipboardCheck, Globe2, Leaf, HeartPulse, Bird,
} from 'lucide-react';
import { InfoBanner } from '@/components/ui/InfoBanner';

const workflowSteps = [
  { label: 'Observe', icon: Eye, description: 'Citizens report freshwater conditions' },
  { label: 'Validate', icon: Brain, description: 'AI quality gate checks consistency' },
  { label: 'Understand', icon: Link2, description: 'Evidence chain builds the signal' },
  { label: 'Act', icon: ClipboardCheck, description: 'Experts review and decide' },
];

const problemPoints = [
  { icon: Users, title: 'Scattered observations', text: 'Citizen reports of freshwater conditions are often fragmented, inconsistent, and hard to compare.' },
  { icon: Camera, title: 'Lost evidence', text: 'Valuable community knowledge — photographs, field notes, patterns — rarely reaches decision-makers in a usable form.' },
  { icon: Activity, title: 'Slow response', text: 'Without structured evidence, environmental officers struggle to prioritise which sites need attention.' },
];

const howItWorks = [
  { icon: Eye, title: 'Citizen Observation', text: 'Community members report what they see — water appearance, odour, flow, vegetation, wildlife — using simple citizen-friendly language.' },
  { icon: Brain, title: 'AI Quality Gate', text: 'Each observation passes through an AI quality gate that checks consistency, flags incomplete data, and organises related reports.' },
  { icon: Link2, title: 'Evidence Chain', text: 'Related observations are linked into an explainable evidence chain — every signal shows exactly why it was generated.' },
  { icon: ClipboardCheck, title: 'Human Review', text: 'Environmental experts review the evidence, request follow-up, and decide on action. AI recommends; humans decide.' },
];

const oneHealthPillars = [
  { icon: Leaf, title: 'Ecosystem Health', text: 'Clean waterways, functioning habitats, and natural flow regimes.' },
  { icon: Bird, title: 'Biodiversity', text: 'Diverse plant and animal communities that depend on healthy freshwater systems.' },
  { icon: HeartPulse, title: 'Human Wellbeing', text: 'Safe water for recreation, livelihoods, and community health.' },
];

export function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-aqua-50/60 via-white to-sand-50" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aqua-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aqua-50 border border-aqua-100 text-aqua-700 text-sm font-medium mb-6">
              <Droplets className="w-4 h-4" />
              IEEE OneAquaHealth Global Hackathon 2026
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold text-sand-900 leading-[1.1] text-balance">
              From citizen observations to trusted One Health action.
            </h1>
            <p className="mt-6 text-lg text-sand-600 leading-relaxed max-w-2xl">
              AquaSignal helps communities turn freshwater observations into explainable environmental signals —
              giving researchers and decision-makers the evidence they need to review what matters.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/report" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium bg-aqua-700 text-white rounded-xl hover:bg-aqua-800 transition-colors shadow-soft">
                Report an Observation
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link to="/signals" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium bg-white text-aqua-800 rounded-xl border border-aqua-200 hover:bg-aqua-50 transition-colors shadow-soft">
                Explore Signals
              </Link>
            </div>
          </div>

          {/* Compact workflow */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="relative surface p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-aqua-50 text-aqua-700 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-semibold text-aqua-600 tabular-nums">0{idx + 1}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-sand-900">{step.label}</h3>
                  <p className="text-xs text-sand-500 mt-1 leading-relaxed">{step.description}</p>
                  {idx < workflowSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-300" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-sand-900">The problem</h2>
            <p className="mt-3 text-lg text-sand-600">
              Freshwater ecosystems are under pressure. Communities see the changes — but that knowledge rarely reaches the people who can act.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {problemPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.title} className="surface p-6">
                  <div className="w-12 h-12 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-sand-900">{point.title}</h3>
                  <p className="mt-2 text-sm text-sand-600 leading-relaxed">{point.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How AquaSignal Works */}
      <section className="py-16 sm:py-20 bg-white border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-sand-900">How AquaSignal works</h2>
            <p className="mt-3 text-lg text-sand-600">
              A structured path from what a citizen sees to what an expert can act on.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorks.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  <div className="surface p-6 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-aqua-700 text-white flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-display font-semibold text-sand-200 tabular-nums">{idx + 1}</span>
                    </div>
                    <h3 className="text-base font-semibold text-sand-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-sand-600 leading-relaxed">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Evidence Chain */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-sand-900">Evidence Chain</h2>
              <p className="mt-3 text-lg text-sand-600 leading-relaxed">
                Every signal in AquaSignal is built on a transparent chain of evidence. No black boxes —
                each step from observation to signal is visible and explainable.
              </p>
              <ul className="mt-6 space-y-3">
                {['Citizen observations are linked by site and time', 'AI organises and cross-references related reports', 'Every evidence item carries a weight and status', 'Experts can trace any signal back to its source'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-sand-700">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-aqua-100 text-aqua-700 flex items-center justify-center mt-0.5">
                      <Link2 className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signals" className="mt-6 inline-flex items-center gap-1.5 text-aqua-700 font-medium hover:text-aqua-800 transition-colors">
                See an example evidence chain
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="surface p-6">
              <div className="space-y-3">
                {['Observation', 'Validation', 'Corroboration', 'Signal', 'Human Review'].map((step, idx) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-aqua-50 border-2 border-aqua-300 flex items-center justify-center text-aqua-700 text-xs font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 surface-soft px-4 py-2.5">
                      <span className="text-sm font-medium text-sand-800">{step}</span>
                    </div>
                    {idx < 4 && <div className="text-sand-300 text-xl" aria-hidden="true">↓</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Human-in-the-loop AI */}
      <section className="py-16 sm:py-20 bg-aqua-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-aqua-800/40 rounded-full blur-3xl" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aqua-800/60 border border-aqua-700 text-aqua-200 text-sm font-medium mb-6">
                <Brain className="w-4 h-4" />
                Human-in-the-loop AI
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white">AI supports. Humans decide.</h2>
              <p className="mt-4 text-lg text-aqua-100 leading-relaxed">
                AquaSignal's AI assists with data quality, pattern organisation, and explanation.
                It does not replace environmental experts. Every signal is a recommendation —
                not a conclusion.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Brain className="w-5 h-5 text-aqua-300 mb-2" />
                  <p className="text-sm font-medium text-white">AI does</p>
                  <p className="text-sm text-aqua-200 mt-1">Quality checks, pattern detection, evidence organisation, explanation</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <Shield className="w-5 h-5 text-aqua-300 mb-2" />
                  <p className="text-sm font-medium text-white">Humans do</p>
                  <p className="text-sm text-aqua-200 mt-1">Interpretation, field verification, action, and final authority</p>
                </div>
              </div>
            </div>
            <div className="surface bg-white p-6">
              <InfoBanner type="info" title="Responsible AI principle">
                AI assists with data quality, pattern organisation and explanation. Environmental experts remain
                responsible for final interpretation and action.
              </InfoBanner>
              <div className="mt-4 space-y-2.5">
                {[
                  'Observations are never auto-confirmed as environmental facts',
                  'Incomplete data is flagged, not hidden',
                  'Every signal explains why it was generated',
                  'Experts can dismiss any signal at any time',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-sand-700">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 text-success-700 flex items-center justify-center mt-0.5">
                      <Shield className="w-3 h-3" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One Health */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-sand-900">One Health</h2>
            <p className="mt-3 text-lg text-sand-600">
              The health of freshwater ecosystems, biodiversity, animals, and people are deeply connected.
              AquaSignal is built around this principle.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {oneHealthPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="surface p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-sand-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-sand-600 leading-relaxed">{pillar.text}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 max-w-3xl mx-auto">
            <InfoBanner type="info">
              AquaSignal does not diagnose disease or prove causation. It helps surface patterns so experts can
              investigate further.
            </InfoBanner>
          </div>
        </div>
      </section>

      {/* Action Centre */}
      <section className="py-16 sm:py-20 bg-white border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 surface p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="chip bg-amber-50 text-amber-700 border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Awaiting review
                  </span>
                </div>
                <span className="text-sm font-semibold text-sand-900 tabular-nums">78%</span>
              </div>
              <h3 className="text-lg font-semibold text-sand-900">Possible pollution event</h3>
              <p className="text-sm text-sand-500 mt-1">Riverside Site A · 4 observations · 48-hour pattern</p>
              <div className="mt-4 pt-4 border-t border-sand-100">
                <p className="text-sm text-sand-600 mb-1">Recommended next action:</p>
                <p className="text-sm font-medium text-sand-800">Review photographic evidence and consider field verification.</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-aqua-700 text-white">Review Evidence</span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-sand-300 text-sand-700">Request Follow-up</span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-sand-300 text-sand-700">Mark Reviewed</span>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-sand-900">Action Centre</h2>
              <p className="mt-3 text-lg text-sand-600 leading-relaxed">
                Environmental officers get a clear, prioritised view of signals that need attention —
                with evidence, confidence levels, and recommended actions attached.
              </p>
              <ul className="mt-6 space-y-3">
                {['Prioritised queue by concern and confidence', 'Full evidence chain attached to each signal', 'Clear status tracking from review to action', 'AI recommends next steps — humans decide'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-sand-700">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-aqua-100 text-aqua-700 flex items-center justify-center mt-0.5">
                      <ClipboardCheck className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/review" className="mt-6 inline-flex items-center gap-1.5 text-aqua-700 font-medium hover:text-aqua-800 transition-colors">
                Visit the Action Centre
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interoperability */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand-100 border border-sand-200 text-sand-700 text-sm font-medium mb-4">
              <FileJson className="w-4 h-4" />
              Interoperability
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-sand-900">Built to connect</h2>
            <p className="mt-3 text-lg text-sand-600">
              AquaSignal is designed for interoperable export, so signals can feed into existing environmental and public health workflows.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="surface p-6">
              <Globe2 className="w-8 h-8 text-aqua-600 mb-3" />
              <h3 className="text-base font-semibold text-sand-900">Standard formats</h3>
              <p className="mt-2 text-sm text-sand-600 leading-relaxed">Structured export designed for environmental data standards and health information systems.</p>
            </div>
            <div className="surface p-6">
              <FileJson className="w-8 h-8 text-aqua-600 mb-3" />
              <h3 className="text-base font-semibold text-sand-900">Evidence packages</h3>
              <p className="mt-2 text-sm text-sand-600 leading-relaxed">Each signal exports with its full evidence chain — observations, photos, and explanation intact.</p>
            </div>
            <div className="surface p-6">
              <Link2 className="w-8 h-8 text-aqua-600 mb-3" />
              <h3 className="text-base font-semibold text-sand-900">API-ready</h3>
              <p className="mt-2 text-sm text-sand-600 leading-relaxed">Phase 2 will expose signals through a clean API for integration with decision-support systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-aqua-50 to-sand-50 border-t border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-sand-900 text-balance">
            Help turn what your community sees into action that matters.
          </h2>
          <p className="mt-4 text-lg text-sand-600">
            Report a freshwater observation, explore active signals, or follow a guided demonstration.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/report" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium bg-aqua-700 text-white rounded-xl hover:bg-aqua-800 transition-colors shadow-soft">
              Report an Observation
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link to="/demo" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium bg-white text-aqua-800 rounded-xl border border-aqua-200 hover:bg-aqua-50 transition-colors shadow-soft">
              Try the Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
