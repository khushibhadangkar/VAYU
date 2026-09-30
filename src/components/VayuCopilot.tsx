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
        padding: '24px',
        background: 'linear-gradient(145deg, #0b1523 0%, #152238 100%)',
        borderRadius: '20px',
        color: '#f8fafc',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(56,189,248,0.4)',
            }}
          >
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                VAYU Policy Copilot
              </h2>
              <span
                style={{
                  background: 'rgba(56,189,248,0.15)',
                  color: '#38bdf8',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: '1px solid rgba(56,189,248,0.3)',
                }}
              >
                AI ADVISOR • v2.4
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
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
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#cbd5e1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} /> Refresh Audit
        </button>
      </div>

      {/* Autonomous Action Plan Card */}
      {recommendation && (
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            position: 'relative',
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    background:
                      recommendation.threatLevel === 'CRITICAL'
                        ? 'rgba(239,68,68,0.2)'
                        : recommendation.threatLevel === 'ELEVATED'
                        ? 'rgba(245,158,11,0.2)'
                        : 'rgba(16,185,129,0.2)',
                    color:
                      recommendation.threatLevel === 'CRITICAL'
                        ? '#f87171'
                        : recommendation.threatLevel === 'ELEVATED'
                        ? '#fbbf24'
                        : '#34d399',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {recommendation.threatLevel} STATUS
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Target: {currentCity.name} Urban Airshed
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                {recommendation.title}
              </h3>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Projected Benefit</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                -{recommendation.projectedAqiDrop} AQI
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
            {recommendation.summary}
          </p>

          {/* Directives Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Zap size={13} /> IMMEDIATE PROTOCOL (0-4h)
              </div>
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                {recommendation.immediateAction}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertTriangle size={13} /> METEOROLOGICAL CONSTRAINT
              </div>
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                {recommendation.meteorologicalFactor}
              </div>
            </div>
          </div>

          {/* Intervention Parameters Banner */}
          <div
            style={{
              background: 'rgba(2,132,199,0.12)',
              border: '1px solid rgba(2,132,199,0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>EV Fleet</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{recommendation.recommendedFleetPct}%</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Dust Suppression</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{recommendation.recommendedDustPct}%</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Industrial Shift</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{recommendation.recommendedIndustrialShiftPct}%</span>
              </div>
            </div>

            <button
              onClick={handleExecutePlan}
              style={{
                background: applied ? '#10b981' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(2,132,199,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {applied ? (
                <>
                  <CheckCircle2 size={16} /> Applied to Scenario Engine
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Auto-Test in Simulation <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      <div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' }}>
          Ask Copilot or Select Scenario Prompt:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(p)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                textAlign: 'left',
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
          minHeight: '140px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '14px',
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {chatLog.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', margin: 'auto' }}>
            Type a policy question or select a prompt above to interrogate the VAYU Atmospheric Copilot.
          </div>
        ) : (
          chatLog.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.sender === 'user' ? 'rgba(2,132,199,0.35)' : 'rgba(255,255,255,0.07)',
                border: msg.sender === 'user' ? '1px solid rgba(2,132,199,0.5)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 14px',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: msg.sender === 'user' ? '#7dd3fc' : '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
                {msg.sender === 'user' ? 'Urban Planner / Municipal Officer' : 'VAYU AI Environmental Agent'} • {msg.timestamp}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#f1f5f9', lineHeight: 1.5 }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div style={{ alignSelf: 'flex-start', color: '#38bdf8', fontSize: '0.8rem', fontStyle: 'italic' }}>
            VAYU Copilot is synthesizing atmospheric telemetry & policy models...
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
          placeholder={`Ask VAYU Copilot about ${currentCity.name}'s air quality interventions...`}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleSendPrompt()}
          style={{
            background: '#0284c7',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
