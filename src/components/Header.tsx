import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Sun, BarChart2, Bot, FileText, Sparkles } from 'lucide-react';
import { CityOption } from '../types';

interface HeaderProps {
  currentCity: CityOption;
  onSelectCity: (city: CityOption) => void;
  onOpenCommand: () => void;
  connectionStatus: 'connected' | 'fallback' | 'loading';
  onOpenValidation?: () => void;
  onOpenCopilot?: () => void;
  onOpenExecutiveBrief?: () => void;
}

const CITIES: CityOption[] = [
  { name: 'Mumbai', region: 'Maharashtra, India', aqi: 168, temp: 28, condition: 'Haze', wind: 'NW 12 km/h' },
  { name: 'Delhi NCR', region: 'Northern Plains, India', aqi: 248, temp: 31, condition: 'Smoggy', wind: 'W 8 km/h' },
  { name: 'Bengaluru', region: 'Karnataka, India', aqi: 78, temp: 24, condition: 'Pleasant', wind: 'SE 15 km/h' },
  { name: 'Kolkata', region: 'West Bengal, India', aqi: 182, temp: 30, condition: 'Humid Haze', wind: 'S 10 km/h' },
  { name: 'Chennai', region: 'Tamil Nadu, India', aqi: 94, temp: 32, condition: 'Coastal Wind', wind: 'E 18 km/h' },
  { name: 'Hyderabad', region: 'Telangana, India', aqi: 124, temp: 29, condition: 'Partly Cloudy', wind: 'SW 12 km/h' },
  { name: 'Singapore', region: 'Marina Bay', aqi: 42, temp: 30, condition: 'Tropical Breeze', wind: 'E 10 km/h' },
  { name: 'London', region: 'Greater London, UK', aqi: 36, temp: 18, condition: 'Clear', wind: 'SW 14 km/h' },
  { name: 'New York', region: 'New York, USA', aqi: 48, temp: 22, condition: 'Breezy', wind: 'NW 16 km/h' },
  { name: 'Tokyo', region: 'Kanto, Japan', aqi: 38, temp: 20, condition: 'Clear', wind: 'NE 11 km/h' },
];

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onSelectCity,
  onOpenCommand,
  connectionStatus,
  onOpenValidation,
  onOpenCopilot,
  onOpenExecutiveBrief,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:24 AM');
  const [currentDate, setCurrentDate] = useState('Mon, 22 Sept 2026');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="top-nav" id="topNav">
      {/* Brand Logo */}
      <div className="nav-brand">
        <div className="brand-logo-mark" aria-hidden="true">
          <div className="orb-core"></div>
          <div className="orb-swirl"></div>
          <div className="orb-highlight"></div>
        </div>
        <div className="brand-text-container">
          <span className="brand-title">VAYU</span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: 'white',
              padding: '1px 6px',
              borderRadius: '4px',
              marginLeft: '6px',
            }}
          >
            TWIN v2.4
          </span>
        </div>
      </div>

      {/* Center Search Pill */}
      <div
        className="nav-search-wrapper"
        onClick={onOpenCommand}
        role="button"
        tabIndex={0}
        title="Click or press ⌘K to search"
      >
        <Search className="nav-search-icon" size={16} />
        <span className="nav-search-placeholder">Search location, sensor node or pollutant...</span>
        <kbd className="nav-search-kbd">⌘ K</kbd>
      </div>

      {/* Right Utility Controls */}
      <div className="nav-actions">
        {/* Date / Time Pill */}
        <div className="pill-badge pill-datetime">
          <div className="weather-sun-icon" title="Atmospheric Conditions">
            <Sun size={16} color="#F59E0B" />
          </div>
          <div className="datetime-text">
            <span className="date-str">{currentDate}</span>
            <span className="time-str">{currentTime}</span>
          </div>
        </div>

        {/* Live Satellite & Sensor Feed Badge */}
        <div
          className="pill-badge pill-connection"
          style={{
            padding: '0.4rem 0.75rem',
            gap: '6px',
            background: connectionStatus === 'connected' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
            border: connectionStatus === 'connected' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(245,158,11,0.25)',
          }}
          title={connectionStatus === 'connected' ? 'Streaming live Open-Meteo & CAAQMS telemetry' : 'Synthetic twin fallback active'}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connectionStatus === 'connected' ? '#10B981' : connectionStatus === 'fallback' ? '#F59E0B' : '#9CA3AF',
              boxShadow: connectionStatus === 'connected' ? '0 0 8px #10B981' : 'none',
            }}
          ></span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: connectionStatus === 'connected' ? '#059669' : '#d97706' }}>
            {connectionStatus === 'connected' ? 'LIVE SENSOR STREAM' : 'SIMULATED TWIN'}
          </span>
        </div>

        {/* AI Copilot Quick Launcher Button */}
        {onOpenCopilot && (
          <button
            className="pill-badge"
            style={{
              padding: '0.4rem 0.75rem',
              gap: '6px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(2,132,199,0.12) 0%, rgba(56,189,248,0.12) 100%)',
              border: '1px solid rgba(2,132,199,0.3)',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={onOpenCopilot}
            title="Launch VAYU AI Environmental Policy Copilot"
          >
            <Bot size={13} color="#0284c7" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7' }}>AI Copilot</span>
          </button>
        )}

        {/* 1-Click Executive Policy Brief Export Button */}
        {onOpenExecutiveBrief && (
          <button
            className="pill-badge"
            style={{
              padding: '0.4rem 0.75rem',
              gap: '6px',
              cursor: 'pointer',
              background: '#0f172a',
              color: '#ffffff',
              border: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={onOpenExecutiveBrief}
            title="Generate Official Municipal Executive Brief"
          >
            <FileText size={13} color="#38bdf8" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>Executive Brief</span>
          </button>
        )}

        {/* Historical Validation Toggle */}
        {onOpenValidation && (
          <button
            className="pill-badge"
            style={{
              padding: '0.4rem 0.75rem',
              gap: '5px',
              cursor: 'pointer',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={onOpenValidation}
            title="Open Historical Validation Panel"
          >
            <BarChart2 size={12} color="#10B981" />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10B981' }}>Validation</span>
          </button>
        )}

        {/* City Selector Dropdown */}
        <div className={`city-selector-dropdown ${dropdownOpen ? 'open' : ''}`}>
          <button
            className="pill-badge pill-location"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <MapPin className="pin-icon" size={14} />
            <span className="location-name">{currentCity.name}</span>
            <ChevronDown className="chevron-icon" size={12} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu" style={{ maxHeight: '340px', overflowY: 'auto' }}>
              <div className="dropdown-header">Select Digital Twin Airshed</div>
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  className={`dropdown-item ${c.name === currentCity.name ? 'active' : ''}`}
                  onClick={() => {
                    onSelectCity(c);
                    setDropdownOpen(false);
                  }}
                >
                  <span className={`city-dot ${c.name === currentCity.name ? 'active' : ''}`}></span>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span className="city-label">{c.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{c.region}</span>
                  </div>
                  <span
                    className={`city-aqi ${
                      c.aqi < 50 ? 'badge-green' : c.aqi < 200 ? 'badge-amber' : 'badge-red'
                    }`}
                    style={{ marginLeft: 'auto' }}
                  >
                    {c.aqi} AQI
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Avatar Pill */}
        <button className="user-avatar-pill" title="Lead Environmental Planner">
          <div className="avatar-ring">
            <span className="avatar-initials">KB</span>
            <span className="online-indicator"></span>
          </div>
        </button>
      </div>
    </header>
  );
};
