import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Hotspot } from '../types';

interface HotspotsCardProps {
  onSelectHotspot: (name: string) => void;
}

const LEADERBOARD = [
  { rank: 1, name: 'Kurla', tag: 'Industrial Zone', aqi: 218, rankClass: 'rank-1' },
  { rank: 2, name: 'Bhandup', tag: 'Manufacturing Hub', aqi: 204, rankClass: 'rank-2' },
  { rank: 3, name: 'Dadar', tag: 'Transit Intersection', aqi: 196, rankClass: 'rank-3' },
  { rank: 4, name: 'Andheri', tag: 'Metro Corridor', aqi: 182, rankClass: 'rank-gray' },
  { rank: 5, name: 'Lower Parel', tag: 'High-Rise Cluster', aqi: 176, rankClass: 'rank-gray' },
];

export const HotspotsCard: React.FC<HotspotsCardProps> = ({ onSelectHotspot }) => {
  return (
    <div className="analytics-card hotspots-card">
      <div className="card-header-bar">
        <h2 className="card-title">Pollution Hotspots</h2>
        <div className="card-filter-dropdown">
          <button className="pill-filter-btn">
            <span>PM2.5</span>
            <ChevronDown size={12} />
          </button>
        </div>
      </div>

      <div className="hotspots-grid-content">
        {/* Left: Minimap Widget */}
        <div className="hotspots-minimap-container">
          <img src="/assets/mumbai_minimap.jpg" alt="Mumbai Coastline Hotspot Map" className="minimap-base-img" />
          
          <div className="minimap-nodes-layer">
            <div 
              className="mini-node node-andheri" 
              style={{ top: '26%', left: '42%' }} 
              onClick={() => onSelectHotspot('Andheri')}
              title="Andheri: 182 AQI"
            >
              <span className="mini-ping"></span>
              <span className="mini-dot"></span>
              <span className="mini-label">Andheri</span>
            </div>
            <div 
              className="mini-node node-bandra" 
              style={{ top: '44%', left: '40%' }} 
              onClick={() => onSelectHotspot('Bandra')}
              title="Bandra: 188 AQI"
            >
              <span className="mini-ping"></span>
              <span className="mini-dot"></span>
              <span className="mini-label">Bandra</span>
            </div>
            <div 
              className="mini-node node-dadar" 
              style={{ top: '60%', left: '46%' }} 
              onClick={() => onSelectHotspot('Dadar')}
              title="Dadar: 196 AQI"
            >
              <span className="mini-ping"></span>
              <span className="mini-dot"></span>
              <span className="mini-label">Dadar</span>
            </div>
            <div 
              className="mini-node node-kurla" 
              style={{ top: '50%', left: '62%' }} 
              onClick={() => onSelectHotspot('Kurla')}
              title="Kurla: 218 AQI"
            >
              <span className="mini-ping ping-crimson"></span>
              <span className="mini-dot dot-crimson"></span>
              <span className="mini-label">Kurla</span>
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="hotspots-leaderboard">
          <div className="lb-header-row">
            <span className="lb-col-title">Top Hotspots</span>
            <span className="lb-col-metric">Sensor Readings</span>
          </div>

          <div className="lb-items-stack">
            {LEADERBOARD.map((item) => (
              <div 
                key={item.name} 
                className="lb-item" 
                onClick={() => onSelectHotspot(item.name)}
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
