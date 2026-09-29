import React, { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Sun, BarChart2 } from 'lucide-react';
import { CityOption } from '../types';

interface HeaderProps {
  currentCity: CityOption;
  onSelectCity: (city: CityOption) => void;
  onOpenCommand: () => void;
  connectionStatus: 'connected' | 'fallback' | 'loading';
  onOpenValidation?: () => void;
}

const CITIES: CityOption[] = [
  { name: 'Mumbai', region: 'Maharashtra', aqi: 168, temp: 28, condition: 'Haze', wind: 'NW 12 km/h' },
  { name: 'Delhi NCR', region: 'Northern Plains', aqi: 248, temp: 31, condition: 'Smoggy', wind: 'W 8 km/h' },
  { name: 'Bengaluru', region: 'Karnataka', aqi: 78, temp: 24, condition: 'Pleasant', wind: 'SE 15 km/h' },
  { name: 'Singapore', region: 'Marina Bay', aqi: 42, temp: 30, condition: 'Tropical Breeze', wind: 'E 10 km/h' },
  { name: 'London', region: 'Greater London', aqi: 36, temp: 18, condition: 'Clear', wind: 'SW 14 km/h' },
];

export const Header: React.FC<HeaderProps> = ({ currentCity, onSelectCity, onOpenCommand, connectionStatus, onOpenValidation }) => {
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
        <span className="nav-search-placeholder">Search location, area or pollutant...</span>
        <kbd className="nav-search-kbd">⌘ K</kbd>
      </div>

      {/* Right Utility Controls */}
      <div className="nav-actions">
        {/* Date / Time Pill */}
        <div className="pill-badge pill-datetime">
          <div className="weather-sun-icon" title="Hazy Sunshine">
            <Sun size={17} color="#F59E0B" />
          </div>
          <div className="datetime-text">
            <span className="date-str">{currentDate}</span>
            <span className="time-str">{currentTime}</span>
          </div>
        </div>

        {/* API Connection Indicator */}
        <div className="pill-badge pill-connection" style={{ padding: '0.4rem 0.75rem', gap: '6px' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%', 
            backgroundColor: connectionStatus === 'connected' ? '#10B981' : connectionStatus === 'fallback' ? '#F59E0B' : '#9CA3AF'
          }}></span>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {connectionStatus === 'connected' ? 'Environmental API connected' : connectionStatus === 'fallback' ? 'Demo fallback active' : 'Connecting...'}
          </span>
        </div>

        {/* Validation Toggle */}
        {onOpenValidation && (
          <button
            className="pill-badge pill-connection"
            style={{ padding: '0.4rem 0.75rem', gap: '5px', cursor: 'pointer', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
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
            <div className="dropdown-menu">
              <div className="dropdown-header">Select Digital Twin</div>
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
                  <span className="city-label">{c.name}, {c.region}</span>
                  <span className={`city-aqi ${c.aqi < 50 ? 'badge-green' : c.aqi < 200 ? 'badge-amber' : 'badge-red'}`}>
                    {c.aqi} AQI
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Avatar Pill */}
        <button className="user-avatar-pill" title="User Profile: Khushi B.">
          <div className="avatar-ring">
            <span className="avatar-initials">KB</span>
            <span className="online-indicator"></span>
          </div>
        </button>
      </div>
    </header>
  );
};
