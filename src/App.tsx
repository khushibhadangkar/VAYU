import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DigitalTwinViewer } from './components/DigitalTwinViewer';
import { ForecastPanel } from './components/ForecastPanel';
import { HotspotsCard } from './components/HotspotsCard';
import { SourceContributionCard } from './components/SourceContributionCard';
import { CommandPalette } from './components/CommandPalette';
import { ScenarioPanel } from './components/ScenarioSimulationModal';
import { TelemetryPopover } from './components/TelemetryPopover';
import { ValidationPanel } from './components/ValidationPanel';
import { OverviewScreen } from './components/OverviewScreen';
import { DataTrustPanel } from './components/DataTrustPanel';
import { VayuCopilot } from './components/VayuCopilot';
import { ExecutiveBriefModal } from './components/ExecutiveBriefModal';
import { FeasibilityScalabilityPanel } from './components/FeasibilityScalabilityPanel';
import { CityOption, DiurnalData, Hotspot } from './types';
import { api, HotspotItem, ScenarioData } from './services/api';

const DIURNAL_CYCLE: Record<number, DiurnalData> = {
  6: { aqi: 184, pm25: 78, pm10: 128, no2: 52, so2: 9, o3: 64, desc: 'Morning Inversion Peak' },
  9: { aqi: 198, pm25: 88, pm10: 142, no2: 68, so2: 11, o3: 78, desc: 'Rush Hour Congestion' },
  12: { aqi: 168, pm25: 68, pm10: 112, no2: 42, so2: 8, o3: 96, desc: 'Moderate Afternoon' },
  15: { aqi: 144, pm25: 54, pm10: 96, no2: 36, so2: 7, o3: 110, desc: 'Coastal Sea Breeze Dispersion' },
  18: { aqi: 182, pm25: 76, pm10: 124, no2: 58, so2: 9, o3: 84, desc: 'Evening Commute Inversion' },
  21: { aqi: 174, pm25: 72, pm10: 118, no2: 48, so2: 8, o3: 72, desc: 'Night Stagnation' },
};

export const App: React.FC = () => {
  const [currentCity, setCurrentCity] = useState<CityOption>({
    name: 'Mumbai',
    region: 'Maharashtra, India',
    aqi: 168,
    temp: 28,
    condition: 'Haze',
    wind: 'NW 12 km/h',
  });

  const [activeNav, setActiveNav] = useState('overview');
  const [currentHour, setCurrentHour] = useState(12);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'fallback' | 'loading'>('loading');
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [lastScenarioResult, setLastScenarioResult] = useState<ScenarioData | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    setConnectionStatus('loading');

    api.getEnvironment(currentCity.name)
      .then((data) => {
        if (!isMounted) return;
        setCurrentCity((prev) => ({
          ...prev,
          region: data.region || prev.region,
          aqi: data.air_quality.aqi,
          temp: data.weather.temperature,
          wind: `${data.weather.wind_direction} ${data.weather.wind_speed} km/h`,
        }));
        setConnectionStatus(data.status === 'DEMO_FALLBACK' ? 'fallback' : 'connected');
      })
      .catch((err) => {
        console.error('API Error:', err);
        if (isMounted) setConnectionStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, [currentCity.name]);

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
    setPopoverPos({ top: rect.top, left: rect.left + rect.width / 2 });
  };

  const handleSelectHotspotByName = (name: string, hotspotData?: HotspotItem) => {
    const enriched: Hotspot = {
      id: hotspotData?.id ?? name.toLowerCase().replace(/\s+/g, ''),
      name,
      aqi: hotspotData?.aqi ?? (name === 'Kurla' ? 218 : name === 'Dadar' ? 196 : 182),
      category: hotspotData?.category ?? 'Dense Urban Cluster & Arterial Highway',
      top: hotspotData?.minimap_top ?? '40%',
      left: hotspotData?.minimap_left ?? '50%',
      primary_pollutant: hotspotData?.primary_pollutant,
      severity: hotspotData?.severity,
      pm25: hotspotData?.pm25,
      pm10: hotspotData?.pm10,
      notes: hotspotData?.notes,
      source_types: hotspotData?.source_types,
    };
    setSelectedHotspot(enriched);
    setPopoverPos({ top: 340, left: window.innerWidth * 0.45 });
  };

  const handleCommandAction = (action: string) => {
    if (action.startsWith('nav-')) {
      setActiveNav(action.replace('nav-', ''));
    } else if (action.startsWith('focus-')) {
      const place = action.replace('focus-', '');
      handleSelectHotspotByName(place.charAt(0).toUpperCase() + place.slice(1));
      setActiveNav('hotspots');
    }
  };

  const handleApplyScenario = (projectedAqi: number, scenarioResult?: ScenarioData) => {
    setCurrentCity((prev) => ({ ...prev, aqi: projectedAqi }));
    if (scenarioResult) {
      setLastScenarioResult(scenarioResult);
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'copilot':
        return (
          <div className="center-stage-column" style={{ gridColumn: '2 / 4', overflowY: 'auto' }}>
            <VayuCopilot
              currentCity={currentCity}
              onApplyPlanToScenario={(fleet, dust, ind) => {
                setActiveNav('scenarios');
              }}
              onSelectView={setActiveNav}
            />
          </div>
        );

      case 'scenarios':
        return (
          <div className="center-stage-column" style={{ gridColumn: '2 / 4', overflowY: 'auto' }}>
            <ScenarioPanel
              isOpen={true}
              city={currentCity.name}
              onClose={() => setActiveNav('overview')}
              onApplyScenario={handleApplyScenario}
            />
          </div>
        );

      case 'overview':
        return (
          <div className="center-stage-column" style={{ gridColumn: '2 / 4', overflowY: 'auto' }}>
            <OverviewScreen
              currentCity={currentCity}
              onSelectView={setActiveNav}
              onOpenExecutiveBrief={() => setIsBriefModalOpen(true)}
            />
          </div>
        );

      case 'digital-twin':
        return (
          <div className="center-stage-column" style={{ gridColumn: '2 / 4', overflowY: 'auto' }}>
            <DigitalTwinViewer
              currentCity={currentCity}
              diurnalData={diurnalData}
              currentHour={currentHour}
              onHourChange={setCurrentHour}
              onHotspotClick={handleHotspotClick}
            />
          </div>
        );

      case 'hotspots':
        return (
          <div className="center-stage-column" style={{ gridColumn: '2 / 4', overflowY: 'auto' }}>
            <DigitalTwinViewer
              currentCity={currentCity}
              diurnalData={diurnalData}
              currentHour={currentHour}
              onHourChange={setCurrentHour}
              onHotspotClick={handleHotspotClick}
            />
            <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
              <HotspotsCard city={currentCity.name} onSelectHotspot={handleSelectHotspotByName} />
            </div>
          </div>
        );

      case 'sources':
        return (
          <div className="center-stage-column" style={{ gridColumn: '2 / 4', overflowY: 'auto' }}>
            <DigitalTwinViewer
              currentCity={currentCity}
              diurnalData={diurnalData}
              currentHour={currentHour}
              onHourChange={setCurrentHour}
              onHotspotClick={handleHotspotClick}
            />
            <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
              <SourceContributionCard city={currentCity.name} currentAqi={diurnalData.aqi} />
            </div>
          </div>
        );

      case 'forecast':
        return (
          <>
            <div className="center-stage-column">
              <DigitalTwinViewer
                currentCity={currentCity}
                diurnalData={diurnalData}
                currentHour={currentHour}
                onHourChange={setCurrentHour}
                onHotspotClick={handleHotspotClick}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              <ForecastPanel city={currentCity.name} onOpenSimulationModal={() => setIsSimModalOpen(true)} />
            </div>
          </>
        );

      case 'validation':
        return (
          <>
            <div className="center-stage-column">
              <DigitalTwinViewer
                currentCity={currentCity}
                diurnalData={diurnalData}
                currentHour={currentHour}
                onHourChange={setCurrentHour}
                onHotspotClick={handleHotspotClick}
              />
            </div>
            <div
              className="forecast-panel-card"
              style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', flex: 1 }}
            >
              <div className="forecast-panel-header" style={{ marginBottom: '8px' }}>
                <h2 className="fph-title">Historical Validation Engine</h2>
              </div>
              <ValidationPanel city={currentCity.name} />
            </div>
          </>
        );

      case 'scalability':
        return (
          <div style={{ gridColumn: '2 / 4', overflowY: 'auto', height: '100%' }}>
            <FeasibilityScalabilityPanel currentCity={currentCity} />
          </div>
        );

      case 'data-trust':
        return (
          <div style={{ gridColumn: '2 / 4', overflowY: 'auto', height: '100%' }}>
            <DataTrustPanel />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="app-layout"
      onClick={() => {
        setSelectedHotspot(null);
      }}
    >
      {/* Ambient Backing Glows */}
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-center-right"></div>
      <div className="ambient-glow glow-bottom-center"></div>

      {/* Top Header */}
      <Header
        currentCity={currentCity}
        onSelectCity={setCurrentCity}
        onOpenCommand={() => setIsCommandOpen(true)}
        connectionStatus={connectionStatus}
        onOpenValidation={() => setActiveNav('validation')}
        onOpenCopilot={() => setActiveNav('copilot')}
        onOpenExecutiveBrief={() => setIsBriefModalOpen(true)}
      />

      {/* 3-COLUMN MAIN DASHBOARD GRID */}
      <main className="dashboard-body">
        {/* COLUMN 1: Left Sidebar Floating Dock */}
        <Sidebar activeView={activeNav} onSelectView={setActiveNav} />

        {/* COLUMNS 2 & 3: Content */}
        {renderContent()}
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

      <ExecutiveBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        currentCity={currentCity}
        scenarioData={lastScenarioResult}
      />
    </div>
  );
};
