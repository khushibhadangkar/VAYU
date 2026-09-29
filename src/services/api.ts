/**
 * VAYU API Service — Central frontend/backend communication layer.
 * All fetch logic lives here. Components call these methods only.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// ─── Type contracts matching backend responses ──────────────────────────────

export interface EnvironmentData {
  city: string;
  timestamp: string;
  status: 'OBSERVED' | 'DEMO_FALLBACK';
  source: string;
  location: { lat: number; lon: number };
  air_quality: {
    aqi: number; pm25: number; pm10: number;
    no2: number; so2: number; o3: number;
  };
  weather: {
    temperature: number; humidity: number;
    wind_speed: number; wind_direction: string;
  };
}

export interface ForecastPoint {
  time: string;
  hour_offset: number;
  value: number;
  status: string;
}

export interface ForecastData {
  city: string;
  status: string;
  metric: string;
  current: number;
  model: { name: string; type: string; note: string };
  confidence: number;
  forecast: ForecastPoint[];
  assumptions?: string[];
}

export interface SourceItem {
  name: string;
  percentage: number;
  primary_pollutant: string;
  color_key: string;
  notes: string;
}

export interface SourcesData {
  city: string;
  status: string;
  method: string;
  confidence: number;
  assumptions: string[];
  sources: SourceItem[];
}

export interface HotspotItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  aqi: number;
  pm25: number;
  pm10: number;
  primary_pollutant: string;
  severity: string;
  category: string;
  source_types: string[];
  timestamp: string;
  minimap_top: string;
  minimap_left: string;
  notes: string;
}

export interface HotspotsData {
  city: string;
  status: string;
  method: string;
  count: number;
  timestamp: string;
  hotspots: HotspotItem[];
}

export interface ScenarioRequest {
  city?: string;
  electric_fleet_pct: number;
  dust_suppression_pct: number;
  industrial_offpeak_pct: number;
}

export interface ScenarioIntervention {
  type: string;
  value: number;
  label: string;
  aqi_reduction: number;
  description: string;
  pollutant: string;
  sector: string;
}

export interface ScenarioData {
  city: string;
  status: 'SCENARIO';
  baseline_aqi: number;
  scenario_aqi: number;
  aqi_reduction: number;
  pct_change: number;
  capped: boolean;
  baseline_category: string;
  scenario_category: string;
  interventions: ScenarioIntervention[];
  assumptions: string[];
  model: string;
}

export interface ValidationSample {
  timestamp: string;
  actual: number;
  predicted: number;
  error: number;
}

export interface ValidationData {
  city: string;
  status: 'HISTORICAL_VALIDATION' | 'DEMO_FALLBACK';
  validation_period?: string;
  station?: string;
  data_source?: string;
  n_samples?: number;
  metrics?: {
    mae: number; rmse: number;
    mean_actual: number; mean_predicted: number;
    bias: number; bias_direction: string;
  };
  model?: string;
  prediction_method?: string;
  samples?: ValidationSample[];
  methodology_note?: string;
  message?: string;
}

// ─── API methods ────────────────────────────────────────────────────────────

export const api = {
  async getEnvironment(city: string = 'Mumbai'): Promise<EnvironmentData> {
    const res = await fetch(`${API_BASE_URL}/environment/current?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Environment fetch failed: ${res.status}`);
    return res.json();
  },

  async getTimeline(city: string = 'Mumbai') {
    const res = await fetch(`${API_BASE_URL}/environment/timeline?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
    return res.json();
  },

  async getForecast(city: string = 'Mumbai'): Promise<ForecastData> {
    const res = await fetch(`${API_BASE_URL}/forecast?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Forecast fetch failed: ${res.status}`);
    return res.json();
  },

  async getSources(city: string = 'Mumbai'): Promise<SourcesData> {
    const res = await fetch(`${API_BASE_URL}/sources?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Sources fetch failed: ${res.status}`);
    return res.json();
  },

  async getHotspots(city: string = 'Mumbai'): Promise<HotspotsData> {
    const res = await fetch(`${API_BASE_URL}/hotspots?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Hotspots fetch failed: ${res.status}`);
    return res.json();
  },

  async runScenario(params: ScenarioRequest): Promise<ScenarioData> {
    const res = await fetch(`${API_BASE_URL}/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Scenario fetch failed: ${res.status}`);
    return res.json();
  },

  async getValidation(city: string = 'Mumbai'): Promise<ValidationData> {
    const res = await fetch(`${API_BASE_URL}/validation?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`Validation fetch failed: ${res.status}`);
    return res.json();
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};
