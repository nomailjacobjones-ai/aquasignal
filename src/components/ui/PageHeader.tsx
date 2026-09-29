import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}

export function PageHeader({ title, subtitle, icon, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <header className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-2 text-sm text-sand-500">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-sand-300" aria-hidden="true">/</span>}
                {crumb.to ? (
                  <a href={crumb.to} className="hover:text-aqua-700 transition-colors">{crumb.label}</a>
                ) : (
                  <span className="text-sand-700 font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-aqua-50 text-aqua-700 flex items-center justify-center border border-aqua-100">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-sand-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sand-500 text-base max-w-2xl">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-2.5">
        {icon && <div className="flex-shrink-0 mt-0.5 text-aqua-600">{icon}</div>}
        <div>
          <h2 className="text-lg font-semibold text-sand-900">{title}</h2>
          {subtitle && <p className="text-sm text-sand-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
