import React, { useEffect, useState } from 'react';
import { api, SourceItem } from '../services/api';

interface SourceContributionCardProps {
  city: string;
  currentAqi: number;
}

// CSS variable keys per position (preserved from original design)
const COLOR_KEYS = ['vehicle', 'industrial', 'construction', 'residential', 'others'];
const SEG_CLASSES = ['seg-vehicle', 'seg-industrial', 'seg-construction', 'seg-residential', 'seg-others'];
const DOT_CLASSES = ['dot-vehicle', 'dot-industrial', 'dot-construction', 'dot-residential', 'dot-others'];

// Pre-computed donut segment offsets/dashes for up to 5 sources summing to 100%
// These are rebuilt dynamically from API percentages below.
const CIRCUMFERENCE = 2 * Math.PI * 74; // r=74 → ≈ 465.0

function buildSegments(sources: SourceItem[]) {
  let cumulativePct = 0;
  return sources.map((s, i) => {
    const dash = (s.percentage / 100) * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - dash;
    const offset = -(cumulativePct / 100) * CIRCUMFERENCE;
    cumulativePct += s.percentage;
    return {
      ...s,
      segClass: SEG_CLASSES[i] || SEG_CLASSES[SEG_CLASSES.length - 1],
      dotClass: DOT_CLASSES[i] || DOT_CLASSES[DOT_CLASSES.length - 1],
      dashStr: `${dash.toFixed(2)} ${gap.toFixed(2)}`,
      offset,
    };
  });
}

function getStatusLabel(status: string): { label: string; color: string } {
  if (status === 'MODELED_ATTRIBUTION') return { label: 'MODELLED ATTRIBUTION', color: '#F59E0B' };
  if (status === 'DEMO_FALLBACK') return { label: 'DEMO FALLBACK', color: '#9CA3AF' };
  return { label: status, color: '#9CA3AF' };
}

export const SourceContributionCard: React.FC<SourceContributionCardProps> = ({ city, currentAqi }) => {
  const [segments, setSegments] = useState<ReturnType<typeof buildSegments>>([]);
  const [apiMethod, setApiMethod] = useState<string>('Modeled Source Attribution');
  const [dataStatus, setDataStatus] = useState<string>('loading');
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setDataStatus('loading');

    api.getSources(city)
      .then(data => {
        if (!mounted) return;
        setSegments(buildSegments(data.sources));
        setApiMethod(data.method || 'Modeled Source Attribution');
        setDataStatus(data.status);
      })
      .catch(() => {
        if (!mounted) return;
        // Use hardcoded fallback if API fails
        const fallback: SourceItem[] = [
          { name: 'Vehicle Emissions', percentage: 34, primary_pollutant: 'PM2.5', color_key: 'vehicle', notes: '' },
          { name: 'Industrial Activity', percentage: 28, primary_pollutant: 'SO2', color_key: 'industrial', notes: '' },
          { name: 'Construction Dust', percentage: 18, primary_pollutant: 'PM10', color_key: 'construction', notes: '' },
          { name: 'Residential', percentage: 12, primary_pollutant: 'PM2.5', color_key: 'residential', notes: '' },
          { name: 'Others', percentage: 8, primary_pollutant: 'Mixed', color_key: 'others', notes: '' },
        ];
        setSegments(buildSegments(fallback));
        setDataStatus('DEMO_FALLBACK');
      });

    return () => { mounted = false; };
  }, [city]);

  const activeItem = segments.find((s) => s.name === hoveredSource);
  const centerDisplay = activeItem ? `${activeItem.percentage}%` : currentAqi;
  const centerSub = activeItem ? activeItem.name : 'AQI';
  const statusLabel = getStatusLabel(dataStatus);

  return (
    <div className="analytics-card source-card">
      <div className="card-header-bar">
        <h2 className="card-title">Source Contribution</h2>
        <div className="sc-info-pill">
          <span className="info-dot" style={{ background: statusLabel.color }}></span>
          <span style={{ color: statusLabel.color, fontSize: '0.65rem', fontWeight: 600 }}>
            {statusLabel.label}
          </span>
        </div>
      </div>

      <div className="source-grid-content">
        {/* Left: Donut Chart with Center Display */}
        <div className="donut-chart-wrapper">
          <svg className="donut-svg" viewBox="0 0 200 200">
            <circle className="donut-bg-ring" cx="100" cy="100" r="74" />
            {segments.map((s) => {
              const isHovered = hoveredSource === s.name;
              return (
                <circle
                  key={s.name}
                  className={`donut-segment ${s.segClass}`}
                  cx="100"
                  cy="100"
                  r="74"
                  strokeDasharray={s.dashStr}
                  strokeDashoffset={s.offset}
                  style={{
                    strokeWidth: isHovered ? 30 : 24,
                    opacity: hoveredSource && !isHovered ? 0.45 : 1,
                  }}
                  onMouseEnter={() => setHoveredSource(s.name)}
                  onMouseLeave={() => setHoveredSource(null)}
                />
              );
            })}
          </svg>

          <div className="donut-center-callout">
            <span className="donut-aqi-num">{centerDisplay}</span>
            <span className="donut-aqi-label" style={{ fontSize: activeItem ? '9px' : '10.5px' }}>
              {centerSub}
            </span>
          </div>
        </div>

        {/* Right: Legend Breakdown */}
        <div className="source-legend-list">
          {segments.map((s) => {
            const isHovered = hoveredSource === s.name;
            return (
              <div
                key={s.name}
                className="source-legend-item"
                style={{
                  background: isHovered ? 'rgba(255, 255, 255, 0.85)' : undefined,
                  opacity: hoveredSource && !isHovered ? 0.5 : 1,
                }}
                onMouseEnter={() => setHoveredSource(s.name)}
                onMouseLeave={() => setHoveredSource(null)}
              >
                <div className="sli-left">
                  <span className={`sli-dot ${s.dotClass}`}></span>
                  <span className="sli-name">{s.name}</span>
                </div>
                <span className="sli-percent">{s.percentage}%</span>
              </div>
            );
          })}
          {dataStatus === 'loading' && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', padding: '4px 0' }}>
              Loading source data…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
