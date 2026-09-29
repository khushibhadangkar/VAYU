import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api, ValidationData } from '../services/api';

interface ValidationPanelProps {
  city: string;
}

function getStatusStyle(status: string) {
  if (status === 'HISTORICAL_VALIDATION') return { color: '#10B981', label: 'HISTORICAL VALIDATION' };
  if (status === 'DEMO_FALLBACK') return { color: '#F59E0B', label: 'DEMO FALLBACK' };
  return { color: '#9CA3AF', label: status };
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ city }) => {
  const [data, setData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.getValidation(city)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { load(); }, [city]);

  const statusStyle = data ? getStatusStyle(data.status) : { color: '#9CA3AF', label: 'Loading…' };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
        Loading validation data…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <AlertCircle size={20} color="#F59E0B" />
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '6px' }}>
          Could not load validation data.
        </p>
        <button onClick={load} style={{
          marginTop: '8px', fontSize: '0.7rem', color: '#0284c7',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px', margin: '8px auto 0',
        }}>
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const samples = data.samples?.slice(0, 8) ?? [];
  const metrics = data.metrics;

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Status + period header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <CheckCircle size={14} color={statusStyle.color} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: statusStyle.color, letterSpacing: '0.06em' }}>
              {statusStyle.label}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            {data.station ?? 'Validation Station'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
            {data.validation_period} · {data.n_samples} samples
          </div>
        </div>
        <button onClick={load} title="Refresh" style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', padding: '4px', cursor: 'pointer', color: 'var(--text-tertiary)',
        }}>
          <RefreshCw size={12} />
        </button>
      </div>

      {/* Key metrics */}
      {metrics && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px',
        }}>
          {[
            { label: 'MAE', value: metrics.mae, unit: 'AQI', desc: 'Mean Absolute Error' },
            { label: 'RMSE', value: metrics.rmse, unit: 'AQI', desc: 'Root Mean Sq. Error' },
            { label: 'Mean Actual', value: metrics.mean_actual, unit: 'AQI', desc: 'Avg. observed AQI' },
            { label: 'Mean Predicted', value: metrics.mean_predicted, unit: 'AQI', desc: 'Avg. model output' },
          ].map(m => (
            <div key={m.label} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
              padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{m.desc}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{m.unit}</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bias direction */}
      {metrics && (
        <div style={{
          fontSize: '0.68rem', color: 'var(--text-secondary)',
          marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>Model bias:</span>
          <span style={{ fontWeight: 700, color: metrics.bias > 0 ? '#F59E0B' : '#10B981' }}>
            {metrics.bias > 0 ? '+' : ''}{metrics.bias} AQI ({metrics.bias_direction})
          </span>
        </div>
      )}

      {/* Sample table */}
      {samples.length > 0 && (
        <div>
          <div style={{
            fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-tertiary)',
            marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Sample Actual vs. Predicted
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: '0.67rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Timestamp', 'Actual', 'Predicted', 'Error'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '4px 6px',
                      color: 'var(--text-tertiary)', fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {samples.map((s, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}>
                    <td style={{ padding: '4px 6px', color: 'var(--text-tertiary)' }}>
                      {s.timestamp.replace('2025-', '')}
                    </td>
                    <td style={{ padding: '4px 6px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {s.actual}
                    </td>
                    <td style={{ padding: '4px 6px', color: '#0284c7' }}>{s.predicted}</td>
                    <td style={{
                      padding: '4px 6px',
                      color: s.error <= 10 ? '#10B981' : s.error <= 20 ? '#F59E0B' : '#EF4444',
                      fontWeight: 600,
                    }}>
                      ±{s.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Methodology note */}
      {data.methodology_note && (
        <div style={{
          marginTop: '10px', padding: '8px 10px',
          background: 'rgba(251,191,36,0.06)', borderRadius: '8px',
          border: '1px solid rgba(251,191,36,0.12)',
          fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
        }}>
          <strong style={{ color: '#F59E0B' }}>Methodology:</strong>{' '}
          {data.methodology_note}
        </div>
      )}
    </div>
  );
};
