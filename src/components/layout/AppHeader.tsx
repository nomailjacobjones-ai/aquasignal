import { NavLink, Link } from 'react-router-dom';
import { Droplets, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/report', label: 'Report' },
  { to: '/signals', label: 'Signals' },
  { to: '/review', label: 'Review' },
  { to: '/map', label: 'Map' },
  { to: '/about', label: 'About' },
  { to: '/demo', label: 'Demo' },
];

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="AquaSignal home">
            <div className="w-9 h-9 rounded-xl bg-aqua-700 flex items-center justify-center group-hover:bg-aqua-800 transition-colors">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-sand-900 tracking-tight">AquaSignal</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-aqua-800 bg-aqua-50'
                      : 'text-sand-600 hover:text-aqua-700 hover:bg-sand-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/report"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-aqua-700 text-white hover:bg-aqua-800 transition-colors shadow-soft"
            >
              Report an Observation
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-sand-700 hover:bg-sand-100 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sand-200 bg-white animate-fade-in">
          <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-aqua-800 bg-aqua-50'
                      : 'text-sand-600 hover:text-aqua-700 hover:bg-sand-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/report"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium bg-aqua-700 text-white text-center mt-2"
            >
              Report an Observation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
