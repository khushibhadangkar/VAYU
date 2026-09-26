import React, { useState } from 'react';
import { Activity, ExternalLink, Car, Factory, Leaf, ArrowRight } from 'lucide-react';

interface ForecastPanelProps {
  onOpenSimulationModal: () => void;
}

export const ForecastPanel: React.FC<ForecastPanelProps> = ({ onOpenSimulationModal }) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'source' | 'scenario'>('forecast');
  const [trafficOn, setTrafficOn] = useState(true);
  const [industrialOn, setIndustrialOn] = useState(false);
  const [combinedOn, setCombinedOn] = useState(false);

  // Hover state for chart
  const [hoverData, setHoverData] = useState<{ x: number; baseline: number; simulated: number; time: string } | null>(null);

  // Recalculate target AQI and percentage
  let deltaPct = 0;
  let predictedAqi = 168;

  if (combinedOn) {
    deltaPct = 40;
    predictedAqi = 98;
  } else if (trafficOn && industrialOn) {
    deltaPct = 34;
    predictedAqi = 112;
  } else if (trafficOn) {
    deltaPct = 15;
    predictedAqi = 142;
  } else if (industrialOn) {
    deltaPct = 20;
    predictedAqi = 134;
  } else {
    deltaPct = 0;
    predictedAqi = 172;
  }

  // Dynamic scenario curve path
  const yTarget = 140 - (predictedAqi / 300) * 120;
  const yMid = (92 + yTarget) / 2;
  const scenarioPath = `M 120 92 Q 170 ${yMid + 6} 220 ${yTarget + 4} T 330 ${yTarget}`;
  const scenarioArea = `M 120 92 Q 170 ${yMid + 6} 220 ${yTarget + 4} T 330 ${yTarget} L 330 140 L 120 140 Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 340;
    if (x >= 30 && x <= 330) {
      const progress = (x - 30) / 300;
      const isPast = x <= 120;
      const baseline = Math.round(160 + Math.sin(progress * Math.PI * 2) * 20);
      const simulated = isPast ? baseline : Math.round(baseline * (1 - deltaPct / 100));
      const hourOffset = Math.round(progress * 24);
      const time = isPast ? `Observed (-${Math.round((120 - x) / 5)}h)` : `+${hourOffset}h Forecast`;
      setHoverData({ x, baseline, simulated, time });
    }
  };

  return (
    <div className="forecast-panel-card">
      {/* Header */}
      <div className="forecast-panel-header">
        <div className="fph-title-group">
          <div className="pulse-sparkle-icon">
            <Activity size={18} color="#0284c7" />
          </div>
          <h2 className="fph-title">Forecast & Scenarios</h2>
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
        >
          Forecast
        </button>
        <button
          className={`seg-tab ${activeTab === 'source' ? 'active' : ''}`}
          onClick={() => setActiveTab('source')}
        >
          Source Contribution
        </button>
        <button
          className={`seg-tab ${activeTab === 'scenario' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenario')}
        >
          Scenario Analysis
        </button>
      </div>

      {/* Predicted AQI */}
      <div className="predicted-aqi-block">
        <span className="pred-label">Predicted AQI</span>
        <div className="pred-value-row">
          <span className="pred-number">{predictedAqi}</span>
          <div className="pred-delta-badge">
            <ArrowRight size={12} style={{ transform: 'rotate(45deg)' }} />
            <span>{deltaPct}%</span>
            <span className="pred-horizon">in next 24 hours</span>
          </div>
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
          <path d="M 30 100 L 60 98 L 85 106 L 120 92 L 120 140 L 30 140 Z" fill="url(#obsGrad)" />
          <path d={scenarioArea} fill="url(#scenGrad)" />

          {/* Series lines */}
          <path className="chart-path path-observed" d="M 30 100 L 60 98 L 85 106 L 120 92" />
          <path className="chart-path path-forecast" d="M 120 92 Q 170 82 220 78 T 330 68" />
          <path className="chart-path path-scenario" d={scenarioPath} />

          {/* Dots */}
          <circle className="chart-point pt-observed" cx="30" cy="100" r="3" />
          <circle className="chart-point pt-observed" cx="60" cy="98" r="3" />
          <circle className="chart-point pt-observed" cx="85" cy="106" r="3" />
          <circle className="chart-point pt-now" cx="120" cy="92" r="4.5" />

          <circle className="chart-point pt-forecast" cx="180" cy="84" r="3" />
          <circle className="chart-point pt-forecast" cx="240" cy="76" r="3" />
          <circle className="chart-point pt-forecast" cx="300" cy="71" r="3" />
          <circle className="chart-point pt-forecast" cx="330" cy="68" r="3" />

          <circle className="chart-point pt-scenario" cx="180" cy={yMid + 4} r="3" />
          <circle className="chart-point pt-scenario" cx="240" cy={yTarget + 3} r="3" />
          <circle className="chart-point pt-scenario" cx="300" cy={yTarget + 1} r="3" />
          <circle className="chart-point pt-scenario" cx="330" cy={yTarget} r="3" />

          {/* Hover crosshair */}
          {hoverData && (
            <g>
              <line x1={hoverData.x} y1="15" x2={hoverData.x} y2="145" stroke="#94a3b8" strokeDasharray="2 2" strokeWidth="1" />
              <circle cx={hoverData.x} cy={140 - (hoverData.simulated / 300) * 120} r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>

        <div className="chart-x-axis">
          <span className="x-lbl">Now</span>
          <span className="x-lbl">6h</span>
          <span className="x-lbl">12h</span>
          <span className="x-lbl">18h</span>
          <span className="x-lbl">24h</span>
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
          {/* Traffic */}
          <div className="intervention-item-card">
            <div className="ii-icon-box bg-slate-subtle">
              <Car size={18} color="#1e293b" />
            </div>
            <div className="ii-meta">
              <span className="ii-name">Traffic Restriction</span>
              <span className="ii-badge badge-green-glow"><b>-22%</b> in PM2.5</span>
            </div>
            <label className="switch-toggle" title="Toggle Traffic Restriction">
              <input
                type="checkbox"
                checked={trafficOn}
                onChange={(e) => setTrafficOn(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Industrial */}
          <div className="intervention-item-card">
            <div className="ii-icon-box bg-purple-subtle">
              <Factory size={18} color="#8b5cf6" />
            </div>
            <div className="ii-meta">
              <span className="ii-name">Industrial Emission Control</span>
              <span className="ii-badge badge-green-glow"><b>-28%</b> in PM2.5</span>
            </div>
            <label className="switch-toggle" title="Toggle Industrial Control">
              <input
                type="checkbox"
                checked={industrialOn}
                onChange={(e) => setIndustrialOn(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Combined */}
          <div className="intervention-item-card">
            <div className="ii-icon-box bg-emerald-subtle">
              <Leaf size={18} color="#10b981" />
            </div>
            <div className="ii-meta">
              <span className="ii-name">Combined Action</span>
              <span className="ii-badge badge-green-glow"><b>-40%</b> in PM2.5</span>
            </div>
            <label className="switch-toggle" title="Toggle Combined Action">
              <input
                type="checkbox"
                checked={combinedOn}
                onChange={(e) => {
                  setCombinedOn(e.target.checked);
                  if (e.target.checked) {
                    setTrafficOn(true);
                    setIndustrialOn(true);
                  }
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Run Scenario Simulation Button */}
        <button className="run-simulation-btn" onClick={onOpenSimulationModal}>
          <span>Run Scenario Simulation</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
