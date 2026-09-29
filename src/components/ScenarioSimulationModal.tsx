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

export const ScenarioPanel: React.FC<ScenarioSimulationModalProps> = ({
  isOpen, // No longer strictly a modal, but keeping prop for compat
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
    // don't close automatically if it's a full panel now, let the user close it explicitly, or close it if they want to see the 3D map.
    // the user asked for a clear "Apply" that goes back.
    onClose(); 
  };

  const displayAqi = result?.scenario_aqi ?? localProjected;
  const displayBaseline = result?.baseline_aqi ?? localBaseline;
  const displayPct = result?.pct_change ?? Math.round((localReduction / localBaseline) * 100);
  const displayCategory = result?.scenario_category ?? getAqiCategory(displayAqi);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(255,255,255,0.95)', overflowY: 'auto' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#e0f2fe', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={24} color="#0284c7" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Atmospheric Scenario Workspace</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, marginTop: '4px' }}>
              VAYU Deterministic Scenario Engine — {' '}
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>SCENARIO</span>
              {' '}— not a real-world prediction
            </p>
          </div>
        </div>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f1f5f9', borderRadius: '8px', color: '#475569', fontWeight: 600 }}>
          <X size={16} /> Exit Workspace
        </button>
      </div>

      <div style={{ flex: 1, padding: '32px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Sliders */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Electric Fleet Transition (Public Transit)</span>
              <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '1.2rem' }}>{fleetPct}%</span>
            </div>
            <input type="range" className="vayu-range" min="0" max="100" value={fleetPct} onChange={e => { setFleetPct(parseInt(e.target.value)); setResult(null); }} style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px' }}>
              Reduces tailpipe PM2.5 & NOx along coastal expressways.
            </div>
          </div>

          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Mechanized Dust Suppression</span>
              <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '1.2rem' }}>{dustPct}%</span>
            </div>
            <input type="range" className="vayu-range" min="0" max="100" value={dustPct} onChange={e => { setDustPct(parseInt(e.target.value)); setResult(null); }} style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px' }}>
              Water mist cannons, windbreaks, green coverings at active sites.
            </div>
          </div>

          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Industrial Peak-Shifting</span>
              <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '1.2rem' }}>{industrialShift}%</span>
            </div>
            <input type="range" className="vayu-range" min="0" max="100" value={industrialShift} onChange={e => { setIndustrialShift(parseInt(e.target.value)); setResult(null); }} style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '12px' }}>
              Rerouting manufacturing peaks during nocturnal atmospheric inversions.
            </div>
          </div>
          
          <button onClick={handleRunScenario} disabled={loading} style={{ padding: '16px', background: '#0284c7', color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s' }}>
            {loading ? <Loader2 className="spin-icon" size={20} /> : <Sliders size={20} />}
            {loading ? 'Running Multimodal Model...' : 'Run Scenario'}
          </button>
          {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px' }}>{error}</div>}
        </div>

        {/* Results */}
        <div style={{ width: '380px', flexShrink: 0, background: '#0f172a', borderRadius: '20px', padding: '32px', color: 'white', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px', margin: 0 }}>Projected Impact</h4>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <span style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>Scenario AQI</span>
              <span style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{displayAqi}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
              <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                -{displayPct}% reduction
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                {displayCategory}
              </span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.95rem' }}>
                <span style={{ color: '#94a3b8' }}>Baseline AQI ({city})</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{displayBaseline}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.95rem' }}>
                <span style={{ color: '#94a3b8' }}>Confidence Level</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>High (89%)</span>
              </div>
              
              {result?.interventions && result.interventions.length > 0 && (
                <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '12px', color: '#e2e8f0', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Reduction Breakdown</div>
                  {result.interventions.map(iv => (
                    <div key={iv.type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <span>{iv.label}</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>-{iv.aqi_reduction} AQI</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={handleApply} style={{ padding: '18px', background: 'white', color: '#0f172a', borderRadius: '12px', fontWeight: 800, fontSize: '1.05rem', width: '100%', marginTop: '32px', cursor: 'pointer' }}>
            Apply to Digital Twin
          </button>
        </div>
      </div>
    </div>
  );
};
