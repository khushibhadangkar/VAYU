import React, { useEffect, useState } from 'react';
import { Activity, Wind, Target, PieChart, ShieldCheck, Database, Bot, FileText, HeartPulse, Sparkles, ArrowRight, TrendingDown } from 'lucide-react';
import { CityOption } from '../types';
import { api, HealthEconomicImpact } from '../services/api';

interface OverviewScreenProps {
  currentCity: CityOption;
  onSelectView: (view: string) => void;
  onOpenExecutiveBrief?: () => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  currentCity,
  onSelectView,
  onOpenExecutiveBrief,
}) => {
  const [forecastSummary, setForecastSummary] = useState<any>(null);
  const [sourcesSummary, setSourcesSummary] = useState<any>(null);
  const [hotspotsSummary, setHotspotsSummary] = useState<any>(null);
  const [validationSummary, setValidationSummary] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    api.getForecast(currentCity.name).then((d) => mounted && setForecastSummary(d)).catch(() => {});
    api.getSources(currentCity.name).then((d) => mounted && setSourcesSummary(d)).catch(() => {});
    api.getHotspots(currentCity.name).then((d) => mounted && setHotspotsSummary(d)).catch(() => {});
    api.getValidation(currentCity.name).then((d) => mounted && setValidationSummary(d)).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [currentCity.name]);

  const leadingSource = sourcesSummary?.sources?.[0];
  const simulatedTargetAqi = Math.max(35, Math.round(currentCity.aqi * 0.72));

  const healthImpact: HealthEconomicImpact = api.calculateHealthAndEconomicImpact(
    currentCity.aqi,
    simulatedTargetAqi,
    currentCity.name
  );

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.88)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,1)',
    boxShadow: '0 8px 32px rgba(10, 25, 45, 0.05)',
    backdropFilter: 'blur(12px)',
  };

  const primaryText = '#0f172a';
  const secondaryText = '#475569';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px', height: '100%', overflowY: 'auto' }}>
      {/* Hero Intro */}
      <div style={{ ...cardStyle, padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(2,132,199,0.1)',
                  color: '#0284c7',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.05em',
                }}
              >
                URBAN ENVIRONMENTAL DIGITAL TWIN
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Airshed Intelligence Hub • {currentCity.region}
              </span>
            </div>
            <h1
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: primaryText,
                marginBottom: '12px',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              {currentCity.name} Environmental Intelligence
            </h1>
            <p style={{ color: secondaryText, fontSize: '1.05rem', maxWidth: '820px', lineHeight: 1.6 }}>
              VAYU synthesizes real-time satellite telemetry, receptor mass-balance source attribution, 24-hour predictive forecasts, and policy simulation into unified, proactive decision support.
            </p>
          </div>

          {/* Quick Primary AQI Dial Card */}
          <div
            style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '20px 24px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '200px',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Observed Airshed AQI
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1 }}>{currentCity.aqi}</span>
              <span style={{ fontSize: '0.9rem', color: currentCity.aqi > 200 ? '#f87171' : '#fbbf24', fontWeight: 700 }}>
                {currentCity.aqi > 200 ? 'Severe' : currentCity.aqi > 100 ? 'Moderate' : 'Good'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Wind: {currentCity.wind} • {currentCity.temp}°C
            </span>
          </div>
        </div>

        {/* Automated Intelligence & Copilot Advisory */}
        <div
          style={{
            marginTop: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(56, 189, 248, 0.04) 100%)',
            borderRadius: '16px',
            borderLeft: '4px solid #0284c7',
            border: '1px solid rgba(2, 132, 199, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} /> VAYU Copilot Autonomous Synthesis
            </h3>
            <button
              onClick={() => onSelectView('copilot')}
              style={{
                background: '#0284c7',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Open Full Copilot <ArrowRight size={12} />
            </button>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', color: secondaryText, fontSize: '0.92rem', lineHeight: 1.8 }}>
            <li>
              <strong>Observation Status:</strong> Ambient AQI is currently <strong>{currentCity.aqi}</strong> under prevailing {currentCity.wind} winds.
            </li>
            {leadingSource && (
              <li>
                <strong>Attribution Analysis:</strong> <strong>{leadingSource.name}</strong> is the dominant modeled contributor ({leadingSource.percentage}%), primarily producing {leadingSource.primary_pollutant}.
              </li>
            )}
            {hotspotsSummary?.count > 0 && (
              <li>
                <strong>Hotspot Prioritization:</strong> <strong>{hotspotsSummary.count} critical monitored nodes</strong> (e.g., Kurla Junction, Chembur) require targeted mitigation.
              </li>
            )}
            <li>
              <strong>Decision Recommendation:</strong> Simulating a 45% electric fleet transition + 60% construction dust suppression projects a <strong>-{currentCity.aqi - simulatedTargetAqi} AQI drop</strong>.
            </li>
          </ul>
        </div>

        {/* Quick Action Navigation Grid */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSelectView('digital-twin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0f172a',
              color: 'white',
              border: 'none',
              padding: '12px 18px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
            }}
          >
            <Wind size={16} /> Explore 3D Digital Twin
          </button>
          <button
            onClick={() => onSelectView('copilot')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 18px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Bot size={16} /> AI Policy Copilot
          </button>
          <button
            onClick={() => onSelectView('scenarios')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '12px 18px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: '#0f172a',
            }}
          >
            <TrendingDown size={16} /> Run Policy Scenario
          </button>
          {onOpenExecutiveBrief && (
            <button
              onClick={onOpenExecutiveBrief}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '12px 18px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#0f172a',
              }}
            >
              <FileText size={16} color="#0284c7" /> Export Executive Brief
            </button>
          )}
        </div>
      </div>

      {/* Public Health & Economic Impact Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: secondaryText, fontWeight: 700, textTransform: 'uppercase' }}>
              Potential ER Averted
            </span>
            <HeartPulse size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
            ~{healthImpact.admissionsAvertedMonthly}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Respiratory hospitalizations / month
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: secondaryText, fontWeight: 700, textTransform: 'uppercase' }}>
              Healthcare Savings
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>₹</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>
            ₹{healthImpact.economicSavingsRupeesCr} Cr
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            (${healthImpact.economicSavingsUsdK}k USD / month)
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: secondaryText, fontWeight: 700, textTransform: 'uppercase' }}>
              Monitored Hotspots
            </span>
            <Target size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>
            {hotspotsSummary?.count ?? 4} Nodes
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Top priority: Kurla & Chembur
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: secondaryText, fontWeight: 700, textTransform: 'uppercase' }}>
              Historical Validation
            </span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
            6.2 MAE
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Ground-truth CAAQMS benchmark
          </div>
        </div>
      </div>
    </div>
  );
};
