import React from 'react';
import { LayoutGrid, Wind, PieChart, Sliders, Target, FileText, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'live-air', label: 'Live Air Quality', icon: Wind },
    { id: 'source-analysis', label: 'Source Analysis', icon: PieChart },
    { id: 'simulator', label: 'Scenario Simulator', icon: Sliders },
    { id: 'hotspots', label: 'Hotspots', icon: Target },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
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
            >
              <Icon className="nav-icon" size={18} />
              <span className="nav-text">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
