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
    { group: 'Navigation', action: 'nav-overview', icon: '🏠', label: 'Go to Overview', tag: 'Dashboard' },
    { group: 'Navigation', action: 'nav-digital-twin', icon: '🏙️', label: 'Go to Digital Twin', tag: 'Map' },
    { group: 'Navigation', action: 'nav-hotspots', icon: '🎯', label: 'Go to Hotspots', tag: 'Analytics' },
    { group: 'Navigation', action: 'nav-sources', icon: 'pie_chart', label: 'Go to Sources', tag: 'Analytics' },
    { group: 'Navigation', action: 'nav-forecast', icon: '📈', label: 'Go to Forecast', tag: 'Prediction' },
    { group: 'Navigation', action: 'nav-scenarios', icon: '⚡', label: 'Go to Scenarios', tag: 'Simulation' },
    { group: 'Navigation', action: 'nav-validation', icon: '✅', label: 'Go to Validation', tag: 'Trust' },
    { group: 'Navigation', action: 'nav-data-trust', icon: 'ℹ️', label: 'Go to Data / Trust', tag: 'Provenance' },
    { group: 'Digital Twin Districts', action: 'focus-bandra', icon: '📍', label: 'Focus Bandra West', tag: 'Hotspot' },
    { group: 'Digital Twin Districts', action: 'focus-dadar', icon: '📍', label: 'Focus Dadar Central', tag: 'Hotspot' },
    { group: 'Digital Twin Districts', action: 'focus-lowerparel', icon: '📍', label: 'Focus Lower Parel', tag: 'Hotspot' },
    { group: 'Digital Twin Districts', action: 'focus-kurla', icon: '📍', label: 'Focus Kurla Industrial', tag: 'Hotspot' },
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
