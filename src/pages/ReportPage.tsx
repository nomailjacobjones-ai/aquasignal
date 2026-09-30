import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Eye, CloudSun, Camera, CheckCircle2, ArrowLeft, ArrowRight,
  Upload, Shield, X, Info, Loader2, AlertCircle, FileImage,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { PrimaryButton } from '@/components/ui/Buttons';
import { InfoBanner } from '@/components/ui/InfoBanner';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { fetchSites, submitObservation, validatePhoto } from '@/lib/observationService';
import { runQualityGate } from '@/lib/qualityGate';
import { saveObservationQualityCheck } from '@/lib/evidenceService';
import type { QualityGateResult } from '@/types';
import type { SiteRow } from '@/types';
import { QualityCheckSection } from '@/components/features/QualityCheckSection';

const steps = ['Choose Stream', 'Observe', 'Conditions', 'Evidence', 'Review'];

const waterAppearances = ['Clear', 'Slightly cloudy', 'Cloudy / discoloured', 'Murky brown', 'Greenish tint', 'Unusually turbid'];
const odours = ['None detected', 'Fresh', 'Musty', 'Slight chemical smell', 'Faint chemical', 'Strong odour'];
const waterFlows = ['Dry / no flow', 'Lower than usual', 'Normal', 'Higher than usual', 'Flooded'];
const pollutionTypes = ['None visible', 'Surface foam', 'Oily sheen', 'Sediment plume', 'Heavy sediment load', 'Algal mat', 'Minor litter', 'Other'];
const vegetationConditions = ['Healthy and diverse', 'Healthy', 'Stable', 'Some browning near banks', 'Browning near banks', 'Overgrowth in channels', 'Reduced growth'];
const wildlifeOptions = ['Normal activity', 'Normal', 'Increased activity', 'Abundant birdlife', 'Reduced activity', 'Fewer waterbirds than typical', 'Reduced fish visibility', 'Reduced insect activity', 'Two herons observed upstream', 'Fish visible in pools', 'Increased dragonfly and frog activity', 'None observed'];

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type QualityCheckState = 'idle' | 'checking' | 'done' | 'unavailable';

export function ReportPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState(false);

  const [formData, setFormData] = useState({
    siteId: '',
    waterAppearance: '',
    odour: '',
    waterFlow: '',
    visiblePollution: [] as string[],
    vegetationCondition: '',
    wildlifeObserved: [] as string[],
    notes: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitPhotoWarning, setSubmitPhotoWarning] = useState<string | null>(null);
  const [submittedSiteName, setSubmittedSiteName] = useState('');
  const [submittedPhotoCount, setSubmittedPhotoCount] = useState(0);

  const [qualityState, setQualityState] = useState<QualityCheckState>('idle');
  const [qualityResult, setQualityResult] = useState<QualityGateResult | null>(null);
  const qualityCheckIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSites();
        if (!cancelled) {
          setSites(data);
          setSitesLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSitesError(true);
          setSitesLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'visiblePollution' | 'wildlifeObserved', item: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] };
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validatePhoto(file);
    if (error) {
      setPhotoError(error);
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    setPhotoError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.siteId !== '';
      case 1: return formData.waterAppearance !== '' && formData.odour !== '' && formData.waterFlow !== '';
      case 2: return formData.vegetationCondition !== '';
      default: return true;
    }
  };

  const nextStep = () => {
    if (!canProceed()) return;
    setCompletedSteps((prev) => prev.includes(currentStep) ? prev : [...prev, currentStep]);
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  useEffect(() => {
    if (currentStep === 4 && qualityState === 'idle') {
      runQualityCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const runQualityCheck = () => {
    const checkId = ++qualityCheckIdRef.current;
    setQualityState('checking');
    setQualityResult(null);

    setTimeout(() => {
      if (checkId !== qualityCheckIdRef.current) return;
      try {
        const selectedSiteName = sites.find((s) => s.id === formData.siteId)?.name ?? 'Unknown site';
        const result = runQualityGate({
          siteName: selectedSiteName,
          waterAppearance: formData.waterAppearance,
          odour: formData.odour,
          waterFlow: formData.waterFlow,
          visiblePollution: formData.visiblePollution,
          vegetationCondition: formData.vegetationCondition,
          wildlifeObserved: formData.wildlifeObserved,
          notes: formData.notes,
          hasPhoto: photoFile !== null,
        });
        setQualityResult(result);
        setQualityState('done');
      } catch {
        setQualityState('unavailable');
      }
    }, 800);
  };

  const submit = async () => {
    setSubmitState('submitting');
    setSubmitError(null);
    setSubmitPhotoWarning(null);

    const selectedSite = sites.find((s) => s.id === formData.siteId);
    const visiblePollutionStr = formData.visiblePollution.join(', ');
    const wildlifeStr = formData.wildlifeObserved.join(', ');

    try {
      const result = await submitObservation(
        {
          site_id: formData.siteId,
          water_appearance: formData.waterAppearance,
          odour: formData.odour,
          water_flow: formData.waterFlow,
          visible_pollution: visiblePollutionStr,
          vegetation_condition: formData.vegetationCondition,
          wildlife_observed: wildlifeStr,
          notes: formData.notes,
        },
        photoFile,
      );

      setSubmittedSiteName(selectedSite?.name ?? 'Unknown site');
      setSubmittedPhotoCount(result.photoUploaded ? 1 : 0);
      if (result.photoError) {
        setSubmitPhotoWarning(result.photoError);
      }
      setCompletedSteps((prev) => [...prev, ...steps.map((_, i) => i)]);
      setSubmitState('success');

      // Persist the Phase 3 quality-check result (best-effort, non-blocking)
      if (qualityResult) {
        try {
          await saveObservationQualityCheck(result.observation.id, qualityResult);
        } catch {
          // Quality-check persistence is secondary to the observation itself.
          // The citizen observation remains the authoritative source.
        }
      }
    } catch {
      setSubmitError('We could not save your observation. Please check your connection and try again.');
      setSubmitState('error');
    }
  };

  const selectedSite = sites.find((s) => s.id === formData.siteId);

  return (
    <>
      <PageHeader
        title="Report an Observation"
        subtitle="Help turn what you see into trusted environmental signals. Every observation matters."
        icon={<MapPin className="w-5.5 h-5.5" />}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Report' }]}
      />

      <div className="max-w-3xl mx-auto">
        {submitState === 'success' ? (
          // Success state
          <div className="surface p-8 sm:p-12 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-success-50 border border-success-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-sand-900">Observation submitted</h2>
            <p className="mt-2 text-sand-600 max-w-md mx-auto">
              Your citizen observation has been recorded successfully. It is now available for environmental review and analysis.
            </p>

            <div className="mt-6 surface-soft p-5 text-left max-w-sm mx-auto">
              <div className="space-y-2">
                <ReviewRow label="Site" value={submittedSiteName} />
                <ReviewRow label="Submitted" value={new Date().toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })} />
                <ReviewRow label="Photos" value={submittedPhotoCount > 0 ? `${submittedPhotoCount} photo attached` : 'No photos attached'} />
              </div>
            </div>

            {submitPhotoWarning && (
              <div className="mt-4 max-w-md mx-auto">
                <InfoBanner type="warning">{submitPhotoWarning}</InfoBanner>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/report">
                <button
                  onClick={() => {
                    setSubmitState('idle');
                    setCurrentStep(0);
                    setCompletedSteps([]);
                    setFormData({ siteId: '', waterAppearance: '', odour: '', waterFlow: '', visiblePollution: [], vegetationCondition: '', wildlifeObserved: [], notes: '' });
                    removePhoto();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium bg-aqua-700 text-white rounded-xl hover:bg-aqua-800 transition-colors shadow-soft"
                >
                  Report Another Observation
                </button>
              </Link>
              <Link to="/signals">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium bg-white text-aqua-800 rounded-xl border border-aqua-200 hover:bg-aqua-50 transition-colors shadow-soft">
                  View Signals
                </button>
              </Link>
            </div>
          </div>
        ) : currentStep < steps.length ? (
          <>
            <div className="surface p-6 mb-6">
              <StepIndicator steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
            </div>

            <div className="surface p-6 sm:p-8 animate-fade-in" key={currentStep}>
              {/* Step 1: Choose Stream */}
              {currentStep === 0 && (
                <StepContent icon={<MapPin className="w-5 h-5" />} title="Choose Stream" description="Select the freshwater site you observed.">
                  {sitesLoading ? (
                    <LoadingState message="Loading monitoring sites…" />
                  ) : sitesError ? (
                    <ErrorState
                      message="We could not load monitoring sites. Please check your connection and try again."
                      onRetry={() => {
                        setSitesLoading(true);
                        setSitesError(false);
                        fetchSites().then(setSites).catch(() => setSitesError(true)).finally(() => setSitesLoading(false));
                      }}
                    />
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {sites.map((site) => (
                        <button
                          key={site.id}
                          onClick={() => updateField('siteId', site.id)}
                          className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.siteId === site.id
                              ? 'border-aqua-500 bg-aqua-50 ring-2 ring-aqua-100'
                              : 'border-sand-200 hover:border-aqua-200 hover:bg-sand-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-4.5 h-4.5 ${formData.siteId === site.id ? 'text-aqua-600' : 'text-sand-400'}`} />
                            <span className="font-medium text-sand-900">{site.name}</span>
                          </div>
                          <p className="text-sm text-sand-500 mt-1 ml-6.5">
                            {site.region ?? 'Unknown region'}
                            {site.city ? `, ${site.city}` : ''}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </StepContent>
              )}

              {/* Step 2: Observe */}
              {currentStep === 1 && (
                <StepContent icon={<Eye className="w-5 h-5" />} title="Observe" description="Record what the water looks, smells, and flows like.">
                  <div className="space-y-6">
                    <SelectField label="Water appearance" value={formData.waterAppearance} options={waterAppearances} onChange={(v) => updateField('waterAppearance', v)} help="How does the water look?" />
                    <SelectField label="Odour" value={formData.odour} options={odours} onChange={(v) => updateField('odour', v)} help="Does the water have any smell?" />
                    <SelectField label="Water flow" value={formData.waterFlow} options={waterFlows} onChange={(v) => updateField('waterFlow', v)} help="How much water is moving compared to what you'd expect?" />
                    <MultiSelectField label="Visible pollution" values={formData.visiblePollution} options={pollutionTypes} onChange={(item) => toggleArrayItem('visiblePollution', item)} help="Select all that apply. Choose 'None visible' if the water looks clean." />
                  </div>
                </StepContent>
              )}

              {/* Step 3: Conditions */}
              {currentStep === 2 && (
                <StepContent icon={<CloudSun className="w-5 h-5" />} title="Environmental Conditions" description="Record the surrounding environment and wildlife you observed.">
                  <div className="space-y-6">
                    <SelectField label="Vegetation condition" value={formData.vegetationCondition} options={vegetationConditions} onChange={(v) => updateField('vegetationCondition', v)} help="How do the plants along the banks look?" />
                    <MultiSelectField label="Wildlife observed" values={formData.wildlifeObserved} options={wildlifeOptions} onChange={(item) => toggleArrayItem('wildlifeObserved', item)} help="Select all wildlife you noticed. Choose 'None observed' if you didn't see any." />
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-sand-700 mb-1.5">Optional notes</label>
                      <p className="text-xs text-sand-500 mb-2">Add any extra details that might help reviewers understand what you saw.</p>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        rows={4}
                        placeholder="e.g. Foam visible near the drainage pipe outlet, roughly 3 metres downstream."
                        className="input-field resize-none"
                      />
                    </div>
                  </div>
                </StepContent>
              )}

              {/* Step 4: Evidence */}
              {currentStep === 3 && (
                <StepContent icon={<Camera className="w-5 h-5" />} title="Add Evidence" description="Photographs help reviewers verify your observation. You can attach one photo.">
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                      aria-label="Upload photo"
                    />

                    {!photoPreview ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-sand-300 rounded-xl p-8 text-center hover:border-aqua-300 transition-colors"
                      >
                        <Upload className="w-10 h-10 text-sand-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-sand-700">Click to choose a photo</p>
                        <p className="text-xs text-sand-500 mt-1">JPG, PNG, or WebP up to 5 MB</p>
                      </button>
                    ) : (
                      <div className="surface-soft p-4 flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-sand-200 flex-shrink-0">
                          <img src={photoPreview} alt="Photo preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-sand-800">
                            <FileImage className="w-4 h-4 text-aqua-600" />
                            <span className="truncate">{photoFile?.name ?? 'Selected photo'}</span>
                          </div>
                          <p className="text-xs text-sand-500 mt-0.5">
                            {photoFile ? `${(photoFile.size / 1024).toFixed(0)} KB` : ''}
                          </p>
                          <button
                            onClick={removePhoto}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-error-600 hover:text-error-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Remove photo
                          </button>
                        </div>
                      </div>
                    )}

                    {photoError && (
                      <InfoBanner type="error">{photoError}</InfoBanner>
                    )}

                    <InfoBanner type="info" className="mt-4">
                      Your photos are used only for environmental review. They are never shared publicly without your consent.
                    </InfoBanner>
                  </div>
                </StepContent>
              )}

              {/* Step 5: Review */}
              {currentStep === 4 && (
                <StepContent icon={<CheckCircle2 className="w-5 h-5" />} title="Review" description="Check your observation before submitting.">
                  <div className="space-y-4">
                    <ReviewRow label="Site" value={selectedSite ? `${selectedSite.name} (${selectedSite.region ?? 'Unknown'})` : 'Not selected'} />
                    <ReviewRow label="Water appearance" value={formData.waterAppearance || 'Not specified'} />
                    <ReviewRow label="Odour" value={formData.odour || 'Not specified'} />
                    <ReviewRow label="Water flow" value={formData.waterFlow || 'Not specified'} />
                    <ReviewRow label="Visible pollution" value={formData.visiblePollution.length > 0 ? formData.visiblePollution.join(', ') : 'None selected'} />
                    <ReviewRow label="Vegetation" value={formData.vegetationCondition || 'Not specified'} />
                    <ReviewRow label="Wildlife" value={formData.wildlifeObserved.length > 0 ? formData.wildlifeObserved.join(', ') : 'None selected'} />
                    <ReviewRow label="Notes" value={formData.notes || 'No notes added'} />
                    <ReviewRow label="Photo" value={photoFile ? `${photoFile.name}` : 'No photo attached'} />

                    {submitState === 'error' && (
                      <div className="pt-2">
                        <InfoBanner type="error" title="Submission failed">
                          {submitError}
                        </InfoBanner>
                      </div>
                    )}

                    {/* Quality Check Section */}
                    <div className="pt-4 border-t border-sand-100">
                      <QualityCheckSection
                        state={qualityState}
                        result={qualityResult}
                        onRecheck={runQualityCheck}
                        onUpdate={() => { setCurrentStep(1); setQualityState('idle'); setQualityResult(null); }}
                        onContinueAnyway={() => {}}
                      />
                    </div>

                    {qualityState === 'done' && qualityResult && qualityResult.overall_status === 'ready' && (
                      <div className="pt-2">
                        <InfoBanner type="success" title="Ready to submit">
                          Your observation will be saved and made available for environmental review and analysis.
                        </InfoBanner>
                      </div>
                    )}
                  </div>
                </StepContent>
              )}

              {/* Navigation */}
              <div className="mt-8 pt-6 border-t border-sand-100 flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-sand-600 hover:text-sand-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                {currentStep < steps.length - 1 ? (
                  <PrimaryButton onClick={nextStep} disabled={!canProceed()} withArrow>
                    Continue
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={submit} disabled={submitState === 'submitting'}>
                    {submitState === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Submit Observation
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </PrimaryButton>
                )}
              </div>
            </div>

            {/* Privacy notice */}
            <div className="mt-6">
              <InfoBanner type="info" icon={<Shield className="w-5 h-5 text-aqua-600" />}>
                Your observation is recorded for environmental review purposes. Personal details are kept confidential.
                You can withdraw your observation at any time.
              </InfoBanner>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function StepContent({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-aqua-50 text-aqua-700 border border-aqua-100 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-sand-900">{title}</h2>
          <p className="text-sm text-sand-500">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SelectField({ label, value, options, onChange, help }: { label: string; value: string; options: string[]; onChange: (v: string) => void; help?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-sand-700 mb-1.5">{label}</label>
      {help && <p className="text-xs text-sand-500 mb-2 flex items-center gap-1"><Info className="w-3.5 h-3.5" />{help}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
              value === opt
                ? 'bg-aqua-700 text-white border-aqua-700'
                : 'bg-white text-sand-700 border-sand-300 hover:border-aqua-300 hover:bg-aqua-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelectField({ label, values, options, onChange, help }: { label: string; values: string[]; options: string[]; onChange: (item: string) => void; help?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-sand-700 mb-1.5">{label}</label>
      {help && <p className="text-xs text-sand-500 mb-2 flex items-center gap-1"><Info className="w-3.5 h-3.5" />{help}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-all ${
              values.includes(opt)
                ? 'bg-aqua-700 text-white border-aqua-700'
                : 'bg-white text-sand-700 border-sand-300 hover:border-aqua-300 hover:bg-aqua-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-sand-100 last:border-0">
      <span className="text-sm font-medium text-sand-500 flex-shrink-0">{label}</span>
      <span className="text-sm text-sand-800 text-right">{value}</span>
    </div>
  );
}
