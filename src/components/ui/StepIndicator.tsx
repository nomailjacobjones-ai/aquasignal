import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
}

export function StepIndicator({ steps, currentStep, completedSteps = [] }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center w-full">
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStep;
          const isCompleted = completedSteps.includes(idx) || idx < currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <li key={step} className={`flex items-center ${isLast ? 'flex-1' : ''}`} aria-current={isCurrent ? 'step' : undefined}>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-aqua-600 border-aqua-600 text-white'
                      : isCurrent
                      ? 'bg-white border-aqua-500 text-aqua-700 shadow-soft ring-4 ring-aqua-100'
                      : 'bg-white border-sand-300 text-sand-400'
                  }`}
                  aria-label={`Step ${idx + 1}: ${step}`}
                >
                  {isCompleted ? <Check className="w-4.5 h-4.5" strokeWidth={3} /> : idx + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${isCurrent ? 'text-aqua-800' : isCompleted ? 'text-sand-700' : 'text-sand-400'}`}>
                  {step}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 mx-3 h-0.5 rounded-full overflow-hidden bg-sand-200" aria-hidden="true">
                  <div
                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-aqua-600' : 'bg-transparent'}`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
