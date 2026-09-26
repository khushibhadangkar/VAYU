import React, { useState } from 'react';
import { Sliders, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScenarioSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (projectedAqi: number) => void;
}

export const ScenarioSimulationModal: React.FC<ScenarioSimulationModalProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
}) => {
  const [fleetPct, setFleetPct] = useState(45);
  const [dustPct, setDustPct] = useState(60);
  const [industrialShift, setIndustrialShift] = useState(30);

  if (!isOpen) return null;

  // Calculation
  const reduction = Math.round(fleetPct * 0.35 + dustPct * 0.25 + industrialShift * 0.4);
  const projectedAqi = Math.max(55, Math.round(168 - reduction * 1.1));
  const healthBenefit = Math.round(reduction * 0.75);

  const handleApply = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
    onApplyScenario(projectedAqi);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sim-studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sim-modal-header">
          <div className="smh-left">
            <div className="pulse-sparkle-icon">
              <Sliders size={20} color="#0284c7" />
            </div>
            <div>
              <h3 className="smh-title">AI Atmospheric Scenario Simulator</h3>
              <p className="smh-subtitle">High-fidelity predictive physics and chemical dispersion modeling</p>
            </div>
          </div>
          <button className="modal-close-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="sim-modal-body">
          <div className="sim-sliders-col">
            <div className="sim-slider-card">
              <div className="ssc-head">
                <span className="ssc-name">Electric Fleet Transition (%)</span>
                <span className="ssc-val">{fleetPct}%</span>
              </div>
              <input
                type="range"
                className="sim-range"
                min="0"
                max="100"
                value={fleetPct}
                onChange={(e) => setFleetPct(parseInt(e.target.value, 10))}
              />
              <span className="ssc-desc">Reduces tailpipe particulate matter along coastal expressways</span>
            </div>

            <div className="sim-slider-card">
              <div className="ssc-head">
                <span className="ssc-name">Construction Dust Suppression (%)</span>
                <span className="ssc-val">{dustPct}%</span>
              </div>
              <input
                type="range"
                className="sim-range"
                min="0"
                max="100"
                value={dustPct}
                onChange={(e) => setDustPct(parseInt(e.target.value, 10))}
              />
              <span className="ssc-desc">Water mist cannons, windbreaks and green coverings at active sites</span>
            </div>

            <div className="sim-slider-card">
              <div className="ssc-head">
                <span className="ssc-name">Industrial Off-Peak Energy Shift</span>
                <span className="ssc-val">{industrialShift}%</span>
              </div>
              <input
                type="range"
                className="sim-range"
                min="0"
                max="100"
                value={industrialShift}
                onChange={(e) => setIndustrialShift(parseInt(e.target.value, 10))}
              />
              <span className="ssc-desc">Rerouting manufacturing emission peaks during nocturnal atmospheric inversions</span>
            </div>
          </div>

          <div className="sim-results-col">
            <div className="sim-kpi-box">
              <span className="kpi-label">Projected 24h AQI</span>
              <span className="kpi-big">{projectedAqi}</span>
              <span className="kpi-sub badge-green">Improved to Satisfactory</span>
            </div>

            <div className="sim-kpi-box">
              <span className="kpi-label">Estimated Health Impact</span>
              <span className="kpi-big text-emerald">-{healthBenefit}%</span>
              <span className="kpi-sub">Hospital respiratory admissions</span>
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
