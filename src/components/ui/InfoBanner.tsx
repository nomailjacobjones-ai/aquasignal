import type { ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

type BannerType = 'info' | 'warning' | 'success' | 'error';

interface InfoBannerProps {
  type?: BannerType;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const bannerConfig: Record<BannerType, { bg: string; border: string; text: string; icon: ReactNode }> = {
  info: { bg: 'bg-aqua-50', border: 'border-aqua-200', text: 'text-aqua-800', icon: <Info className="w-5 h-5 text-aqua-600" /> },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: <AlertTriangle className="w-5 h-5 text-amber-600" /> },
  success: { bg: 'bg-success-50', border: 'border-success-200', text: 'text-success-800', icon: <CheckCircle2 className="w-5 h-5 text-success-600" /> },
  error: { bg: 'bg-error-50', border: 'border-error-200', text: 'text-error-800', icon: <XCircle className="w-5 h-5 text-error-600" /> },
};

export function InfoBanner({ type = 'info', title, children, icon, className = '' }: InfoBannerProps) {
  const config = bannerConfig[type];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} ${className}`} role={type === 'warning' || type === 'error' ? 'alert' : 'status'}>
      <div className="flex-shrink-0 mt-0.5">{icon ?? config.icon}</div>
      <div className="min-w-0">
        {title && <p className={`font-semibold ${config.text} text-sm mb-0.5`}>{title}</p>}
        <div className={`text-sm ${config.text} leading-relaxed`}>{children}</div>
      </div>
    </div>
  );
}
