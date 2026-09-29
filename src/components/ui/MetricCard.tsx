import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
  accent?: 'aqua' | 'amber' | 'success' | 'error' | 'neutral';
}

const accentConfig = {
  aqua: { bg: 'bg-aqua-50', text: 'text-aqua-700', border: 'border-aqua-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  success: { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-100' },
  error: { bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-100' },
  neutral: { bg: 'bg-sand-100', text: 'text-sand-700', border: 'border-sand-200' },
};

export function MetricCard({ label, value, icon, trend, accent = 'aqua' }: MetricCardProps) {
  const config = accentConfig[accent];
  return (
    <div className="surface p-5 hover:shadow-card transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-sand-500">{label}</p>
          <p className="text-3xl font-semibold text-sand-900 mt-1.5 tabular-nums">{value}</p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.text} border ${config.border} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-medium ${trend.positive ? 'text-success-600' : 'text-sand-500'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
