import React, { useEffect, useRef, useState } from 'react';
import { Layers, ChevronDown, Wind, Factory, Car, Play, Pause } from 'lucide-react';
import { CityOption, DiurnalData, Hotspot } from '../types';

interface DigitalTwinViewerProps {
  currentCity: CityOption;
  diurnalData: DiurnalData;
  currentHour: number;
  onHourChange: (hour: number) => void;
  onHotspotClick: (hotspot: Hotspot, e: React.MouseEvent) => void;
}

const HOTSPOTS: Hotspot[] = [
  { id: 'bandra', name: 'Bandra', aqi: 188, category: 'High Traffic & Commercial', top: '26%', left: '58%', pulseClass: '', coreClass: 'core-amber' },
  { id: 'dadar', name: 'Dadar', aqi: 196, category: 'Transit Hub & Dense Corridor', top: '38%', left: '56%', pulseClass: 'pulse-delay-1', coreClass: 'core-orange' },
  { id: 'lowerparel', name: 'Lower Parel', aqi: 176, category: 'Commercial High-Rise & Mill Compound', top: '47%', left: '54%', pulseClass: 'pulse-delay-2', coreClass: 'core-hot' },
  { id: 'sion', name: 'Sion', aqi: 189, category: 'Industrial Arterial', top: '57%', left: '58%', pulseClass: '', coreClass: 'core-amber' },
  { id: 'kurla', name: 'Kurla', aqi: 218, category: 'Heavy Industrial & Railway Junction', top: '43%', left: '67%', pulseClass: 'pulse-heavy', coreClass: 'core-crimson' },
];

export const DigitalTwinViewer: React.FC<DigitalTwinViewerProps> = ({
  currentCity,
  diurnalData,
  currentHour,
  onHourChange,
  onHotspotClick,
}) => {
  // Layers state
  const [airQualityActive, setAirQualityActive] = useState(true);
  const [trafficActive, setTrafficActive] = useState(false);
  const [industrialActive, setIndustrialActive] = useState(false);
  const [weatherActive, setWeatherActive] = useState(true);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Wind particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<{ x: number; y: number; length: number; speed: number; opacity: number; angle: number }> = [];
    const count = 65;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 18 + Math.random() * 24,
        speed: 1.2 + Math.random() * 1.6,
        opacity: 0.15 + Math.random() * 0.45,
        angle: Math.PI * 0.22,
      });
    }

    const render = () => {
      if (!weatherActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        const endX = p.x + Math.cos(p.angle) * p.length;
        const endY = p.y + Math.sin(p.angle) * p.length;
        ctx.lineTo(endX, endY);

        const grad = ctx.createLinearGradient(p.x, p.y, endX, endY);
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        grad.addColorStop(0.5, `rgba(186, 230, 253, ${p.opacity})`);
        grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.stroke();

        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        if (p.x > rect.width + 50 || p.y > rect.height + 50) {
          if (Math.random() > 0.5) {
            p.x = Math.random() * rect.width;
            p.y = -30;
          } else {
            p.x = -30;
            p.y = Math.random() * rect.height;
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [weatherActive]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const hours = [6, 9, 12, 15, 18, 21];
    const timer = setInterval(() => {
      onHourChange((prevHour) => {
        const idx = hours.indexOf(prevHour);
        const nextIdx = (idx + 1) % hours.length;
        return hours[nextIdx];
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [isPlaying, onHourChange]);

  const stations = [
    { hour: 6, label: '6 AM', left: '10%' },
    { hour: 9, label: '9 AM', left: '28%' },
    { hour: 12, label: '12 PM', left: '48%' },
    { hour: 15, label: '3 PM', left: '68%' },
    { hour: 18, label: '6 PM', left: '84%' },
    { hour: 21, label: '9 PM', left: '98%' },
  ];

  const currentStation = stations.find((s) => s.hour === currentHour) || stations[2];

  return (
    <div className="twin-viewport-card" id="digitalTwinCard">
      {/* Background Aerial Imagery */}
      <div className="aerial-viewport-bg">
        <img
          src="/assets/mumbai_aerial.jpg"
          alt="Aerial 3D Digital Twin View of Mumbai Coastal Peninsula"
          className="aerial-image"
          style={{
            filter: airQualityActive
              ? 'contrast(1.04) brightness(1.02) saturate(1.08)'
              : 'contrast(1) brightness(1) saturate(0.85)',
          }}
        />
        <div className="aerial-mesh-overlay"></div>
        <div className="aerial-vignette-light"></div>
      </div>

      {/* Dynamic Wind Particle Streamlines Canvas */}
      <canvas ref={canvasRef} className="wind-canvas"></canvas>

      {/* Traffic Overlay SVG */}
      <svg
        className={`traffic-overlay-svg ${trafficActive ? 'active' : ''}`}
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
      >
        <path className="traffic-route route-primary" d="M 120 480 Q 220 380 370 340 T 480 320" />
        <path className="traffic-route route-arterial-1" d="M 370 340 Q 420 310 520 280 T 680 250" />
        <path className="traffic-route route-arterial-2" d="M 450 360 Q 560 380 720 390" />
      </svg>

      {/* EDITORIAL TYPOGRAPHY OVERLAY */}
      <div className="editorial-header-block">
        <span className="editorial-eyebrow">URBAN ENVIRONMENTAL DIGITAL TWIN</span>
        <h1 className="editorial-headline">
          <span className="line-1">Cleaner Cities</span>
          <span className="line-2">Brighter Tomorrows</span>
        </h1>
        <p className="editorial-subcopy">
          AI-powered insights to understand, predict and reduce urban air pollution.
        </p>
      </div>

      {/* FLOATING LIVE METRICS CARD */}
      <div className="floating-metrics-card">
        <div className="fmc-header">
          <div className="fmc-loc-badge">
            <div className="fmc-loc-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="fmc-loc-text">
              <span className="fmc-city">{currentCity.name}</span>
              <span className="fmc-sub">Live Air Quality</span>
            </div>
          </div>

          <div className="fmc-weather-strip">
            <div className="fmc-weather-item">
              <span className="weather-glyph">☀️</span>
              <span className="weather-val">{currentCity.temp}°C</span>
              <span className="weather-cond">{currentCity.condition}</span>
            </div>
            <div className="fmc-weather-divider"></div>
            <div className="fmc-weather-item">
              <span className="wind-glyph">💨</span>
              <span className="wind-dir-arrow">↖</span>
              <span className="wind-label">NW</span>
              <span className="wind-speed">{currentCity.wind}</span>
            </div>
          </div>
        </div>

        {/* AQI Big Row */}
        <div className="fmc-aqi-row">
          <div className="aqi-num-group">
            <span className="aqi-prefix">AQI</span>
            <span className="aqi-value">{diurnalData.aqi}</span>
          </div>
          <div className="aqi-status-badge badge-moderate">
            <span className="status-dot"></span>
            <span className="status-label">Moderate</span>
          </div>
        </div>

        {/* 5 Pollutants Breakdown */}
        <div className="fmc-pollutants-row">
          <div className="pollutant-pill">
            <div className="p-dot dot-pm25"></div>
            <span className="p-name">PM2.5</span>
            <span className="p-val">{diurnalData.pm25}</span>
            <span className="p-unit">µg/m³</span>
          </div>
          <div className="pollutant-pill">
            <div className="p-dot dot-pm10"></div>
            <span className="p-name">PM10</span>
            <span className="p-val">{diurnalData.pm10}</span>
            <span className="p-unit">µg/m³</span>
          </div>
          <div className="pollutant-pill">
            <div className="p-dot dot-no2"></div>
            <span className="p-name">NO₂</span>
            <span className="p-val">{diurnalData.no2}</span>
            <span className="p-unit">µg/m³</span>
          </div>
          <div className="pollutant-pill">
            <div className="p-dot dot-so2"></div>
            <span className="p-name">SO₂</span>
            <span className="p-val">{diurnalData.so2}</span>
            <span className="p-unit">µg/m³</span>
          </div>
          <div className="pollutant-pill">
            <div className="p-dot dot-o3"></div>
            <span className="p-name">O₃</span>
            <span className="p-val">{diurnalData.o3}</span>
            <span className="p-unit">µg/m³</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE HOTSPOT BEACONS */}
      <div className="map-beacons-layer">
        {HOTSPOTS.map((h) => (
          <div
            key={h.id}
            className={`hotspot-beacon ${h.id === 'lowerparel' ? 'active-glow' : ''}`}
            style={{
              top: h.top,
              left: h.left,
              transform: industrialActive && h.id === 'kurla' ? 'translate(-50%, -50%) scale(1.3)' : undefined,
            }}
            onClick={(e) => onHotspotClick(h, e)}
          >
            <div className={`beacon-pulse-ring ${h.pulseClass}`}></div>
            <div className={`beacon-core ${h.coreClass}`}></div>
            <div className={`beacon-label-pill ${h.id === 'lowerparel' ? 'beacon-pill-highlight' : ''}`}>
              {h.name}
            </div>
          </div>
        ))}
      </div>

      {/* MAP CONTROLS PANEL */}
      <div className="map-controls-panel">
        <div className="map-controls-header">
          <Layers size={14} />
          <span>Layers</span>
          <ChevronDown size={10} />
        </div>

        <div className="layer-buttons-stack">
          <button
            className={`layer-pill-btn ${airQualityActive ? 'active' : ''}`}
            onClick={() => setAirQualityActive(!airQualityActive)}
          >
            <span className="layer-icon-dot dot-air"></span>
            <span className="layer-label">Air Quality</span>
          </button>

          <button
            className={`layer-pill-btn ${trafficActive ? 'active' : ''}`}
            onClick={() => setTrafficActive(!trafficActive)}
          >
            <Car size={12} />
            <span className="layer-label">Traffic Density</span>
          </button>

          <button
            className={`layer-pill-btn ${industrialActive ? 'active' : ''}`}
            onClick={() => setIndustrialActive(!industrialActive)}
          >
            <Factory size={12} />
            <span className="layer-label">Industrial Activity</span>
          </button>

          <button
            className={`layer-pill-btn ${weatherActive ? 'active' : ''}`}
            onClick={() => setWeatherActive(!weatherActive)}
          >
            <Wind size={12} />
            <span className="layer-label">Weather (Wind)</span>
          </button>
        </div>
      </div>

      {/* TIMELINE SCRUBBER */}
      <div className="timeline-scrubber-bar">
        <button
          className="timeline-play-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Pause simulation' : 'Play 24-hour simulation'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <div className="timeline-track-wrapper">
          <div className="timeline-rail">
            <div className="timeline-progress-fill" style={{ width: currentStation.left }}></div>
            <div className="timeline-thumb" style={{ left: currentStation.left }}></div>

            <div className="timeline-stations">
              {stations.map((s) => (
                <button
                  key={s.hour}
                  className={`station-mark ${s.hour === currentHour ? 'active' : ''}`}
                  style={{ left: s.left }}
                  onClick={() => {
                    setIsPlaying(false);
                    onHourChange(s.hour);
                  }}
                >
                  <span className="station-dot"></span>
                  <span className="station-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="timeline-range-selector">
          <button className="pill-range-btn">
            <span>24h</span>
            <ChevronDown size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};
