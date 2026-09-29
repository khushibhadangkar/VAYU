export type CityOption = {
  name: string;
  region: string;
  aqi: number;
  temp: number;
  condition: string;
  wind: string;
};

export type DiurnalData = {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  desc: string;
};

export type Hotspot = {
  id: string;
  name: string;
  aqi: number;
  category: string;
  top: string;
  left: string;
  pulseClass?: string;
  coreClass?: string;
  // Extended backend fields (optional — may be absent for locally constructed hotspots)
  primary_pollutant?: string;
  severity?: string;
  pm25?: number;
  pm10?: number;
  notes?: string;
  source_types?: string[];
};

export type SourceContribution = {
  name: string;
  percentage: number;
  color: string;
  className: string;
};

/** Data provenance status labels used across the application */
export type DataStatus =
  | 'OBSERVED'
  | 'MODEL_FORECAST'
  | 'MODELED_ATTRIBUTION'
  | 'SCENARIO'
  | 'HISTORICAL_VALIDATION'
  | 'DEMO_FALLBACK';
