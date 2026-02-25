import { NavLink } from 'react-router-dom';
import { useUser } from '../UserContext';
import { useState } from 'react';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/quiz', label: 'Spot Quiz' },
  { to: '/range-trainer', label: 'Range Trainer' },
  { to: '/concepts', label: 'Concepts' },
  { to: '/daily', label: 'Daily' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-felt-800 border-b border-felt-600/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-accent-green border-2 border-accent-gold flex items-center justify-center">
              <span className="text-accent-gold font-bold text-xs">IQ</span>
            </div>
            <span className="text-lg font-bold text-white group-hover:text-accent-gold transition-colors">
              RangeIQ
            </span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-green/20 text-accent-gold'
                      : 'text-gray-400 hover:text-white hover:bg-felt-700/50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-accent-gold font-semibold">{user.elo_overall}</span>
              <span className="text-gray-500">ELO</span>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-3 border-t border-felt-600/30 pt-2">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-accent-green/20 text-accent-gold'
                      : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {user && (
              <div className="px-3 pt-2 text-sm text-gray-500">
                ELO: <span className="text-accent-gold font-semibold">{user.elo_overall}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
