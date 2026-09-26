import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DigitalTwinViewer } from './components/DigitalTwinViewer';
import { ForecastPanel } from './components/ForecastPanel';
import { HotspotsCard } from './components/HotspotsCard';
import { SourceContributionCard } from './components/SourceContributionCard';
import { CommandPalette } from './components/CommandPalette';
import { ScenarioSimulationModal } from './components/ScenarioSimulationModal';
import { TelemetryPopover } from './components/TelemetryPopover';
import { CityOption, DiurnalData, Hotspot } from './types';

const DIURNAL_CYCLE: Record<number, DiurnalData> = {
  6:  { aqi: 184, pm25: 78, pm10: 128, no2: 52, so2: 9, o3: 64, desc: 'Morning Inversion Peak' },
  9:  { aqi: 198, pm25: 88, pm10: 142, no2: 68, so2: 11, o3: 78, desc: 'Rush Hour Congestion' },
  12: { aqi: 168, pm25: 68, pm10: 112, no2: 42, so2: 8, o3: 96, desc: 'Moderate Afternoon' },
  15: { aqi: 144, pm25: 54, pm10: 96, no2: 36, so2: 7, o3: 110, desc: 'Coastal Sea Breeze Dispersion' },
  18: { aqi: 182, pm25: 76, pm10: 124, no2: 58, so2: 9, o3: 84, desc: 'Evening Commute Inversion' },
  21: { aqi: 174, pm25: 72, pm10: 118, no2: 48, so2: 8, o3: 72, desc: 'Night Stagnation' },
};

export const App: React.FC = () => {
  const [currentCity, setCurrentCity] = useState<CityOption>({
    name: 'Mumbai',
    region: 'Maharashtra',
    aqi: 168,
    temp: 28,
    condition: 'Haze',
    wind: 'NW 12 km/h',
  });

  const [activeNav, setActiveNav] = useState('overview');
  const [currentHour, setCurrentHour] = useState(12);

  // Modals & Popovers
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  const diurnalData = DIURNAL_CYCLE[currentHour] || DIURNAL_CYCLE[12];

  const handleHotspotClick = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSelectedHotspot(hotspot);
    setPopoverPos({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  };

  const handleSelectHotspotByName = (name: string) => {
    const fakeHotspot: Hotspot = {
      id: name.toLowerCase().replace(/\s+/g, ''),
      name,
      aqi: name === 'Kurla' ? 218 : name === 'Dadar' ? 196 : 182,
      category: 'Dense Urban Cluster & Arterial Highway',
      top: '40%',
      left: '50%',
    };
    setSelectedHotspot(fakeHotspot);
    setPopoverPos({ top: 380, left: window.innerWidth * 0.45 });
  };

  const handleCommandAction = (action: string) => {
    if (action.startsWith('focus-')) {
      const place = action.replace('focus-', '');
      handleSelectHotspotByName(place.charAt(0).toUpperCase() + place.slice(1));
    } else if (action === 'launch-sim') {
      setIsSimModalOpen(true);
    }
  };

  const handleApplyScenario = (projectedAqi: number) => {
    setCurrentCity((prev) => ({ ...prev, aqi: projectedAqi }));
  };

  return (
    <div className="app-layout" onClick={() => setSelectedHotspot(null)}>
      {/* Ambient Backing Glows */}
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-center-right"></div>
      <div className="ambient-glow glow-bottom-center"></div>

      {/* Top Header */}
      <Header
        currentCity={currentCity}
        onSelectCity={setCurrentCity}
        onOpenCommand={() => setIsCommandOpen(true)}
      />

      {/* Main Dashboard Layout */}
      <main className="dashboard-body">
        {/* Left Sidebar Floating Dock */}
        <Sidebar activeView={activeNav} onSelectView={setActiveNav} />

        {/* Center & Right Stage */}
        <section className="stage-container">
          {/* Upper Stage: Digital Twin Hero & Forecast Panel */}
          <div className="hero-forecast-split">
            <DigitalTwinViewer
              currentCity={currentCity}
              diurnalData={diurnalData}
              currentHour={currentHour}
              onHourChange={setCurrentHour}
              onHotspotClick={handleHotspotClick}
            />

            <ForecastPanel onOpenSimulationModal={() => setIsSimModalOpen(true)} />
          </div>

          {/* Lower Stage: Pollution Hotspots & Source Contribution */}
          <div className="bottom-analytics-split">
            <HotspotsCard onSelectHotspot={handleSelectHotspotByName} />
            <SourceContributionCard currentAqi={diurnalData.aqi} />
          </div>
        </section>
      </main>

      {/* Modals & Popovers */}
      <TelemetryPopover
        hotspot={selectedHotspot}
        position={popoverPos}
        onClose={() => setSelectedHotspot(null)}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectAction={handleCommandAction}
      />

      <ScenarioSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onApplyScenario={handleApplyScenario}
      />
    </div>
  );
};
