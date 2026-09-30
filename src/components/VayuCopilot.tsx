import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, Zap, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { CityOption } from '../types';
import { api, CopilotRecommendation } from '../services/api';

interface VayuCopilotProps {
  currentCity: CityOption;
  onApplyPlanToScenario: (fleetPct: number, dustPct: number, industrialShift: number) => void;
  onSelectView?: (view: string) => void;
}

export const VayuCopilot: React.FC<VayuCopilotProps> = ({
  currentCity,
  onApplyPlanToScenario,
  onSelectView,
}) => {
  const [recommendation, setRecommendation] = useState<CopilotRecommendation | null>(null);
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'vayu'; text: string; timestamp: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const plan = api.generateCopilotActionPlan(
      currentCity.name,
      currentCity.aqi,
      currentCity.wind,
      currentCity.aqi > 200 ? 'Vehicular Congestion & Heavy Industrial Flaring' : 'Vehicular Tailpipe & Road Dust'
    );
    setRecommendation(plan);
    setApplied(false);
  }, [currentCity.name, currentCity.aqi, currentCity.wind]);

  const handleExecutePlan = () => {
    if (!recommendation) return;
    onApplyPlanToScenario(
      recommendation.recommendedFleetPct,
      recommendation.recommendedDustPct,
      recommendation.recommendedIndustrialShiftPct
    );
    setApplied(true);
    if (onSelectView) {
      onSelectView('scenarios');
    }
  };

  const handleSendPrompt = (promptText?: string) => {
    const textToSend = promptText || query;
    if (!textToSend.trim()) return;

    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setChatLog((prev) => [...prev, { sender: 'user', text: textToSend, timestamp: time }]);
    setQuery('');
    setIsGenerating(true);

    setTimeout(() => {
      let responseText = '';
      const lower = textToSend.toLowerCase();

      if (lower.includes('morning') || lower.includes('peak') || lower.includes('inversion')) {
        responseText = `To counter the 06:00-09:00 AM nocturnal inversion trap in ${currentCity.name}, VAYU recommends: 1) Staging diesel freight vehicles outside the municipal perimeter until 10:30 AM; 2) Activating high-pressure mist cannons at arterial hotspots (Kurla, Chembur); 3) Synchronizing green light waves along major commute corridors. This cuts peak exposure by ~28%.`;
      } else if (lower.includes('school') || lower.includes('hospital') || lower.includes('children')) {
        responseText = `Vulnerable Zone Advisory: Establish 500m Clean Air Corridors around educational institutions and hospitals in ${currentCity.name}. Enforce zero-idling school drop-off zones and deploy HEPA filtration barriers. Estimated reduction in pediatric respiratory stress: 38%.`;
      } else if (lower.includes('wind') || lower.includes('sea') || lower.includes('coastal')) {
        responseText = `Meteorological Dynamics: The ${currentCity.wind} breeze promotes natural maritime dispersion between 13:00 and 16:00. However, during evening commute hours, decreasing boundary layer height traps particulate matter. Strategic timing of industrial operations during off-peak maritime hours maximizes natural dispersion.`;
      } else if (lower.includes('economic') || lower.includes('cost') || lower.includes('roi')) {
        responseText = `Cost-Benefit Assessment: Implementing the Copilot Recommended Protocol yields an estimated ₹2.4 Crore ($300k USD) monthly healthcare burden reduction and protects over ${((currentCity.aqi * 12500) / 1000).toFixed(0)}k citizens from severe pollutant exposure.`;
      } else {
        responseText = `VAYU Copilot Analysis for ${currentCity.name}: Based on current telemetry (AQI ${currentCity.aqi}, ${currentCity.wind}), the primary bottleneck is localized particulate entrapment. Combining targeted dust suppression (${recommendation?.recommendedDustPct}%) with commercial fleet electrification (${recommendation?.recommendedFleetPct}%) achieves an optimal -${recommendation?.projectedAqiDrop} AQI reduction with high cost-efficiency.`;
      }

      setChatLog((prev) => [
        ...prev,
        {
          sender: 'vayu',
          text: responseText,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsGenerating(false);
    }, 600);
  };

  const quickPrompts = [
    '⚡ Mitigate 09:00 AM Morning Inversion Peak',
    '🏥 Protect Vulnerable School Corridors',
    '🌊 Leverage Coastal Sea Breeze Dispersion',
    '💰 Public Health Cost-Benefit & ROI',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '28px',
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 'var(--radius-xl)',
        color: '#0f172a',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        height: '100%',
        overflowY: 'auto',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  margin: 0,
                  color: '#0f172a',
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '-0.01em',
                }}
              >
                VAYU Policy Copilot
              </h2>
              <span
                style={{
                  background: 'rgba(2, 132, 199, 0.08)',
                  color: '#0284c7',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '999px',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                  letterSpacing: '0.04em',
                }}
              >
                AI ADVISOR • v2.4
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', marginTop: '3px' }}>
              Autonomous Environmental Decision Support for {currentCity.name}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const plan = api.generateCopilotActionPlan(
              currentCity.name,
              currentCity.aqi,
              currentCity.wind
            );
            setRecommendation(plan);
          }}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#475569',
            borderRadius: '999px',
            padding: '7px 14px',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={13} /> Refresh Audit
        </button>
      </div>

      {/* Autonomous Action Plan Card */}
      {recommendation && (
        <div
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background:
                recommendation.threatLevel === 'CRITICAL'
                  ? '#ef4444'
                  : recommendation.threatLevel === 'ELEVATED'
                  ? '#f59e0b'
                  : '#10b981',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    background:
                      recommendation.threatLevel === 'CRITICAL'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : recommendation.threatLevel === 'ELEVATED'
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(16, 185, 129, 0.1)',
                    color:
                      recommendation.threatLevel === 'CRITICAL'
                        ? '#dc2626'
                        : recommendation.threatLevel === 'ELEVATED'
                        ? '#d97706'
                        : '#059669',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {recommendation.threatLevel} STATUS
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Target: {currentCity.name} Urban Airshed
                </span>
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: 0,
                  color: '#0f172a',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {recommendation.title}
              </h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Projected Benefit
              </div>
              <div
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#059669',
                  fontFamily: 'var(--font-serif)',
                  lineHeight: 1.1,
                }}
              >
                -{recommendation.projectedAqiDrop} AQI
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
            {recommendation.summary}
          </p>

          {/* Directives Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#0284c7',
                  fontWeight: 700,
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  letterSpacing: '0.04em',
                }}
              >
                <Zap size={13} /> IMMEDIATE PROTOCOL (0-4h)
              </div>
              <div style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>
                {recommendation.immediateAction}
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#b45309',
                  fontWeight: 700,
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  letterSpacing: '0.04em',
                }}
              >
                <AlertTriangle size={13} /> METEOROLOGICAL CONSTRAINT
              </div>
              <div style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>
                {recommendation.meteorologicalFactor}
              </div>
            </div>
          </div>

          {/* Intervention Parameters Banner */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>EV Fleet</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7', fontFamily: 'var(--font-serif)' }}>{recommendation.recommendedFleetPct}%</span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dust Suppression</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7', fontFamily: 'var(--font-serif)' }}>{recommendation.recommendedDustPct}%</span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Industrial Shift</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7', fontFamily: 'var(--font-serif)' }}>{recommendation.recommendedIndustrialShiftPct}%</span>
              </div>
            </div>

            <button
              onClick={handleExecutePlan}
              style={{
                background: applied ? '#059669' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
                transition: 'all 0.2s',
              }}
            >
              {applied ? (
                <>
                  <CheckCircle2 size={16} /> Applied to Scenario Engine
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Auto-Test in Simulation <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      <div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Suggested Inquiries:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(p)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                padding: '7px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Transcript */}
      <div
        style={{
          flex: 1,
          minHeight: '160px',
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '18px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        {chatLog.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: 'auto', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            Pose a municipal policy inquiry or select an editorial prompt above to consult the VAYU Policy Advisory Engine.
          </div>
        ) : (
          chatLog.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.sender === 'user' ? '#0f172a' : '#ffffff',
                border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '12px 16px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: msg.sender === 'user' ? '#94a3b8' : '#64748b',
                  marginBottom: '4px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {msg.sender === 'user' ? 'Urban Planner / Municipal Officer' : 'VAYU Policy Advisory'} • {msg.timestamp}
              </div>
              <div
                style={{
                  fontSize: '0.88rem',
                  color: msg.sender === 'user' ? '#f8fafc' : '#1e293b',
                  lineHeight: 1.6,
                  fontFamily: msg.sender === 'vayu' ? 'var(--font-serif)' : 'var(--font-sans)',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div style={{ alignSelf: 'flex-start', color: '#0284c7', fontSize: '0.82rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
            VAYU Copilot is synthesizing atmospheric telemetry & policy models...
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
          placeholder={`Ask VAYU Policy Copilot about ${currentCity.name}'s air quality interventions...`}
          style={{
            flex: 1,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '999px',
            padding: '12px 20px',
            color: '#0f172a',
            fontSize: '0.88rem',
            outline: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        />
        <button
          onClick={() => handleSendPrompt()}
          style={{
            background: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
            transition: 'all 0.2s',
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
