import React from 'react';
import { ShieldCheck, Database, Server, Info } from 'lucide-react';

export const DataTrustPanel: React.FC = () => {
  const cardStyle = { 
    background: 'rgba(255,255,255,0.85)', 
    borderRadius: '16px', 
    padding: '20px', 
    border: '1px solid rgba(255,255,255,1)',
    boxShadow: '0 8px 32px rgba(10, 25, 45, 0.05)',
    backdropFilter: 'blur(12px)'
  };

  const primaryText = '#0f172a';
  const secondaryText = '#475569';
  const tertiaryText = '#64748b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 24px', height: '100%', overflowY: 'auto' }}>
      
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: primaryText, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="#10B981" /> Data Provenance & Trust
        </h2>
        <p style={{ color: secondaryText, fontSize: '0.95rem', lineHeight: 1.5 }}>
          Transparency is critical for environmental intelligence. Below is the provenance breakdown for all metrics surfaced in the VAYU platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        
        {/* Row 1 */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '6px' }}>OBSERVED</span>
            <span style={{ fontSize: '1rem', color: primaryText, fontWeight: 700 }}>Live Air Quality & Hotspots</span>
          </div>
          <p style={{ color: secondaryText, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong style={{ color: primaryText }}>Source:</strong> Representative CPCB public data (demo reconstruction). <br/>
            <strong style={{ color: primaryText }}>Method:</strong> Sensor network interpolation overlaid with satellite AOD proxies.
          </p>
        </div>

        {/* Row 2 */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: 'rgba(2,132,199,0.1)', padding: '4px 10px', borderRadius: '6px' }}>MODEL FORECAST</span>
            <span style={{ fontSize: '1rem', color: primaryText, fontWeight: 700 }}>24-Hour Predictive AQI</span>
          </div>
          <p style={{ color: secondaryText, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong style={{ color: primaryText }}>Source:</strong> VAYU Diurnal Baseline Model.<br/>
            <strong style={{ color: primaryText }}>Method:</strong> Sinusoidal diurnal model parameterized from seasonal average data. Not a deep-learning model; relies on documented atmospheric persistence.
          </p>
        </div>

        {/* Row 3 */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '6px' }}>MODELED ATTRIBUTION</span>
            <span style={{ fontSize: '1rem', color: primaryText, fontWeight: 700 }}>Source Contribution Breakdown</span>
          </div>
          <p style={{ color: secondaryText, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong style={{ color: primaryText }}>Source:</strong> SAFAR Emission Inventory (2023).<br/>
            <strong style={{ color: primaryText }}>Method:</strong> Static sector-apportionment model based on annual average inventory. Actual daily contributions may vary.
          </p>
        </div>

        {/* Row 4 */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '4px 10px', borderRadius: '6px' }}>SCENARIO</span>
            <span style={{ fontSize: '1rem', color: primaryText, fontWeight: 700 }}>Intervention Simulator</span>
          </div>
          <p style={{ color: secondaryText, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong style={{ color: primaryText }}>Source:</strong> VAYU Deterministic Scenario Engine v1.0.<br/>
            <strong style={{ color: primaryText }}>Method:</strong> Linear first-order approximations applied to sector baseline. Illustrative projections only. Non-linear atmospheric chemistry is not simulated. Max reduction capped at 65%.
          </p>
        </div>

        {/* Row 5 */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: 'rgba(100,116,139,0.1)', padding: '4px 10px', borderRadius: '6px' }}>DEMO FALLBACK</span>
            <span style={{ fontSize: '1rem', color: primaryText, fontWeight: 700 }}>Non-Mumbai Cities</span>
          </div>
          <p style={{ color: secondaryText, fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong style={{ color: primaryText }}>Source:</strong> Static Demo Data.<br/>
            <strong style={{ color: primaryText }}>Method:</strong> Rendered gracefully when the backend lacks live data for a specific geography. Ensures the UI continues to function for demonstration purposes.
          </p>
        </div>

      </div>
    </div>
  );
};
