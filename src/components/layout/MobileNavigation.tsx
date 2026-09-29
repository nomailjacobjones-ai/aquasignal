import { NavLink } from 'react-router-dom';
import { Droplets, MapPin, LayoutDashboard, ClipboardCheck, FileText, Info, Play, Home } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/report', label: 'Report', icon: FileText },
  { to: '/signals', label: 'Signals', icon: LayoutDashboard },
  { to: '/review', label: 'Review', icon: ClipboardCheck },
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/about', label: 'About', icon: Info },
  { to: '/demo', label: 'Demo', icon: Play },
];

export function MobileNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sand-200 safe-area-pb" aria-label="Bottom navigation">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-aqua-700' : 'text-sand-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
