import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Layers, ChevronDown, Wind, Factory, Car, Play, Pause, Target } from 'lucide-react';
import { CityOption, DiurnalData, Hotspot } from '../types';
import { api, HotspotItem } from '../services/api';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Instances, Instance, Html } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------------------------------
// 3D SCENE COMPONENTS
// ----------------------------------------------------------------------------

const CityMassing = () => {
  const count = 600;
  
  const buildings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      
      // clustered in center / linear patterns for "roads"
      const dist = Math.sqrt(x*x + z*z);
      const roadX = Math.abs(x % 10) < 1.5;
      const roadZ = Math.abs(z % 10) < 1.5;
      if (roadX || roadZ) continue; // Leave gaps for roads

      const height = Math.max(0.5, Math.random() * 8 * (1 - dist/50));
      const width = 0.8 + Math.random() * 1.5;
      const depth = 0.8 + Math.random() * 1.5;
      
      arr.push({ x, z, height, width, depth });
    }
    return arr;
  }, []);

  return (
    <Instances limit={count} range={count} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#f1f5f9" roughness={0.9} metalness={0.1} />
      {buildings.map((b, i) => (
        <Instance
          key={i}
          position={[b.x, b.height / 2, b.z]}
          scale={[b.width, b.height, b.depth]}
        />
      ))}
    </Instances>
  );
};

const WindParticles = ({ active, windSpeed }: { active: boolean, windSpeed: number }) => {
  const count = 300;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 80,
      y: 2 + Math.random() * 10,
      z: (Math.random() - 0.5) * 80,
      speed: 0.1 + Math.random() * 0.2
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!active || !mesh.current) {
      if (mesh.current) mesh.current.count = 0;
      return;
    }
    mesh.current.count = count;
    particles.forEach((p, i) => {
      p.x -= p.speed * windSpeed * 0.5;
      p.z += p.speed * windSpeed * 0.2;
      
      if (p.x < -40) p.x = 40;
      if (p.z > 40) p.z = -40;
      
      dummy.position.set(p.x, p.y, p.z);
      // scale based on speed
      dummy.scale.set(p.speed * 10, 0.1, 0.1);
      // orient to wind (NW to SE approx)
      dummy.rotation.y = Math.PI / 8;
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#bae6fd" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const TrafficParticles = ({ active }: { active: boolean }) => {
  const count = 300;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // align to roads (modulo 10)
      const isXRoad = Math.random() > 0.5;
      const roadCoord = Math.round((Math.random() - 0.5) * 8) * 10;
      const alongRoad = (Math.random() - 0.5) * 80;
      
      return {
        x: isXRoad ? alongRoad : roadCoord,
        z: isXRoad ? roadCoord : alongRoad,
        isXRoad,
        speed: 0.1 + Math.random() * 0.3,
        dir: Math.random() > 0.5 ? 1 : -1
      };
    });
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!active || !mesh.current) {
      if (mesh.current) mesh.current.count = 0;
      return;
    }
    mesh.current.count = count;
    particles.forEach((p, i) => {
      if (p.isXRoad) {
        p.x += p.speed * p.dir;
        if (p.x > 40) p.x = -40;
        if (p.x < -40) p.x = 40;
      } else {
        p.z += p.speed * p.dir;
        if (p.z > 40) p.z = -40;
        if (p.z < -40) p.z = 40;
      }
      
      dummy.position.set(p.x, 0.2, p.z);
      // create tail-light effect for cars
      dummy.scale.set(p.isXRoad ? 0.8 : 0.3, 0.2, p.isXRoad ? 0.3 : 0.8);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ef4444" />
    </instancedMesh>
  );
};

const IndustrialLayer = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <group position={[7, 0, -6]}>
      {/* Visual representation of an industrial zone near Kurla */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[1, 1.5, 8, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh position={[3, 3, 2]}>
        <cylinderGeometry args={[0.8, 1.2, 6, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* Industrial glow/emission */}
      <mesh position={[0, 8, 0]}>
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

const Hotspots3D = ({ active, hotspots, onHotspotClick }: { active: boolean, hotspots: any[], onHotspotClick: any }) => {
  if (!active) return null;

  return (
    <>
      {hotspots.map((h, i) => {
        const topNum = parseFloat(h.minimap_top) || (50 + (i * 10 % 30));
        const leftNum = parseFloat(h.minimap_left) || (50 + (i * 15 % 30));
        const x = (leftNum - 50) * 0.6;
        const z = (topNum - 50) * 0.6;
        const isCritical = h.aqi > 200;
        const color = isCritical ? '#dc2626' : '#f59e0b';

        return (
          <group key={h.id || i} position={[x, 0, z]}>
            <mesh position={[0, 10, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 20, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
              <ringGeometry args={[1, 1.5, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
            <Html position={[0, 12, 0]} center zIndexRange={[100, 0]}>
              <div 
                onClick={(e) => { e.stopPropagation(); onHotspotClick(h, e); }}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '11px',
                  color: color,
                  pointerEvents: 'auto',
                  border: `1px solid ${color}`,
                  whiteSpace: 'nowrap',
                  transform: 'translateY(0)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {h.name} • {h.aqi}
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
};

const AtmosphericField = ({ active, aqi }: { active: boolean, aqi: number }) => {
  // Coherent palette: clean = slight blue, moderate = yellow, high = orange, severe = red
  const color = aqi > 300 ? '#7f1d1d' : aqi > 200 ? '#b91c1c' : aqi > 100 ? '#f59e0b' : '#38bdf8';
  // Density scales gracefully
  const density = active ? Math.min(0.04, Math.max(0.002, (aqi * aqi) / 2000000)) : 0.001;
  
  return <fogExp2 attach="fog" color={color} density={density} />;
};

const SkySystem = ({ hour, aqi }: { hour: number, aqi: number }) => {
  // Day/Night logic
  let sunPos: [number, number, number] = [0, 10, 0];
  let ambientIntensity = 0.6;
  let dirIntensity = 1.5;
  
  if (hour >= 6 && hour < 9) {
    // Sunrise
    sunPos = [20, 2, -20];
    ambientIntensity = 0.4;
    dirIntensity = 1.0;
  } else if (hour >= 9 && hour <= 15) {
    // Midday
    sunPos = [10, 20, 10];
    ambientIntensity = 0.8;
    dirIntensity = 2.0;
  } else if (hour > 15 && hour <= 18) {
    // Sunset
    sunPos = [-20, 2, 20];
    ambientIntensity = 0.5;
    dirIntensity = 1.2;
  } else {
    // Night
    sunPos = [0, -10, 0];
    ambientIntensity = 0.1;
    dirIntensity = 0.0;
  }

  // Air quality impacts the sky turbidity
  const turbidity = Math.max(2, aqi / 20);
  const rayleigh = Math.max(0.5, aqi / 100);

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      {dirIntensity > 0 && <directionalLight position={sunPos} intensity={dirIntensity} castShadow shadow-mapSize={[1024, 1024]} />}
      <Sky sunPosition={sunPos} turbidity={turbidity} rayleigh={rayleigh} />
    </>
  );
};


// ----------------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------------

interface DigitalTwinViewerProps {
  currentCity: CityOption;
  diurnalData: DiurnalData;
  currentHour: number;
  onHourChange: (hour: number) => void;
  onHotspotClick: (hotspot: any, e: any) => void;
}

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
  const [hotspotsActive, setHotspotsActive] = useState(true);

  // Data state
  const [timeline, setTimeline] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch real timeline and hotspots for the city
  useEffect(() => {
    let mounted = true;
    
    // Fetch timeline (mock fallback if API fails)
    api.getTimeline(currentCity.name).then(res => {
      if (mounted && res.timeline) setTimeline(res.timeline);
    }).catch(() => {
      // Fallback timeline
      if (mounted) {
        setTimeline([
          { hour: 6, label: '6 AM', aqi: 184 },
          { hour: 9, label: '9 AM', aqi: 198 },
          { hour: 12, label: '12 PM', aqi: 168 },
          { hour: 15, label: '3 PM', aqi: 144 },
          { hour: 18, label: '6 PM', aqi: 182 },
          { hour: 21, label: '9 PM', aqi: 174 },
        ]);
      }
    });

    api.getHotspots(currentCity.name).then(res => {
      if (mounted && res.hotspots) setHotspots(res.hotspots);
    }).catch(() => {});

    return () => { mounted = false; };
  }, [currentCity.name]);

  // Timeline playback
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

  const windSpeedNum = parseFloat(currentCity.wind) || 10;
  
  // Derive AQI from timeline if available, else diurnalData
  const currentTimelineData = timeline.find(t => t.hour === currentHour);
  const displayAqi = currentTimelineData?.aqi || diurnalData.aqi;

  return (
    <div className="twin-viewport-card" style={{ position: 'relative', overflow: 'hidden', background: '#f8fafc', flex: 1, minHeight: '300px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
      
      {/* 3D CANVAS PORTAL */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [25, 25, 30], fov: 45 }}>
          <AtmosphericField active={airQualityActive} aqi={displayAqi} />
          
          <SkySystem hour={currentHour} aqi={displayAqi} />
          
          {/* Base Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          <CityMassing />
          
          <Hotspots3D active={hotspotsActive} hotspots={hotspots} onHotspotClick={onHotspotClick} />
          <TrafficParticles active={trafficActive} />
          <IndustrialLayer active={industrialActive} />
          <WindParticles active={weatherActive} windSpeed={windSpeedNum / 10} />
          
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            maxPolarAngle={Math.PI / 2 - 0.05} 
            minDistance={10} 
            maxDistance={100}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>

      {/* EDITORIAL TYPOGRAPHY OVERLAY */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', pointerEvents: 'none' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#0284c7' }}>URBAN ENVIRONMENTAL DIGITAL TWIN</span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, fontFamily: 'Outfit, sans-serif', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
          <span style={{ display: 'block' }}>Cleaner Cities</span>
          <span style={{ display: 'block' }}>Brighter Tomorrows</span>
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px', maxWidth: '280px', textShadow: '0 1px 4px rgba(255,255,255,0.9)' }}>
          Interactive 3D spatial mapping to understand, predict and reduce urban air pollution.
        </p>
      </div>

      {/* FLOATING LIVE METRICS CARD */}
      <div style={{ position: 'absolute', bottom: '24px', left: '24px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: '16px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', width: '340px', border: '1px solid rgba(255,255,255,1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', background: '#0284c7', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={14} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{currentCity.name}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>Live Air Quality</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>☀️ {currentCity.temp}°C</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
              💨 {currentCity.wind}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>AQI</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>{displayAqi}</span>
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '4px 8px', borderRadius: '6px' }}>
            {diurnalData.desc || 'Moderate'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {[
            { label: 'PM2.5', val: diurnalData.pm25, color: '#ef4444' },
            { label: 'PM10', val: diurnalData.pm10, color: '#f97316' },
            { label: 'NO₂', val: diurnalData.no2, color: '#eab308' },
            { label: 'SO₂', val: diurnalData.so2, color: '#84cc16' },
            { label: 'O₃', val: diurnalData.o3, color: '#06b6d4' },
          ].map(p => (
            <div key={p.label} style={{ background: 'rgba(0,0,0,0.02)', padding: '6px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.color, margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#64748b' }}>{p.label}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{p.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE FLOATING LAYER TOGGLES */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid white', display: 'flex', flexDirection: 'column', gap: '8px', width: '180px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={12}/> 3D Layers</span>
            <ChevronDown size={12}/>
          </div>
          
          {[
            { id: 'air', label: 'Air Quality', icon: <Wind size={14}/>, state: airQualityActive, set: setAirQualityActive, color: '#0ea5e9' },
            { id: 'hotspots', label: 'Hotspots', icon: <Target size={14}/>, state: hotspotsActive, set: setHotspotsActive, color: '#dc2626' },
            { id: 'traffic', label: 'Traffic Density', icon: <Car size={14}/>, state: trafficActive, set: setTrafficActive, color: '#8b5cf6' },
            { id: 'industry', label: 'Industrial', icon: <Factory size={14}/>, state: industrialActive, set: setIndustrialActive, color: '#f59e0b' },
            { id: 'weather', label: 'Weather (Wind)', icon: <Wind size={14}/>, state: weatherActive, set: setWeatherActive, color: '#10b981' },
          ].map(layer => (
            <button 
              key={layer.id}
              onClick={() => layer.set(!layer.state)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: layer.state ? 'rgba(241, 245, 249, 1)' : 'transparent',
                color: layer.state ? '#0f172a' : '#64748b',
                fontWeight: 600, fontSize: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ color: layer.state ? layer.color : '#94a3b8' }}>{layer.icon}</div>
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM TIMELINE CONTROL */}
      <div style={{ position: 'absolute', bottom: '24px', left: '400px', right: '24px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', padding: '10px 20px', borderRadius: '100px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid white', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f172a', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
        </button>
        
        <div style={{ flex: 1, position: 'relative', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
          {[6, 9, 12, 15, 18, 21].map((hr, i) => {
            const leftPct = (i / 5) * 100;
            const isActive = hr === currentHour;
            const isPast = hr < currentHour;
            return (
              <div key={hr} style={{ position: 'absolute', left: `${leftPct}%`, top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => onHourChange(hr)}>
                <div style={{ width: isActive ? '12px' : '8px', height: isActive ? '12px' : '8px', borderRadius: '50%', background: isActive ? '#0284c7' : isPast ? '#94a3b8' : '#cbd5e1', border: '2px solid white', boxShadow: isActive ? '0 0 0 3px rgba(2,132,199,0.2)' : 'none', transition: 'all 0.2s', zIndex: isActive ? 2 : 1 }} />
                <div style={{ position: 'absolute', top: '16px', fontSize: '0.65rem', fontWeight: isActive ? 700 : 600, color: isActive ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>
                  {hr > 12 ? `${hr - 12} PM` : `${hr} AM`}
                </div>
              </div>
            );
          })}
          {/* Progress fill */}
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: '#0284c7', borderRadius: '2px', width: `${([6, 9, 12, 15, 18, 21].indexOf(currentHour) / 5) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
          24h <ChevronDown size={12} />
        </div>
      </div>

    </div>
  );
};
