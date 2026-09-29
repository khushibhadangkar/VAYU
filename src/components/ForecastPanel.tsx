import React, { useState, useEffect } from 'react';
import { Activity, ExternalLink, Car, Factory, Leaf, ArrowRight, TrendingUp } from 'lucide-react';
import { api, ForecastData } from '../services/api';

interface ForecastPanelProps {
  city: string;
  onOpenSimulationModal: () => void;
}

function getStatusStyle(status: string): { label: string; color: string } {
  if (status === 'MODEL_FORECAST') return { label: 'MODEL FORECAST', color: '#0284c7' };
  if (status === 'DEMO_FALLBACK') return { label: 'DEMO FALLBACK', color: '#F59E0B' };
  if (status === 'OBSERVED') return { label: 'OBSERVED', color: '#10B981' };
  return { label: status, color: '#9CA3AF' };
}

export const ForecastPanel: React.FC<ForecastPanelProps> = ({ city, onOpenSimulationModal }) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'source' | 'scenario'>('forecast');
  const [trafficOn, setTrafficOn] = useState(true);
  const [industrialOn, setIndustrialOn] = useState(false);
  const [combinedOn, setCombinedOn] = useState(false);

  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(true);

  const [hoverData, setHoverData] = useState<{ x: number; baseline: number; simulated: number; time: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    setForecastLoading(true);
    api.getForecast(city)
      .then(data => { if (mounted) { setForecastData(data); setForecastLoading(false); } })
      .catch(() => { if (mounted) setForecastLoading(false); });
    return () => { mounted = false; };
  }, [city]);

  // Determine predicted AQI from toggles (used in scenario tab/chart)
  let deltaPct = 0;
  let predictedAqi = forecastData?.current ?? 168;

  if (combinedOn) {
    deltaPct = 40; predictedAqi = Math.round((forecastData?.current ?? 168) * 0.60);
  } else if (trafficOn && industrialOn) {
    deltaPct = 34; predictedAqi = Math.round((forecastData?.current ?? 168) * 0.66);
  } else if (trafficOn) {
    deltaPct = 15; predictedAqi = Math.round((forecastData?.current ?? 168) * 0.85);
  } else if (industrialOn) {
    deltaPct = 20; predictedAqi = Math.round((forecastData?.current ?? 168) * 0.80);
  } else {
    deltaPct = 0; predictedAqi = forecastData?.current ?? 168;
  }

  // Build chart points from API forecast data
  const CHART_X_START = 30;
  const CHART_X_NOW = 120;
  const CHART_X_END = 330;
  const CHART_Y_BOTTOM = 140;
  const CHART_Y_TOP = 20;
  const CHART_AQI_MAX = 300;

  function aqiToY(aqi: number): number {
    const pct = Math.min(aqi, CHART_AQI_MAX) / CHART_AQI_MAX;
    return CHART_Y_BOTTOM - pct * (CHART_Y_BOTTOM - CHART_Y_TOP);
  }

  // Observed points (from timeline — static 3 points before "now")
  const observedPts = [
    { x: 30, aqi: forecastData?.current ? forecastData.current + 16 : 100 },
    { x: 60, aqi: forecastData?.current ? forecastData.current + 14 : 98 },
    { x: 85, aqi: forecastData?.current ? forecastData.current + 22 : 106 },
    { x: 120, aqi: forecastData?.current ?? 92 },
  ];

  // Forecast points from API
  const forecastPts = forecastData?.forecast
    ? [
        { x: CHART_X_NOW, aqi: forecastData.current ?? 168, label: 'Now' },
        ...forecastData.forecast.map((pt, i) => {
          const totalFcastPoints = forecastData.forecast.length;
          const x = CHART_X_NOW + ((CHART_X_END - CHART_X_NOW) * (i + 1)) / Math.max(totalFcastPoints, 1);
          return { x, aqi: pt.value, label: pt.time };
        })
      ]
    : [
        { x: CHART_X_NOW, aqi: forecastData?.current ?? 168, label: 'Now' },
        { x: 180, aqi: 84, label: '+6h' },
        { x: 240, aqi: 76, label: '+12h' },
        { x: 300, aqi: 71, label: '+18h' },
        { x: 330, aqi: 68, label: '+24h' },
      ];

  const observedPathD = observedPts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${aqiToY(p.aqi)}`)
    .join(' ');

  const forecastPathD = forecastPts.length > 1
    ? forecastPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${aqiToY(p.aqi)}`).join(' ')
    : `M ${CHART_X_NOW} ${aqiToY(forecastData?.current ?? 168)} L ${CHART_X_END} ${aqiToY(forecastData?.current ?? 168)}`;

  // Scenario path
  const yTarget = aqiToY(predictedAqi);
  const yStart = aqiToY(forecastData?.current ?? 168);
  const yMid = (yStart + yTarget) / 2;
  const scenarioPath = `M ${CHART_X_NOW} ${yStart} Q 170 ${yMid + 6} 220 ${yTarget + 4} T ${CHART_X_END} ${yTarget}`;
  const scenarioArea = `M ${CHART_X_NOW} ${yStart} Q 170 ${yMid + 6} 220 ${yTarget + 4} T ${CHART_X_END} ${yTarget} L ${CHART_X_END} ${CHART_Y_BOTTOM} L ${CHART_X_NOW} ${CHART_Y_BOTTOM} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 340;
    if (x >= CHART_X_START && x <= CHART_X_END) {
      const progress = (x - CHART_X_START) / (CHART_X_END - CHART_X_START);
      const isPast = x <= CHART_X_NOW;
      const baseline = Math.round((forecastData?.current ?? 168) + Math.sin(progress * Math.PI * 2) * 20);
      const simulated = isPast ? baseline : Math.round(baseline * (1 - deltaPct / 100));
      const hourOffset = Math.round(progress * 24);
      const time = isPast ? `Observed (−${Math.round((CHART_X_NOW - x) / 5)}h)` : `+${hourOffset}h Forecast`;
      setHoverData({ x, baseline, simulated, time });
    }
  };

  const statusStyle = getStatusStyle(forecastData?.status ?? 'loading');

  return (
    <div className="forecast-panel-card">
      {/* Header */}
      <div className="forecast-panel-header">
        <div className="fph-title-group">
          <div className="pulse-sparkle-icon">
            <Activity size={18} color="#0284c7" />
          </div>
          <h2 className="fph-title">Forecast &amp; Scenarios</h2>
        </div>
        <button className="fph-expand-btn" onClick={onOpenSimulationModal} title="Expand Analysis Studio">
          <ExternalLink size={15} />
        </button>
      </div>

      {/* Segmented Control Tabs */}
      <div className="segmented-tabs" role="tablist">
        <button
          className={`seg-tab ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >Forecast</button>
        <button
          className={`seg-tab ${activeTab === 'source' ? 'active' : ''}`}
          onClick={() => setActiveTab('source')}
        >Source Contribution</button>
        <button
          className={`seg-tab ${activeTab === 'scenario' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenario')}
        >Scenario Analysis</button>
      </div>

      {/* Model status badge + Predicted AQI */}
      <div className="predicted-aqi-block">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="pred-label">
            {activeTab === 'scenario' ? 'Scenario AQI' : 'Predicted AQI'}
          </span>
          {forecastData && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px',
              borderRadius: '999px', background: 'rgba(255,255,255,0.07)',
              color: statusStyle.color, letterSpacing: '0.04em',
            }}>
              {statusStyle.label}
            </span>
          )}
        </div>
        <div className="pred-value-row">
          <span className="pred-number">
            {forecastLoading ? '…' : predictedAqi}
          </span>
          {deltaPct > 0 && (
            <div className="pred-delta-badge">
              <ArrowRight size={12} style={{ transform: 'rotate(45deg)' }} />
              <span>{deltaPct}%</span>
              <span className="pred-horizon">in next 24 hours</span>
            </div>
          )}
          {deltaPct === 0 && forecastData && (
            <div className="pred-delta-badge" style={{ opacity: 0.7 }}>
              <TrendingUp size={12} />
              <span className="pred-horizon">
                {forecastData.model?.name ?? 'Baseline Forecast'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Line Chart */}
      <div className="forecast-chart-container">
        <svg
          className="forecast-svg-chart"
          viewBox="0 0 340 180"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverData(null)}
        >
          <defs>
            <linearGradient id="obsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="scenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line className="chart-grid-line" x1="30" y1="20" x2="330" y2="20" />
          <line className="chart-grid-line" x1="30" y1="60" x2="330" y2="60" />
          <line className="chart-grid-line" x1="30" y1="100" x2="330" y2="100" />
          <line className="chart-grid-line" x1="30" y1="140" x2="330" y2="140" />

          {/* Y Axis labels */}
          <text className="chart-axis-label" x="12" y="24">300</text>
          <text className="chart-axis-label" x="12" y="64">200</text>
          <text className="chart-axis-label" x="12" y="104">100</text>
          <text className="chart-axis-label" x="16" y="144">0</text>

          {/* Now Divider */}
          <line className="chart-now-divider" x1="120" y1="15" x2="120" y2="145" stroke="#60a5fa" strokeDasharray="3 3" strokeWidth="1.5" />
          <text className="chart-now-tag" x="120" y="12" textAnchor="middle">Now</text>

          {/* Area Fills */}
          <path d={`${observedPathD} L ${CHART_X_NOW} ${CHART_Y_BOTTOM} L ${CHART_X_START} ${CHART_Y_BOTTOM} Z`} fill="url(#obsGrad)" />
          <path d={scenarioArea} fill="url(#scenGrad)" />

          {/* Series lines */}
          <path className="chart-path path-observed" d={observedPathD} />
          <path className="chart-path path-forecast" d={forecastPathD} />
          <path className="chart-path path-scenario" d={scenarioPath} />

          {/* Observed dots */}
          {observedPts.map((p, i) => (
            <circle key={i} className={`chart-point ${i === observedPts.length - 1 ? 'pt-now' : 'pt-observed'}`}
              cx={p.x} cy={aqiToY(p.aqi)} r={i === observedPts.length - 1 ? 4.5 : 3} />
          ))}

          {/* Forecast dots */}
          {forecastPts.slice(1).map((p, i) => (
            <circle key={i} className="chart-point pt-forecast" cx={p.x} cy={aqiToY(p.aqi)} r={3} />
          ))}

          {/* Scenario dots */}
          <circle className="chart-point pt-scenario" cx={180} cy={yMid + 4} r={3} />
          <circle className="chart-point pt-scenario" cx={240} cy={yTarget + 3} r={3} />
          <circle className="chart-point pt-scenario" cx={300} cy={yTarget + 1} r={3} />
          <circle className="chart-point pt-scenario" cx={330} cy={yTarget} r={3} />

          {/* Hover crosshair */}
          {hoverData && (
            <g>
              <line x1={hoverData.x} y1="15" x2={hoverData.x} y2="145" stroke="#94a3b8" strokeDasharray="2 2" strokeWidth="1" />
              <circle cx={hoverData.x} cy={aqiToY(hoverData.simulated)} r={5} fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>

        <div className="chart-x-axis">
          <span className="x-lbl">Now</span>
          <span className="x-lbl">+6h</span>
          <span className="x-lbl">+12h</span>
          <span className="x-lbl">+18h</span>
          <span className="x-lbl">+24h</span>
        </div>

        {/* Hover Tooltip */}
        {hoverData && (
          <div className="chart-tooltip-box" style={{ left: `${(hoverData.x / 340) * 100}%` }}>
            <div className="ct-time">{hoverData.time}</div>
            <div className="ct-row">
              <span className="ct-dot bg-blue"></span>
              <span className="ct-label">Baseline:</span>
              <span className="ct-val">{hoverData.baseline} AQI</span>
            </div>
            <div className="ct-row">
              <span className="ct-dot bg-green"></span>
              <span className="ct-label">Simulated:</span>
              <span className="ct-val">{hoverData.simulated} AQI</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="chart-legend-row">
        <div className="legend-item">
          <span className="legend-symbol sym-observed"></span>
          <span className="legend-text">Observed</span>
        </div>
        <div className="legend-item">
          <span className="legend-symbol sym-forecast"></span>
          <span className="legend-text">Model Forecast</span>
        </div>
        <div className="legend-item">
          <span className="legend-symbol sym-scenario"></span>
          <span className="legend-text">Scenario</span>
        </div>
      </div>

      {/* Compare Interventions */}
      <div className="interventions-section">
        <div className="interventions-header">
          <h3 className="ih-title">Compare Interventions</h3>
          <p className="ih-subtitle">Simulate the impact of different actions on air quality.</p>
        </div>

        <div className="intervention-cards-list">
          <div className="intervention-item-card">
            <div className="ii-icon-box bg-slate-subtle"><Car size={18} color="#1e293b" /></div>
            <div className="ii-meta">
              <span className="ii-name">Traffic Restriction</span>
              <span className="ii-badge badge-green-glow"><b>-22%</b> in PM2.5</span>
            </div>
            <label className="switch-toggle" title="Toggle Traffic Restriction">
              <input type="checkbox" checked={trafficOn} onChange={(e) => setTrafficOn(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="intervention-item-card">
            <div className="ii-icon-box bg-purple-subtle"><Factory size={18} color="#8b5cf6" /></div>
            <div className="ii-meta">
              <span className="ii-name">Industrial Emission Control</span>
              <span className="ii-badge badge-green-glow"><b>-28%</b> in PM2.5</span>
            </div>
            <label className="switch-toggle" title="Toggle Industrial Control">
              <input type="checkbox" checked={industrialOn} onChange={(e) => setIndustrialOn(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="intervention-item-card">
            <div className="ii-icon-box bg-emerald-subtle"><Leaf size={18} color="#10b981" /></div>
            <div className="ii-meta">
              <span className="ii-name">Combined Action</span>
              <span className="ii-badge badge-green-glow"><b>-40%</b> in PM2.5</span>
            </div>
            <label className="switch-toggle" title="Toggle Combined Action">
              <input type="checkbox" checked={combinedOn} onChange={(e) => {
                setCombinedOn(e.target.checked);
                if (e.target.checked) { setTrafficOn(true); setIndustrialOn(true); }
              }} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button className="run-simulation-btn" onClick={onOpenSimulationModal}>
          <span>Run Scenario Simulation</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
