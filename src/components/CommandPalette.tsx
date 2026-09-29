import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectAction }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { group: 'Digital Twin Districts', action: 'focus-bandra', icon: '📍', label: 'Bandra West & Sea Link', tag: 'AQI 188' },
    { group: 'Digital Twin Districts', action: 'focus-dadar', icon: '📍', label: 'Dadar Central Junction', tag: 'AQI 196' },
    { group: 'Digital Twin Districts', action: 'focus-lowerparel', icon: '📍', label: 'Lower Parel High-Rise District', tag: 'AQI 176' },
    { group: 'Digital Twin Districts', action: 'focus-kurla', icon: '📍', label: 'Kurla Industrial Corridor', tag: 'AQI 218' },
    { group: 'Policy Interventions', action: 'toggle-traffic', icon: '🚗', label: 'Toggle Odd-Even Traffic Rationing', tag: '-22% PM2.5' },
    { group: 'Policy Interventions', action: 'toggle-industrial', icon: '🏭', label: 'Toggle Industrial Scrubbers & Fuel Transition', tag: '-28% PM2.5' },
    { group: 'Policy Interventions', action: 'launch-sim', icon: '⚡', label: 'Run Multimodal Monte Carlo Simulation', tag: 'Execute' },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) || item.tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="command-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-row">
          <Search size={20} color="#64748b" />
          <input
            type="text"
            className="cmd-search-input"
            placeholder="Type a city, hotspot, pollutant, or policy action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="cmd-esc-badge" onClick={onClose}>ESC</kbd>
        </div>

        <div className="cmd-results-list">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="cmd-item"
              onClick={() => {
                onSelectAction(item.action);
                onClose();
              }}
            >
              <span className="cmd-icon">{item.icon}</span>
              <span className="cmd-text">{item.label}</span>
              <span className="cmd-tag">{item.tag}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              No matching commands or districts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
