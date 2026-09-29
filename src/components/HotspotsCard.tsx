import React, { useEffect, useState } from 'react';
import { ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { Hotspot } from '../types';
import { api, HotspotItem } from '../services/api';

interface HotspotsCardProps {
  city: string;
  onSelectHotspot: (name: string, hotspot?: HotspotItem) => void;
}

// Fallback static data if API is unavailable
const FALLBACK_LEADERBOARD = [
  { rank: 1, name: 'Kurla', tag: 'Industrial Zone', aqi: 218, rankClass: 'rank-1', minimap_top: '50%', minimap_left: '62%' },
  { rank: 2, name: 'Bhandup', tag: 'Manufacturing Hub', aqi: 204, rankClass: 'rank-2', minimap_top: '20%', minimap_left: '70%' },
  { rank: 3, name: 'Dadar', tag: 'Transit Intersection', aqi: 196, rankClass: 'rank-3', minimap_top: '60%', minimap_left: '46%' },
  { rank: 4, name: 'Andheri', tag: 'Metro Corridor', aqi: 182, rankClass: 'rank-gray', minimap_top: '26%', minimap_left: '42%' },
  { rank: 5, name: 'Lower Parel', tag: 'High-Rise Cluster', aqi: 176, rankClass: 'rank-gray', minimap_top: '72%', minimap_left: '38%' },
];

const RANK_CLASSES = ['rank-1', 'rank-2', 'rank-3', 'rank-gray', 'rank-gray'];

function getRankClass(index: number): string {
  return RANK_CLASSES[index] || 'rank-gray';
}

function getStatusBadge(status: string): { label: string; color: string } {
  if (status === 'OBSERVED') return { label: 'OBSERVED', color: '#10B981' };
  if (status === 'DEMO_FALLBACK') return { label: 'DEMO', color: '#F59E0B' };
  return { label: status, color: '#9CA3AF' };
}

export const HotspotsCard: React.FC<HotspotsCardProps> = ({ city, onSelectHotspot }) => {
  const [hotspots, setHotspots] = useState<HotspotItem[] | null>(null);
  const [dataStatus, setDataStatus] = useState<string>('loading');
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setError(false);
    setHotspots(null);
    setDataStatus('loading');

    api.getHotspots(city)
      .then(data => {
        if (!mounted) return;
        setHotspots(data.hotspots);
        setDataStatus(data.status);
      })
      .catch(() => {
        if (!mounted) return;
        setError(true);
        setDataStatus('DEMO_FALLBACK');
      });

    return () => { mounted = false; };
  }, [city]);

  const statusBadge = getStatusBadge(dataStatus);

  // Use backend data if available, otherwise fallback
  const leaderboard = hotspots
    ? hotspots.slice(0, 5).map((h, i) => ({
        rank: i + 1,
        name: h.name,
        tag: h.category,
        aqi: h.aqi,
        rankClass: getRankClass(i),
        minimap_top: h.minimap_top,
        minimap_left: h.minimap_left,
        hotspotData: h,
      }))
    : FALLBACK_LEADERBOARD.map(h => ({ ...h, hotspotData: undefined }));

  const minimapNodes = hotspots
    ? hotspots.slice(0, 4).map(h => ({
        id: h.id,
        name: h.name,
        aqi: h.aqi,
        top: h.minimap_top,
        left: h.minimap_left,
        isCritical: h.aqi >= 200,
        hotspotData: h,
      }))
    : [
        { id: 'andheri', name: 'Andheri', aqi: 182, top: '26%', left: '42%', isCritical: false, hotspotData: undefined },
        { id: 'bandra', name: 'Bandra', aqi: 188, top: '44%', left: '40%', isCritical: false, hotspotData: undefined },
        { id: 'dadar', name: 'Dadar', aqi: 196, top: '60%', left: '46%', isCritical: false, hotspotData: undefined },
        { id: 'kurla', name: 'Kurla', aqi: 218, top: '50%', left: '62%', isCritical: true, hotspotData: undefined },
      ];

  return (
    <div className="analytics-card hotspots-card">
      <div className="card-header-bar">
        <h2 className="card-title">Pollution Hotspots</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Data status badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)', fontSize: '0.65rem', fontWeight: 600,
          }}>
            {error
              ? <WifiOff size={10} color="#F59E0B" />
              : <Wifi size={10} color={statusBadge.color} />
            }
            <span style={{ color: statusBadge.color }}>{statusBadge.label}</span>
          </div>
          <div className="card-filter-dropdown">
            <button className="pill-filter-btn">
              <span>PM2.5</span>
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="hotspots-grid-content">
        {/* Left: Minimap Widget */}
        <div className="hotspots-minimap-container">
          <img src="/assets/mumbai_minimap.jpg" alt="Mumbai Coastline Hotspot Map" className="minimap-base-img" />

          <div className="minimap-nodes-layer">
            {minimapNodes.map(node => (
              <div
                key={node.id}
                className={`mini-node ${node.isCritical ? 'node-kurla' : 'node-andheri'}`}
                style={{ top: node.top, left: node.left }}
                onClick={() => onSelectHotspot(node.name, node.hotspotData as HotspotItem | undefined)}
                title={`${node.name}: ${node.aqi} AQI`}
              >
                <span className={`mini-ping ${node.isCritical ? 'ping-crimson' : ''}`}></span>
                <span className={`mini-dot ${node.isCritical ? 'dot-crimson' : ''}`}></span>
                <span className="mini-label">{node.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="hotspots-leaderboard">
          <div className="lb-header-row">
            <span className="lb-col-title">Top Hotspots</span>
            <span className="lb-col-metric">
              {dataStatus === 'loading' ? 'Loading...' : 'Sensor Readings'}
            </span>
          </div>

          <div className="lb-items-stack">
            {leaderboard.map((item) => (
              <div
                key={item.name}
                className="lb-item"
                onClick={() => onSelectHotspot(item.name, item.hotspotData as HotspotItem | undefined)}
              >
                <div className={`lb-rank-badge ${item.rankClass}`}>{item.rank}</div>
                <div className="lb-name-group">
                  <span className="lb-name">{item.name}</span>
                  <span className="lb-tag">{item.tag}</span>
                </div>
                <div className="lb-val-group">
                  <span className="lb-val">{item.aqi}</span>
                  <span className="lb-unit">AQI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
