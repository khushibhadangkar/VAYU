# VAYU

## Urban Environmental Digital Twin

VAYU is an **Urban Environmental Digital Twin** designed to help city planners, environmental agencies, and policymakers understand air pollution, identify hotspots, analyze pollution sources, forecast air-quality trends, and evaluate environmental interventions through an interactive dashboard.

The current version is a **high-fidelity frontend prototype** using demonstration data, with a roadmap toward real environmental APIs, backend services, and AI/ML-powered decision support.

---

## HackMatrix 5.0

**Problem Statement:** ENR-01 — Urban Environmental Digital Twin

VAYU combines:

* Air-quality monitoring
* Pollution hotspot visualization
* Pollution-source attribution
* AQI forecasting
* Environmental visualization
* Policy scenario simulation
* Explainable AI and predictive analytics

---

## Key Features

### Interactive Digital Twin

A map-based interface representing the urban environment through environmental and infrastructure layers.

**Layers:**

* Air Quality
* Traffic Density
* Industrial Activity
* Weather / Wind
* Pollution Hotspots

Users can explore the map, interact with locations, and inspect localized environmental conditions.

### Air-Quality Dashboard

The dashboard provides a centralized view of:

* AQI
* PM2.5
* PM10
* NO₂
* SO₂
* O₃

Current values are demonstration data and will later be connected to live sources.

### Pollution Hotspots

VAYU highlights high-risk areas through:

* Interactive map markers
* Hotspot lists
* Local AQI information
* Telemetry popovers

### 24-Hour Environmental Timeline

Users can play or scrub through a simulated 24-hour cycle to observe how pollution conditions change throughout the day.

### Pollution Source Contribution

The dashboard visualizes potential contributions from:

* Vehicle emissions
* Industrial activity
* Construction
* Other urban sources

The current visualization uses static prototype values and is planned to be replaced by explainable ML outputs.

### AQI Forecasting

The Forecast Panel displays the expected AQI trajectory alongside observed and scenario values.

The current chart uses static demo data. Future versions will use **XGBoost-based forecasting**.

### Policy Scenario Simulation

Users can test environmental interventions through interactive controls:

* Electric Fleet Transition
* Construction Dust Suppression
* Industrial Off-Peak Energy Shift

The current simulator uses deterministic frontend calculations. A future causal inference engine will provide model-driven counterfactual analysis.

---

# AI / ML Roadmap

The current repository does **not contain deployed trained ML models**. The existing AI-related components are prototype interfaces designed for future model integration.

## 1. XGBoost AQI Forecasting

Train an **XGBoost regression model** using historical AQI and weather data such as:

* Historical AQI
* PM2.5 / PM10
* Temperature
* Humidity
* Wind speed

The model will generate **24/48-hour AQI and pollutant forecasts** through:

```text
GET /api/forecast
```

This will replace the current static forecast chart with model-driven predictions.

## 2. SHAP-Based Source Attribution

Use **SHAP (SHapley Additive exPlanations)** to explain the contribution of factors affecting AQI.

Potential contributors include:

* Vehicles
* Industrial activity
* Construction
* Weather conditions

The system will replace hardcoded source percentages with interpretable model outputs through:

```text
GET /api/sources
```

Planned outputs include source contributions, feature importance, and model confidence/provenance.

## 3. Causal Inference Scenario Engine

Replace deterministic scenario calculations with a causal inference approach such as **DoWhy or Bayesian networks**.

The engine will estimate counterfactual policy impacts, for example:

> What could happen to PM2.5 if EV adoption increases by 45% while accounting for interacting traffic effects?

The planned API is:

```text
POST /api/scenario
```

The response will include estimated intervention impact and relevant model assumptions.

---

# Current Architecture

VAYU currently operates as a React Single Page Application.

```text
React Frontend
      │
      ├── Header / City Selection
      ├── Sidebar Navigation
      ├── Digital Twin Viewer
      │     ├── Map Layers
      │     ├── Hotspots
      │     └── 24h Timeline
      ├── Analytics
      │     ├── Hotspots
      │     └── Source Contribution
      ├── Forecast Panel
      └── Scenario Simulator
```

### Frontend Stack

* React 19
* TypeScript
* Vite
* Vanilla CSS
* Lucide React

---

# Current Data Architecture

The current application is a **frontend-only prototype**.

| Component           | Current Status   |
| ------------------- | ---------------- |
| AQI                 | Demo / Hardcoded |
| PM2.5 / PM10        | Demo / Hardcoded |
| Weather             | Demo / Hardcoded |
| Hotspots            | Demo / Hardcoded |
| Source Contribution | Static           |
| Forecast            | Static           |
| Scenario Simulation | Rule-based       |
| Backend             | Not implemented  |
| Live APIs           | Not integrated   |
| ML Models           | Not deployed     |

All current values should be treated as **prototype/demo data**.

---

# Project Structure

```text
VAYU/
├── assets/
│   ├── mumbai_aerial.jpg
│   └── mumbai_minimap.jpg
│
├── src/
│   ├── components/
│   ├── scripts/
│   │   └── main.js
│   ├── styles/
│   │   └── main.css
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
└── vite.config.ts
```

---

# Planned Backend Architecture

```text
React Frontend
      │
      ▼
FastAPI Backend
      │
      ├── /api/forecast
      │       └── XGBoost
      │
      ├── /api/sources
      │       └── SHAP Attribution
      │
      ├── /api/scenario
      │       └── Causal Inference
      │
      ├── /api/validation
      │       └── Model Validation
      │
      └── Environmental APIs
```

---

# Development Roadmap

### Phase 1 — Backend Foundation

* Establish FastAPI backend
* Add `/health` endpoint
* Create structured API routes

### Phase 2 — Frontend / Backend Integration

* Connect React to FastAPI
* Replace local prototype state with API responses

### Phase 3 — AQI Forecasting

* Create `/api/forecast`
* Prepare historical AQI and weather data
* Train XGBoost model
* Generate 24/48-hour predictions

### Phase 4 — Source Attribution

* Create `/api/sources`
* Build source-related model features
* Integrate SHAP explanations
* Replace static contribution percentages

### Phase 5 — Scenario Engine

* Create `/api/scenario`
* Replace deterministic calculations
* Introduce causal inference
* Estimate counterfactual intervention impacts

### Phase 6 — Historical Validation

* Create `/api/validation`
* Compare observed vs predicted values
* Calculate MAE and RMSE
* Visualize model performance

### Phase 7 — Data Provenance

Clearly label:

* Observed Data
* Model Forecast
* Scenario Output
* Demo Fallback

### Phase 8 — Live Data Integration

Integrate real air-quality and weather data through backend adapters.

### Phase 9 — Advanced AI

Integrate:

1. XGBoost AQI Forecasting
2. SHAP-Based Source Attribution
3. Causal Inference Scenario Engine

### Phase 10 — Final Product Polish

* Improve UX
* Add reporting
* Improve model transparency
* Refine visualizations
* Prepare final demonstration

---

# User Flow

```text
Select City
    ↓
View Current AQI
    ↓
Explore Digital Twin
    ↓
Analyze Hotspots
    ↓
Understand Pollution Sources
    ↓
View AQI Forecast
    ↓
Run Policy Scenario
    ↓
Analyze Projected Impact
    ↓
Make Data-Informed Decisions
```

---

# Current Limitations

* Environmental data is currently static.
* No backend server is connected.
* No production database is connected.
* Forecasting currently uses demo data.
* Source contribution values are currently static.
* Scenario calculations are rule-based.
* Historical validation is not implemented.
* Trained ML models are not yet deployed.

---

# Technology Stack

| Layer           | Technology                               |
| --------------- | ---------------------------------------- |
| Frontend        | React 19                                 |
| Language        | TypeScript                               |
| Build Tool      | Vite                                     |
| Styling         | Vanilla CSS                              |
| Icons           | Lucide React                             |
| Backend         | FastAPI *(planned)*                      |
| Forecasting     | XGBoost *(planned)*                      |
| Explainability  | SHAP *(planned)*                         |
| Causal Analysis | DoWhy / Bayesian Networks *(planned)*    |
| Data Sources    | Environmental & Weather APIs *(planned)* |

---

# Project Status

**High-Fidelity Frontend Prototype**

### Implemented

* Interactive environmental dashboard
* Digital twin visualization
* Map layers
* Pollution hotspots
* 24-hour timeline
* Telemetry popovers
* Source contribution visualization
* Forecast panel
* Policy scenario simulator
* Responsive React interface

### Planned

* FastAPI backend
* Live environmental data
* XGBoost forecasting
* SHAP source attribution
* Causal inference scenarios
* Historical validation
* Data provenance
* AI-powered decision support

---

# Demo Flow

1. **Select City** — Load the target urban environment.
2. **Explore** — Inspect the digital twin and environmental layers.
3. **Analyze** — Explore hotspots and localized telemetry.
4. **Understand** — Review pollution-source contributions.
5. **Predict** — View the AQI forecast.
6. **Simulate** — Test environmental interventions.
7. **Compare** — Analyze the projected impact.

---

# VAYU in One Line

> **VAYU is an AI-ready urban environmental digital twin connecting air-quality monitoring, pollution intelligence, forecasting, and policy simulation in one interactive platform.**
