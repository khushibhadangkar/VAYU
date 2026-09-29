import React, { useEffect, useState } from 'react';
import { Activity, Wind, Target, PieChart, ShieldCheck, Database } from 'lucide-react';
import { CityOption } from '../types';
import { api } from '../services/api';

interface OverviewScreenProps {
  currentCity: CityOption;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({ currentCity }) => {
  const [forecastSummary, setForecastSummary] = useState<any>(null);
  const [sourcesSummary, setSourcesSummary] = useState<any>(null);
  const [hotspotsSummary, setHotspotsSummary] = useState<any>(null);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  
  useEffect(() => {
    let mounted = true;
    api.getForecast(currentCity.name).then(d => mounted && setForecastSummary(d)).catch(() => {});
    api.getSources(currentCity.name).then(d => mounted && setSourcesSummary(d)).catch(() => {});
    api.getHotspots(currentCity.name).then(d => mounted && setHotspotsSummary(d)).catch(() => {});
    api.getValidation(currentCity.name).then(d => mounted && setValidationSummary(d)).catch(() => {});
    return () => { mounted = false; };
  }, [currentCity.name]);

  const leadingSource = sourcesSummary?.sources?.[0];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 10px', height: '100%', overflowY: 'auto' }}>
      
      {/* Hero Intro */}
      <div style={{ ...cardStyle }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: primaryText, marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
          Environmental Intelligence Summary: {currentCity.name}
        </h1>
        <p style={{ color: secondaryText, fontSize: '0.95rem', maxWidth: '800px', lineHeight: 1.5 }}>
          VAYU provides a complete digital twin of urban air quality. This overview synthesizes live observations, modeled source attribution, deterministic forecasting, and historical validation into actionable intelligence.
        </p>
        
        {/* Automated Insights */}
        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(2, 132, 199, 0.05)', borderRadius: '12px', borderLeft: '4px solid #0284c7' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={16} /> Automated Insights
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: secondaryText, fontSize: '0.85rem', lineHeight: 1.6 }}>
            {currentCity.aqi > 150 && (
              <li><strong>Observation:</strong> Air quality is currently {currentCity.aqi > 200 ? 'Poor' : 'Moderate'}. {currentCity.aqi > 200 ? 'Sensitive groups should limit prolonged outdoor exertion.' : ''}</li>
            )}
            {forecastSummary?.forecast && Math.max(...forecastSummary.forecast.map((f: any) => f.value)) > currentCity.aqi + 10 && (
              <li><strong>Prediction:</strong> Forecast indicates increasing pollution over the selected horizon.</li>
            )}
            {forecastSummary?.forecast && Math.max(...forecastSummary.forecast.map((f: any) => f.value)) <= currentCity.aqi + 10 && (
              <li><strong>Prediction:</strong> Conditions are expected to remain stable or improve over the next 24 hours.</li>
            )}
            {leadingSource && (
              <li><strong>Attribution:</strong> {leadingSource.name} is the leading modeled contributor under current assumptions.</li>
            )}
            {hotspotsSummary?.count > 0 && (
              <li><strong>Investigation:</strong> {hotspotsSummary.count} monitored hotspots identified requiring potential intervention.</li>
            )}
            {validationSummary?.metrics && (
              <li><strong>Confidence:</strong> Historical validation available for the current model (MAE: {validationSummary.metrics.mae} AQI).</li>
            )}
          </ul>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: secondaryText, marginBottom: '12px' }}>
            <Wind size={18} color="#0ea5e9" /> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Observation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 700, color: primaryText, fontFamily: 'Outfit, sans-serif' }}>{currentCity.aqi}</span>
            <span style={{ fontSize: '1rem', color: tertiaryText, fontWeight: 500 }}>AQI</span>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
            STATUS: OBSERVED
          </div>
        </div>

        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: secondaryText, marginBottom: '12px' }}>
            <Target size={18} color="#ef4444" /> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Identified Hotspots</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 700, color: primaryText, fontFamily: 'Outfit, sans-serif' }}>{hotspotsSummary?.count ?? '...'}</span>
            <span style={{ fontSize: '1rem', color: tertiaryText, fontWeight: 500 }}>Critical Zones</span>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: hotspotsSummary?.status === 'DEMO_FALLBACK' ? '#F59E0B' : '#10B981', background: hotspotsSummary?.status === 'DEMO_FALLBACK' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
            STATUS: {hotspotsSummary?.status || 'LOADING'}
          </div>
        </div>

        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: secondaryText, marginBottom: '12px' }}>
            <PieChart size={18} color="#f59e0b" /> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Primary Source</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: primaryText, fontFamily: 'Outfit, sans-serif' }}>{leadingSource?.name ?? '...'}</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: secondaryText, marginTop: '4px', fontWeight: 500 }}>
            {leadingSource?.percentage ? `${leadingSource.percentage}% Contribution` : '...'}
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
            STATUS: {sourcesSummary?.status || 'MODELED_ATTRIBUTION'}
          </div>
        </div>

        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: secondaryText, marginBottom: '12px' }}>
            <Activity size={18} color="#8b5cf6" /> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>24h Forecast Peak</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 700, color: primaryText, fontFamily: 'Outfit, sans-serif' }}>
              {forecastSummary?.forecast ? Math.max(...forecastSummary.forecast.map((f:any)=>f.value)) : '...'}
            </span>
            <span style={{ fontSize: '1rem', color: tertiaryText, fontWeight: 500 }}>AQI</span>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#0284c7', background: 'rgba(2,132,199,0.1)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', fontWeight: 700 }}>
            STATUS: {forecastSummary?.status || 'MODEL_FORECAST'}
          </div>
        </div>

      </div>

      {/* Secondary Metrics / Weather & Validation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
        <div style={{ ...cardStyle }}>
           <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: primaryText, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Database size={16} color={secondaryText} /> Meteorological Context
           </h3>
           <div style={{ display: 'flex', gap: '32px' }}>
             <div>
               <div style={{ fontSize: '0.75rem', color: tertiaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temperature</div>
               <div style={{ fontSize: '1.4rem', color: primaryText, fontWeight: 700, marginTop: '4px' }}>{currentCity.temp}°C</div>
             </div>
             <div>
               <div style={{ fontSize: '0.75rem', color: tertiaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wind</div>
               <div style={{ fontSize: '1.4rem', color: primaryText, fontWeight: 700, marginTop: '4px' }}>{currentCity.wind}</div>
             </div>
             <div>
               <div style={{ fontSize: '0.75rem', color: tertiaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condition</div>
               <div style={{ fontSize: '1.4rem', color: primaryText, fontWeight: 700, marginTop: '4px' }}>{currentCity.condition}</div>
             </div>
           </div>
        </div>

        <div style={{ ...cardStyle }}>
           <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: primaryText, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <ShieldCheck size={16} color="#10B981" /> Model Confidence (Validation)
           </h3>
           <div style={{ display: 'flex', gap: '32px' }}>
             <div>
               <div style={{ fontSize: '0.75rem', color: tertiaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mean Absolute Error</div>
               <div style={{ fontSize: '1.4rem', color: primaryText, fontWeight: 700, marginTop: '4px' }}>{validationSummary?.metrics?.mae ?? '...'} <span style={{fontSize:'0.8rem', color: tertiaryText}}>AQI</span></div>
             </div>
             <div>
               <div style={{ fontSize: '0.75rem', color: tertiaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Root Mean Sq. Error</div>
               <div style={{ fontSize: '1.4rem', color: primaryText, fontWeight: 700, marginTop: '4px' }}>{validationSummary?.metrics?.rmse ?? '...'} <span style={{fontSize:'0.8rem', color: tertiaryText}}>AQI</span></div>
             </div>
             <div>
               <div style={{ fontSize: '0.75rem', color: tertiaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Test Period</div>
               <div style={{ fontSize: '1.1rem', color: primaryText, fontWeight: 700, marginTop: '4px' }}>{validationSummary?.validation_period ? '14 Days' : '...'}</div>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
};
