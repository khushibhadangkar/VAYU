import React from 'react';
import { Hotspot } from '../types';

interface TelemetryPopoverProps {
  hotspot: Hotspot | null;
  position: { top: number; left: number } | null;
  onClose: () => void;
}

export const TelemetryPopover: React.FC<TelemetryPopoverProps> = ({
  hotspot,
  position,
  onClose,
}) => {
  if (!hotspot || !position) return null;

  return (
    <div
      className="telemetry-popover"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="tp-header">
        <div className="tp-badge-row">
          <span className="tp-title">{hotspot.name}</span>
          <span className="tp-aqi-pill">{hotspot.aqi} AQI</span>
        </div>
        <button className="tp-close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="tp-body">
        <div className="tp-stat-item">
          <span className="tp-label">Dominant Sector:</span>
          <span className="tp-val">{hotspot.category}</span>
        </div>
        <div className="tp-stat-item">
          <span className="tp-label">PM2.5 Peak Hour:</span>
          <span className="tp-val">09:30 AM (92 µg/m³)</span>
        </div>
        <div className="tp-stat-item">
          <span className="tp-label">Micro-Dispersion Index:</span>
          <span className="tp-val text-amber">0.42 (Stagnant)</span>
        </div>
      </div>
    </div>
  );
};
