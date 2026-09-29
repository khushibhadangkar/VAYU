import React, { useState } from 'react';

interface SourceContributionCardProps {
  currentAqi: number;
}

const SOURCES = [
  { name: 'Vehicle Emissions', pct: 34, color: 'var(--donut-vehicle)', dotClass: 'dot-vehicle', segClass: 'seg-vehicle', offset: 0, dash: '158.08 306.87' },
  { name: 'Industrial Activity', pct: 28, color: 'var(--donut-industrial)', dotClass: 'dot-industrial', segClass: 'seg-industrial', offset: -158.09, dash: '130.18 334.77' },
  { name: 'Construction Dust', pct: 18, color: 'var(--donut-construction)', dotClass: 'dot-construction', segClass: 'seg-construction', offset: -288.27, dash: '83.69 381.26' },
  { name: 'Residential', pct: 12, color: 'var(--donut-residential)', dotClass: 'dot-residential', segClass: 'seg-residential', offset: -371.96, dash: '55.79 409.16' },
  { name: 'Others', pct: 8, color: 'var(--donut-others)', dotClass: 'dot-others', segClass: 'seg-others', offset: -427.75, dash: '37.2 427.75' },
];

export const SourceContributionCard: React.FC<SourceContributionCardProps> = ({ currentAqi }) => {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  const activeItem = SOURCES.find((s) => s.name === hoveredSource);
  const centerDisplay = activeItem ? `${activeItem.pct}%` : currentAqi;
  const centerSub = activeItem ? activeItem.name : 'AQI';

  return (
    <div className="analytics-card source-card">
      <div className="card-header-bar">
        <h2 className="card-title">Source Contribution</h2>
        <div className="sc-info-pill">
          <span className="info-dot"></span>
          <span>Modeled Source Attribution</span>
        </div>
      </div>

      <div className="source-grid-content">
        {/* Left: Donut Chart with Center Display */}
        <div className="donut-chart-wrapper">
          <svg className="donut-svg" viewBox="0 0 200 200">
            <circle className="donut-bg-ring" cx="100" cy="100" r="74" />
            {SOURCES.map((s) => {
              const isHovered = hoveredSource === s.name;
              return (
                <circle
                  key={s.name}
                  className={`donut-segment ${s.segClass}`}
                  cx="100"
                  cy="100"
                  r="74"
                  strokeDasharray={s.dash}
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
          {SOURCES.map((s) => {
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
                <span className="sli-percent">{s.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
