import React, { useState } from 'react';
import { Sliders, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, ScenarioData } from '../services/api';

interface ScenarioSimulationModalProps {
  isOpen: boolean;
  city: string;
  onClose: () => void;
  onApplyScenario: (projectedAqi: number) => void;
}

function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export const ScenarioSimulationModal: React.FC<ScenarioSimulationModalProps> = ({
  isOpen,
  city,
  onClose,
  onApplyScenario,
}) => {
  const [fleetPct, setFleetPct] = useState(45);
  const [dustPct, setDustPct] = useState(60);
  const [industrialShift, setIndustrialShift] = useState(30);

  const [result, setResult] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Local preview calculation (matches backend coefficients exactly)
  const localReduction = Math.round(
    fleetPct * 0.69 + dustPct * 0.43 + industrialShift * 0.54
  );
  const localBaseline = 168; // Will be overridden by API result
  const localProjected = Math.max(30, localBaseline - localReduction);

  const handleRunScenario = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.runScenario({
        city,
        electric_fleet_pct: fleetPct,
        dust_suppression_pct: dustPct,
        industrial_offpeak_pct: industrialShift,
      });
      setResult(data);
    } catch (err) {
      setError('Failed to reach backend. Showing local estimate.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    const aqi = result?.scenario_aqi ?? localProjected;
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    onApplyScenario(aqi);
    onClose();
  };

  const displayAqi = result?.scenario_aqi ?? localProjected;
  const displayBaseline = result?.baseline_aqi ?? localBaseline;
  const displayPct = result?.pct_change ?? Math.round((localReduction / localBaseline) * 100);
  const displayCategory = result?.scenario_category ?? getAqiCategory(displayAqi);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sim-studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sim-modal-header">
          <div className="smh-left">
            <div className="pulse-sparkle-icon">
              <Sliders size={20} color="#0284c7" />
            </div>
            <div>
              <h3 className="smh-title">Atmospheric Scenario Simulator</h3>
              <p className="smh-subtitle">
                VAYU Deterministic Scenario Engine — {' '}
                <span style={{ color: '#F59E0B', fontWeight: 600 }}>SCENARIO</span>
                {' '}— not a real-world prediction
              </p>
            </div>
          </div>
          <button className="modal-close-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="sim-modal-body">
          {/* Sliders */}
          <div className="sim-sliders-col">
            <div className="sim-slider-card">
              <div className="ssc-head">
                <span className="ssc-name">Electric Fleet Transition (%)</span>
                <span className="ssc-val">{fleetPct}%</span>
              </div>
              <input
                type="range" className="sim-range"
                min="0" max="100" value={fleetPct}
                onChange={(e) => { setFleetPct(parseInt(e.target.value, 10)); setResult(null); }}
              />
              <span className="ssc-desc">
                Reduces tailpipe PM2.5 &amp; NOx along coastal expressways
                <em style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>
                  (−{(fleetPct * 0.69).toFixed(0)} AQI est.)
                </em>
              </span>
            </div>

            <div className="sim-slider-card">
              <div className="ssc-head">
                <span className="ssc-name">Construction Dust Suppression (%)</span>
                <span className="ssc-val">{dustPct}%</span>
              </div>
              <input
                type="range" className="sim-range"
                min="0" max="100" value={dustPct}
                onChange={(e) => { setDustPct(parseInt(e.target.value, 10)); setResult(null); }}
              />
              <span className="ssc-desc">
                Water mist cannons, windbreaks, green coverings at active sites
                <em style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>
                  (−{(dustPct * 0.43).toFixed(0)} AQI est.)
                </em>
              </span>
            </div>

            <div className="sim-slider-card">
              <div className="ssc-head">
                <span className="ssc-name">Industrial Off-Peak Energy Shift</span>
                <span className="ssc-val">{industrialShift}%</span>
              </div>
              <input
                type="range" className="sim-range"
                min="0" max="100" value={industrialShift}
                onChange={(e) => { setIndustrialShift(parseInt(e.target.value, 10)); setResult(null); }}
              />
              <span className="ssc-desc">
                Rerouting manufacturing peaks during nocturnal atmospheric inversions
                <em style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>
                  (−{(industrialShift * 0.54).toFixed(0)} AQI est.)
                </em>
              </span>
            </div>

            {/* Run button */}
            <button
              className="run-simulation-btn"
              onClick={handleRunScenario}
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading
                ? <><Loader2 size={15} className="spin-icon" /> Running…</>
                : <span>Run Scenario via Backend</span>
              }
            </button>

            {error && (
              <p style={{ fontSize: '0.7rem', color: '#F59E0B', marginTop: '6px' }}>{error}</p>
            )}

            {result && (
              <div style={{
                marginTop: '8px', padding: '8px 10px',
                background: 'rgba(16,185,129,0.08)', borderRadius: '8px',
                border: '1px solid rgba(16,185,129,0.2)',
                fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                <strong style={{ color: '#10B981' }}>Backend result received</strong>
                {result.capped && (
                  <span style={{ color: '#F59E0B', marginLeft: 6 }}>
                    (capped at 65% max reduction)
                  </span>
                )}
                <br />
                Model: {result.model}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="sim-results-col">
            <div className="sim-kpi-box">
              <span className="kpi-label">Baseline AQI ({city})</span>
              <span className="kpi-big" style={{ color: '#94A3B8' }}>{displayBaseline}</span>
              <span className="kpi-sub">{result ? 'OBSERVED' : 'Estimated'}</span>
            </div>

            <div className="sim-kpi-box">
              <span className="kpi-label">Projected 24h AQI</span>
              <span className="kpi-big">{displayAqi}</span>
              <span className="kpi-sub badge-green">
                {displayCategory} (−{displayPct}%)
              </span>
            </div>

            {/* Intervention breakdown from backend */}
            {result?.interventions && result.interventions.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                padding: '10px', marginTop: '4px',
                fontSize: '0.68rem', lineHeight: 1.6,
              }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Reduction Breakdown
                </div>
                {result.interventions.map(iv => (
                  <div key={iv.type} style={{
                    display: 'flex', justifyContent: 'space-between',
                    color: 'var(--text-secondary)',
                  }}>
                    <span>{iv.label}</span>
                    <span style={{ color: '#10B981', fontWeight: 600 }}>−{iv.aqi_reduction} AQI</span>
                  </div>
                ))}
              </div>
            )}

            {/* Assumptions notice */}
            <div style={{
              marginTop: '8px', padding: '8px 10px',
              background: 'rgba(251,191,36,0.06)', borderRadius: '8px',
              border: '1px solid rgba(251,191,36,0.15)',
              fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
            }}>
              <strong style={{ color: '#F59E0B' }}>⚠ SCENARIO</strong>: Results are illustrative projections
              based on documented sectoral coefficients. Not a real-world causal prediction.
            </div>

            <button className="sim-commit-btn" onClick={handleApply}>
              Apply Scenario to Live Twin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
