import { Info, Droplets, Leaf, Bird, HeartPulse, Brain, Shield, Users, Link2, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/PageHeader';
import { InfoBanner } from '@/components/ui/InfoBanner';

export function AboutPage() {
  return (
    <>
      <PageHeader
        title="About AquaSignal"
        subtitle="Connecting citizen science with environmental decision support for healthier freshwater ecosystems."
        icon={<Info className="w-5.5 h-5.5" />}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      {/* What is AquaSignal? */}
      <section className="mb-12">
        <div className="surface p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-semibold text-sand-900">What is AquaSignal?</h2>
          </div>
          <p className="text-sand-600 leading-relaxed">
            AquaSignal is a human-in-the-loop environmental intelligence platform that transforms citizen freshwater
            observations into explainable environmental signals. It helps communities, researchers, and
            decision-makers work together — turning scattered field reports into structured, traceable evidence
            that experts can review and act on with confidence.
          </p>
          <p className="mt-4 text-sand-600 leading-relaxed">
            The platform is built for the <strong>IEEE OneAquaHealth Global Hackathon 2026</strong> and is currently
            in its prototype phase. It demonstrates how citizen science, responsible AI, and expert review can
            work together to support One Health outcomes for freshwater ecosystems.
          </p>
        </div>
      </section>

      {/* One Health */}
      <section className="mb-12">
        <SectionHeader
          title="One Health"
          subtitle="The health of ecosystems, biodiversity, animals, and people are deeply interconnected."
          icon={<Leaf className="w-5 h-5" />}
        />
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="surface p-6">
            <div className="w-12 h-12 rounded-xl bg-success-50 text-success-700 border border-success-100 flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-sand-900">Ecosystem Health</h3>
            <p className="mt-2 text-sm text-sand-600 leading-relaxed">
              Clean waterways, functioning habitats, and natural flow regimes that support all life in the catchment.
            </p>
          </div>
          <div className="surface p-6">
            <div className="w-12 h-12 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center mb-4">
              <Bird className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-sand-900">Biodiversity</h3>
            <p className="mt-2 text-sm text-sand-600 leading-relaxed">
              Diverse plant and animal communities — from riparian vegetation to fish, insects, and waterbirds —
              that depend on healthy freshwater systems.
            </p>
          </div>
          <div className="surface p-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-sand-900">Human Wellbeing</h3>
            <p className="mt-2 text-sm text-sand-600 leading-relaxed">
              Safe water for recreation, livelihoods, and community health — recognising that people are part of
              the ecosystem, not separate from it.
            </p>
          </div>
        </div>
        <InfoBanner type="info">
          AquaSignal does not diagnose disease or prove causation. It helps surface patterns in environmental
          observations so that experts can investigate further using their own methods and judgement.
        </InfoBanner>
      </section>

      {/* Responsible AI */}
      <section className="mb-12">
        <SectionHeader
          title="Responsible AI"
          subtitle="AI assists with data quality, pattern organisation, and explanation. Environmental experts remain responsible for final interpretation and action."
          icon={<Brain className="w-5 h-5" />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-sand-900">What AI does</h3>
            </div>
            <ul className="space-y-2.5">
              {[
                'Checks observation consistency and flags incomplete data',
                'Organises related observations by site, time, and pattern',
                'Detects patterns that may indicate environmental changes',
                'Generates explainable evidence chains for each signal',
                'Recommends next actions for expert review',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-sand-700">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-aqua-100 text-aqua-700 flex items-center justify-center mt-0.5">
                    <Brain className="w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success-50 text-success-700 border border-success-100 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-sand-900">What humans do</h3>
            </div>
            <ul className="space-y-2.5">
              {[
                'Interpret signals in the context of local knowledge',
                'Verify findings through field assessment',
                'Decide whether to act, follow up, or dismiss',
                'Take responsibility for environmental decisions',
                'Ensure AI recommendations are never the final word',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-sand-700">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-100 text-success-700 flex items-center justify-center mt-0.5">
                    <Shield className="w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it connects */}
      <section className="mb-12">
        <SectionHeader
          title="The AquaSignal journey"
          subtitle="From what a citizen sees to what an expert can act on."
          icon={<Link2 className="w-5 h-5" />}
        />
        <div className="surface p-6 sm:p-8">
          <ol className="space-y-4">
            {[
              { icon: Eye, title: 'Citizen Observation', text: 'Community members report freshwater conditions using simple, citizen-friendly language.' },
              { icon: Brain, title: 'AI Quality Gate', text: 'Observations pass through consistency checks. Incomplete data is flagged, not hidden.' },
              { icon: Link2, title: 'Evidence Chain', text: 'Related observations are linked into a transparent, explainable evidence chain.' },
              { icon: Users, title: 'Human Review', text: 'Environmental experts review evidence, request follow-up, and decide on action.' },
              { icon: Shield, title: 'One Health Action', text: 'Reviewed signals feed into environmental and public health decision-making.' },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-aqua-700 text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    {idx < 4 && <div className="w-0.5 h-8 bg-aqua-200 mt-1" />}
                  </div>
                  <div className="pt-1.5">
                    <h4 className="text-sm font-semibold text-sand-900">{step.title}</h4>
                    <p className="text-sm text-sand-600 mt-0.5 leading-relaxed">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Disclaimer */}
      <InfoBanner type="warning" title="Prototype notice">
        AquaSignal is a prototype developed for the IEEE OneAquaHealth Global Hackathon 2026. It is not a
        regulatory or medical tool. All signals are AI-assisted recommendations for expert review — not
        confirmed environmental facts.
      </InfoBanner>
    </>
  );
}
