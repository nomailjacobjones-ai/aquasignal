import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { MobileNavigation } from './MobileNavigation';
import { Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children?: ReactNode;
  fullWidth?: boolean;
}

export function Layout({ children, fullWidth = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-sand-50">
      <AppHeader />
      <main className={`flex-1 ${fullWidth ? '' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'} pb-20 md:pb-8`}>
        {children ?? <Outlet />}
      </main>
      <Footer />
      <MobileNavigation />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-aqua-700 flex items-center justify-center">
              <Droplets className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-sand-900">AquaSignal</p>
              <p className="text-xs text-sand-500">Environmental intelligence for One Health</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-sand-500">
            <Link to="/about" className="hover:text-aqua-700 transition-colors">About</Link>
            <Link to="/demo" className="hover:text-aqua-700 transition-colors">Demo</Link>
            <span className="text-sand-300">|</span>
            <span className="text-xs">IEEE OneAquaHealth Hackathon 2026</span>
          </div>
        </div>
        <p className="mt-6 text-xs text-sand-400 leading-relaxed max-w-3xl">
          AquaSignal is a prototype platform. AI assists with data quality, pattern organisation, and explanation.
          Environmental experts remain responsible for final interpretation and action. This system does not diagnose
          disease or prove causation.
        </p>
      </div>
    </footer>
  );
}
