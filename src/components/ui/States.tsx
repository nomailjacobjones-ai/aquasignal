import type { ReactNode } from 'react';
import { Inbox, Loader2, AlertCircle } from 'lucide-react';

export function EmptyState({ title, message, icon, action }: { title: string; message: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-sand-100 border border-sand-200 flex items-center justify-center mb-4 text-sand-400">
        {icon ?? <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-sand-800">{title}</h3>
      <p className="text-sm text-sand-500 mt-1 max-w-md">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <Loader2 className="w-8 h-8 text-aqua-500 animate-spin mb-3" />
      <p className="text-sm text-sand-500">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-error-50 border border-error-100 flex items-center justify-center mb-4 text-error-500">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-sand-800">Unable to load</h3>
      <p className="text-sm text-sand-500 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 px-4 py-2 text-sm font-medium text-aqua-700 hover:text-aqua-800 transition-colors">
          Try again
        </button>
      )}
    </div>
  );
}
