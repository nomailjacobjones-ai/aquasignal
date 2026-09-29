interface ConfidenceMeterProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const sizeConfig = {
  sm: { bar: 'h-1.5', text: 'text-xs' },
  md: { bar: 'h-2.5', text: 'text-sm' },
  lg: { bar: 'h-3.5', text: 'text-base' },
};

function getColor(value: number): string {
  if (value >= 80) return 'bg-success-500';
  if (value >= 60) return 'bg-aqua-500';
  if (value >= 40) return 'bg-amber-500';
  return 'bg-error-400';
}

export function ConfidenceMeter({ value, label = 'Confidence', size = 'md', showValue = true }: ConfidenceMeterProps) {
  const config = sizeConfig[size];
  const clamped = Math.max(0, Math.min(100, value));
  const color = getColor(clamped);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`${config.text} font-medium text-sand-600`}>{label}</span>
        {showValue && (
          <span className={`${config.text} font-semibold text-sand-800 tabular-nums`}>{clamped}%</span>
        )}
      </div>
      <div className={`w-full ${config.bar}} bg-sand-200 rounded-full overflow-hidden`} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${clamped}%`}>
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
