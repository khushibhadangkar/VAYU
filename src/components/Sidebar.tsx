import React from 'react';
import { LayoutGrid, Wind, PieChart, Sliders, Target, Activity, ShieldCheck, Info, Bot } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'digital-twin', label: 'Digital Twin', icon: Wind },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: 'AI' },
    { id: 'hotspots', label: 'Hotspots', icon: Target },
    { id: 'sources', label: 'Sources', icon: PieChart },
    { id: 'forecast', label: 'Forecast', icon: Activity },
    { id: 'scenarios', label: 'Scenarios', icon: Sliders },
    { id: 'validation', label: 'Validation', icon: ShieldCheck },
    { id: 'data-trust', label: 'Data / Trust', icon: Info },
  ];

  return (
    <aside className="sidebar-dock" aria-label="Primary Navigation">
      <nav className="nav-stack">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => onSelectView(item.id)}
              style={{ position: 'relative' }}
            >
              <Icon className="nav-icon" size={18} />
              <span className="nav-text">{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '8px',
                    background: '#0284c7',
                    color: 'white',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
