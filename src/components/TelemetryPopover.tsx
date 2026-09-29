import React from 'react';
import { Hotspot } from '../types';

interface TelemetryPopoverProps {
  hotspot: Hotspot | null;
  position: { top: number; left: number } | null;
  onClose: () => void;
}

function getSeverityColor(severity?: string): string {
  if (!severity) return '#F59E0B';
  const s = severity.toLowerCase();
  if (s.includes('good')) return '#10B981';
  if (s.includes('satisfactory')) return '#84CC16';
  if (s.includes('moderate')) return '#F59E0B';
  if (s.includes('poor') && !s.includes('very')) return '#F97316';
  if (s.includes('very poor') || s.includes('severe')) return '#EF4444';
  return '#9CA3AF';
}

export const TelemetryPopover: React.FC<TelemetryPopoverProps> = ({
  hotspot,
  position,
  onClose,
}) => {
  if (!hotspot || !position) return null;

  const severityColor = getSeverityColor(hotspot.severity);

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
          {hotspot.severity && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px',
              borderRadius: '999px', background: `${severityColor}22`,
              color: severityColor, marginLeft: '4px',
            }}>
              {hotspot.severity.toUpperCase()}
            </span>
          )}
        </div>
        <button className="tp-close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="tp-body">
        <div className="tp-stat-item">
          <span className="tp-label">Dominant Sector:</span>
          <span className="tp-val">{hotspot.category}</span>
        </div>

        {hotspot.primary_pollutant && (
          <div className="tp-stat-item">
            <span className="tp-label">Primary Pollutant:</span>
            <span className="tp-val">{hotspot.primary_pollutant}</span>
          </div>
        )}

        {hotspot.pm25 !== undefined && (
          <div className="tp-stat-item">
            <span className="tp-label">PM2.5:</span>
            <span className="tp-val">{hotspot.pm25} µg/m³</span>
          </div>
        )}

        {hotspot.pm10 !== undefined && (
          <div className="tp-stat-item">
            <span className="tp-label">PM10:</span>
            <span className="tp-val">{hotspot.pm10} µg/m³</span>
          </div>
        )}

        {!hotspot.pm25 && (
          <div className="tp-stat-item">
            <span className="tp-label">PM2.5 Peak Hour:</span>
            <span className="tp-val">09:30 AM (92 µg/m³)</span>
          </div>
        )}

        <div className="tp-stat-item">
          <span className="tp-label">Micro-Dispersion Index:</span>
          <span className="tp-val text-amber">0.42 (Stagnant)</span>
        </div>

        {hotspot.notes && (
          <div style={{
            marginTop: '6px', padding: '6px 8px',
            background: 'rgba(255,255,255,0.05)', borderRadius: '6px',
            fontSize: '0.65rem', color: 'var(--text-tertiary)', lineHeight: 1.4,
          }}>
            {hotspot.notes}
          </div>
        )}
      </div>
    </div>
  );
};
