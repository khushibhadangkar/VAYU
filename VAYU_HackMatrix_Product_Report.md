# VAYU — HACKMATRIX 5.0 PRODUCT & TECHNICAL REPORT

## 1. EXECUTIVE SUMMARY
VAYU is an Urban Environmental Digital Twin designed to provide actionable intelligence on air quality, pollution sources, and environmental interventions. Addressing the pressing need for data-driven urban climate management, VAYU targets city planners, environmental agencies, and policymakers. The current application is a high-fidelity frontend prototype that visualizes localized air quality, attributes pollution sources, forecasts trends, and simulates policy interventions (like traffic restrictions) within an interactive dashboard. The primary user experience revolves around exploring a city's digital twin to understand current pollution states and test "what-if" scenarios to improve air quality.

## 2. HACKMATRIX PROBLEM ALIGNMENT
**Problem:** ENR-01 — Urban Environmental Digital Twin

| HackMatrix Requirement | Current VAYU Implementation | Current Status | Evidence in Application |
| :--- | :--- | :--- | :--- |
| **Air-quality monitoring** | Displays current AQI and key pollutants (PM2.5, PM10, NO2, SO2, O3). | Prototype / Hardcoded | Live Air Quality metric cards in the main dashboard. |
| **Air-quality forecasting** | 24-hour predictive line chart for AQI. | Prototype / Hardcoded | Forecast & Scenarios right-hand panel. |
| **Pollution hotspots** | Map markers and a dedicated hotspot list with local AQI. | Prototype / Hardcoded | Hotspots Card (e.g., Kurla, Bandra) and interactive map pins. |
| **Pollution-source contribution** | Donut chart breaking down emissions (Vehicles, Industrial, etc.). | Prototype / Hardcoded | Source Contribution Card. |
| **Intervention/scenario simulation** | Interactive sliders and toggles to test policy impact on AQI. | Rule-based Prototype | Scenario Simulation Modal & Compare Interventions toggles. |
| **Environmental visualization** | Interactive map with layered data and a 24h timeline animation. | Implemented | Central Digital Twin viewer with map layers (Traffic, Wind, etc.). |
| **Historical validation** | **Not yet implemented** | Missing | N/A - To be built in Backend Phase. |
| **Observed vs modeled distinction** | **Not yet implemented structurally** (UI labels exist but data source is mixed). | Missing | N/A - To be strictly enforced via Backend API. |

## 3. CURRENT APPLICATION FEATURES

* **Dashboard/Header**:
  * *Purpose*: Global navigation and context.
  * *Interaction*: City selection dropdown (e.g., Mumbai, Delhi), Command Palette launch.
  * *Status*: Implemented (UI only, static state).
* **Command Palette**:
  * *Purpose*: Quick search and navigation.
  * *Interaction*: `Ctrl+K` to search locations/pollutants and jump to them on the map.
  * *Status*: Implemented (Rule-based static routing).
* **Digital Twin Viewer (Hero Map)**:
  * *Purpose*: Spatial visualization of the environment.
  * *Interaction*: Drag, zoom, click pins, toggle layers (Air Quality, Traffic, Industrial, Weather).
  * *Status*: Implemented.
* **Timeline Simulation**:
  * *Purpose*: Visualize diurnal pollution cycles.
  * *Interaction*: Play/Pause 24h loop or scrub time (6 AM to 9 PM).
  * *Status*: Implemented (Cycles through hardcoded `DIURNAL_CYCLE` states).
* **Telemetry Popover**:
  * *Purpose*: Detailed node data.
  * *Interaction*: Opens when a hotspot/map pin is clicked.
  * *Status*: Implemented.
* **Pollution Hotspots Card**:
  * *Purpose*: List highest risk areas.
  * *Interaction*: Click a list item to highlight it on the map.
  * *Status*: Implemented (Hardcoded list).
* **Source Contribution Card**:
  * *Purpose*: Show emissions breakdown.
  * *Interaction*: View-only donut chart.
  * *Status*: Implemented (Hardcoded percentages).
* **Forecast Panel**:
  * *Purpose*: Show future AQI trajectory.
  * *Interaction*: View-only line chart comparing Observed, Forecast, and Scenario.
  * *Status*: Implemented (Static mock data).
* **Scenario Simulation Modal**:
  * *Purpose*: Test policy interventions.
  * *Interaction*: Adjust sliders (Electric Fleet, Dust Suppression, Industrial Shift) to calculate new AQI and health impacts.
  * *Status*: Implemented (Deterministic/Rule-based UI calculation).
* **Sidebar Navigation**:
  * *Purpose*: Switch dashboard views.
  * *Interaction*: Click icons to change active view.
  * *Status*: Implemented (Visual state updates only; single-page layout remains).

## 4. USER JOURNEY
1. **User opens VAYU** and arrives at the main overview dashboard.
2. **User selects the city** (e.g., Mumbai) from the top right header.
3. **User observes environmental conditions** via the prominent AQI reading and pollutant grid on the left side of the map.
4. **User explores the digital twin** by toggling layers (e.g., Traffic Density) and clicking the "Play" button on the timeline to watch pollution change over a 24-hour cycle.
5. **User examines pollution hotspots** in the lower-left card and clicks "Kurla", which opens a telemetry popover on the map detailing specific local metrics.
6. **User examines source contribution** in the bottom center card to realize Vehicle Emissions are the primary driver.
7. **User views the forecast** in the right-hand panel, noticing a predicted spike in the next 12 hours.
8. **User runs a scenario** by clicking "Run Scenario Simulation," adjusting the Electric Fleet Transition slider to 45%, observing the projected AQI reduction, and clicking "Apply Scenario to Live Twin" to update the dashboard's baseline.

## 5. FRONTEND ARCHITECTURE
The current architecture is a standalone Single Page Application (SPA).
* **Framework**: React 19, TypeScript, Vite.
* **Styling**: Vanilla CSS (`src/styles/main.css`).
* **Icons**: `lucide-react`.

**Architecture Flow:**
```text
App.tsx (Main Layout & State Hub)
 │
 ├──> Header (City State, Command Palette Trigger)
 ├──> Sidebar (Navigation State)
 │
 ├──> Center Stage Column
 │     ├──> Digital Twin Viewer (Map UI, Timeline, Layers, Pins)
 │     └──> Bottom Analytics Split
 │           ├──> Hotspots Card
 │           └──> Source Contribution Card
 │
 ├──> Right Panel Column
 │     └──> Forecast Panel (Trend Chart, Intervention Toggles)
 │
 └──> Modals & Overlays
       ├──> Telemetry Popover (Node details)
       ├──> Command Palette (Search)
       └──> Scenario Simulation Modal (Sliders -> Updates App State)
```
**Current technical debt / refactoring opportunity**: There is a large `src/scripts/main.js` file (~25KB) containing vanilla DOM manipulation logic that potentially duplicates or conflicts with the React component state. This must be isolated or removed as React becomes the absolute source of truth.

## 6. CURRENT DATA ARCHITECTURE
**CRITICAL NOTE**: The current application is a fully static prototype. There is **NO BACKEND** and **NO LIVE API INTEGRATION**.

* **Environmental Values (AQI, PM2.5, Weather)**: Hardcoded prototype data stored in React state (`currentCity`, `DIURNAL_CYCLE`).
* **Source Contribution**: Hardcoded percentages (e.g., Vehicle Emissions: 34%).
* **Hotspots**: Hardcoded list of locations (Kurla, Dadar, Bandra, etc.).
* **Forecast Chart**: Static, hardcoded plot points.
* **Scenario Calculations**: Rule-based deterministic logic calculated purely on the frontend based on slider values.
* **Live APIs / Databases**: Completely absent.

All data currently shown should be classified as **Demo data** or **Hardcoded prototype data**.

## 7. AI / ML CAPABILITIES
**There is NO actual trained ML model currently implemented in the repository.**

* **Actual AI/ML**: None.
* **Rule-based calculations**: The Scenario Simulator uses simple frontend math (e.g., reducing AQI by a fixed percentage when a slider is moved) to generate "Estimated exposure risk reduction".
* **Simulated/demo logic**: The "Modeled Source Attribution" and "VAYU Scenario Model" are UI placeholders displaying static data to demonstrate where real AI models will eventually plug in.
* **Future ML opportunities**:
  1. Time-series forecasting for AQI (Phase B).
  2. Real AI Inversion Models for source attribution based on sensor telemetry.
  3. Causal inference models for the scenario simulator.

## 8. DIGITAL TWIN EXPERIENCE
The digital twin is the focal point of the application, representing the urban environment spatially and temporally.
* **What is visualized**: A stylized aerial map of the city overlaying environmental and infrastructure data.
* **Layers**: Air Quality, Traffic Density, Industrial Activity, Weather (Wind direction).
* **Interactions**: Users can toggle layers, pan the map (simulated), and click specific sensor nodes (markers) to reveal micro-telemetry.
* **Timeline Behavior**: A 24-hour slider allows users to step through time (e.g., Morning Inversion, Rush Hour, Coastal Breeze). Pressing play interpolates the global AQI state to tell a story of how pollution shifts throughout the day.
* **Relevance**: It grounds abstract data (like PM2.5 readings) into physical reality, helping policymakers see *where* and *when* interventions are needed most.

## 9. SCENARIO SIMULATION
The existing scenario simulator is a deterministic, rule-based UI tool designed to demonstrate policy impact.
* **Available Interventions**: Electric Fleet Transition, Construction Dust Suppression, Industrial Off-Peak Energy Shift.
* **Inputs**: Range sliders (0% to 100%).
* **Outputs**: A projected 24h AQI reading, an updated qualitative status (e.g., "Improved to Satisfactory"), and an "Estimated exposure risk reduction" percentage.
* **Calculations**: Strictly **Rule-based** and **Deterministic** (Frontend React state manipulation). It does not use atmospheric physics or machine learning currently.

## 10. CURRENT TECH STACK

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 | Component architecture and UI state management. |
| **Language** | TypeScript | Type safety and domain modeling. |
| **Build Tool** | Vite | Fast local development and bundling. |
| **Styling** | Vanilla CSS | Custom premium aesthetic (glassmorphism, gradients). |
| **Icons** | lucide-react | Standardized vector iconography. |
| **Animation** | canvas-confetti | Currently in dependencies (likely for success states). |

## 11. CURRENT PROJECT STRUCTURE
```text
VAYU-main/
 ├── assets/                 # Static background images and minimaps
 │    ├── mumbai_aerial.jpg
 │    └── mumbai_minimap.jpg
 ├── src/
 │    ├── components/        # React UI components (Header, Map, Modals, etc.)
 │    ├── scripts/
 │    │    └── main.js       # Legacy vanilla JS logic (Technical Debt)
 │    ├── styles/
 │    │    └── main.css      # Core application styling and layout
 │    ├── types/
 │    │    └── index.ts      # TypeScript interfaces (Hotspot, CityOption)
 │    ├── App.tsx            # Main application layout and state container
 │    └── main.tsx           # React DOM entry point
 ├── package.json
 └── vite.config.ts
```

## 12. STRENGTHS OF THE CURRENT MVP
* **Visual Quality**: The glassmorphism design, typography, and cohesive color palette create a highly premium, executive-level dashboard feel.
* **Interactive Storytelling**: The 24-hour timeline player brilliantly demonstrates how pollution is dynamic, not static.
* **Clear Information Hierarchy**: Data is dense but approachable; the layout effectively separates live metrics (left), geospatial context (center), and predictive/actionable intelligence (right).
* **Modular Components**: The React architecture makes it straightforward to replace hardcoded data with real API calls component-by-component.

## 13. CURRENT LIMITATIONS
* **Missing Backend**: There is no server, database, or API currently running.
* **Hardcoded Data**: Every number on the screen is currently a placeholder.
* **Duplicated Logic**: `src/scripts/main.js` contains legacy code that must be cleaned up to prevent state conflicts with React.
* **Missing Historical Validation**: There is no UI or data to prove the model's accuracy against past events.
* **No Real ML**: All "predictions" are currently static graphics or basic math.

## 14. RECOMMENDED NEXT DEVELOPMENT PHASES

* **PHASE 1: Backend foundation**
  * *Goal*: Establish a FastAPI Python server.
  * *Output*: A running local server with basic `/health` and structured JSON routes.
  * *Why it matters*: Provides the scaffolding to replace hardcoded React state with external data.
* **PHASE 2: Frontend/backend integration**
  * *Goal*: Connect the React UI to the new API.
  * *Output*: `App.tsx` fetches `demo_environment.json` from the backend instead of local variables.
  * *Why it matters*: Proves end-to-end communication works safely before adding complex logic.
* **PHASE 3: Forecasting**
  * *Goal*: Create the `/api/forecast` endpoint.
  * *Output*: A baseline time-series forecast model (even if simple) serving data to the ForecastPanel.
  * *Why it matters*: Fulfills the HackMatrix requirement for predictive capabilities.
* **PHASE 4: Source attribution**
  * *Goal*: Create the `/api/sources` endpoint.
  * *Output*: Modeled attribution percentages served from the backend.
  * *Why it matters*: Fulfills the requirement to attribute contributions across at least three categories.
* **PHASE 5: Scenario engine**
  * *Goal*: Move scenario math from frontend sliders to a `POST /api/scenario` endpoint.
  * *Output*: The backend calculates the AQI reduction and returns assumptions.
  * *Why it matters*: Validates that decision-support logic lives in the core engine, not the browser.
* **PHASE 6: Historical validation**
  * *Goal*: Prove accuracy against past data.
  * *Output*: `/api/validation` endpoint and a new UI panel showing Observed vs. Predicted (MAE/RMSE).
  * *Why it matters*: Crucial for scientific credibility in the ENR-01 problem statement.
* **PHASE 7: Scientific trust/provenance**
  * *Goal*: Clearly label data origins.
  * *Output*: UI badges showing "Observed", "Model Forecast", or "Demo Fallback".
  * *Why it matters*: Addresses the specific HackMatrix requirement to separate observed vs. modeled results.
* **PHASE 8: Public API integration**
  * *Goal*: Ingest real data.
  * *Output*: Adapters for OpenWeather or AirQuality APIs.
  * *Why it matters*: Transitions the app from a demo to a live prototype.
* **PHASE 9: Advanced ML**
  * *Goal*: Upgrade baseline models.
  * *Output*: Real SHAP attribution or XGBoost forecasting models.
  * *Why it matters*: Maximizes the technical judging score.
* **PHASE 10: Final polish**
  * *Goal*: Report generation and UX cleanup.
  * *Output*: A "Generate Report" button and bug-free interactions.
  * *Why it matters*: Leaves a flawless impression during the final demo.

## 15. PPT STORYLINE (Suggested 11 Slides)
1. **The Urban Pollution Problem**: *Purpose*: Hook the audience. *Key Message*: Cities are flying blind, reacting to pollution instead of preventing it.
2. **Why Existing Monitoring Is Not Enough**: *Purpose*: Highlight the gap. *Key Message*: Sensors tell us what happened; we need to know *why* and *what's next*.
3. **Introducing VAYU**: *Purpose*: The reveal. *Key Message*: A proactive Urban Environmental Digital Twin.
4. **How VAYU Works**: *Purpose*: Architecture overview. *Key Message*: Data Ingestion → AI Modeling → Actionable Simulation.
5. **Urban Environmental Digital Twin**: *Purpose*: Showcase the map. *Key Message*: Spatial awareness and localized telemetry. *Visual*: Full Dashboard Screenshot.
6. **Live Environmental Intelligence**: *Purpose*: Current state analysis. *Key Message*: Real-time tracking of pollutants and hotspots. *Visual*: Hotspots and AQI Grid.
7. **Pollution Source Analysis**: *Purpose*: Attribution. *Key Message*: Knowing exactly where the pollution is coming from. *Visual*: Source Contribution Chart.
8. **Forecasting**: *Purpose*: Prediction. *Key Message*: Seeing 24 hours into the future to prepare. *Visual*: Forecast Line Chart.
9. **What-If Intervention Simulation**: *Purpose*: Decision support. *Key Message*: Testing policies before spending public budgets. *Visual*: Scenario Simulator Modal.
10. **Validation & Scientific Trust**: *Purpose*: Credibility. *Key Message*: Data provenance and transparent baseline models.
11. **Impact + Future Roadmap**: *Purpose*: Conclusion. *Key Message*: Phase 2 goals (Live API, Advanced ML).

## 16. DEMO FLOW FOR JUDGES (2-3 Minutes)
1. **Observe (15s)**: Presenter clicks the **City Selector** to load Mumbai. *Explain*: "VAYU instantly aggregates localized environmental data into a single digital twin."
2. **Understand (30s)**: Presenter clicks the **Timeline Play Button** and toggles the **Traffic Layer**. *Explain*: "We aren't just looking at a static number. We can see how rush hour traffic historically drives the morning AQI spike." Presenter clicks a map pin to open the **Telemetry Popover**.
3. **Predict (20s)**: Presenter highlights the **Forecast Panel** and **Source Contribution**. *Explain*: "Our baseline model predicts a severe spike by 6 PM, primarily driven by vehicle emissions."
4. **Simulate (45s)**: Presenter clicks **Run Scenario Simulation**. Adjusts the *Electric Fleet* and *Industrial Shift* sliders. Clicks Apply. *Explain*: "Before the city blindly bans traffic, we simulate the intervention. We immediately see this policy averts the crisis and lowers AQI to safe levels."
5. **Decide (10s)**: Presenter points to the updated main dashboard. *Explain*: "VAYU turns passive environmental data into active policy decisions."

## 17. SCREENSHOTS REQUIRED FOR PPT
* [ ] **Full Dashboard**: Capture the default loaded state showing the map, sidebar, and all panels.
* [ ] **Digital Twin with Layers**: Capture the map with the "Traffic Density" layer activated.
* [ ] **Telemetry Popover**: Capture the map with the "Bandra" node clicked, showing the popover card.
* [ ] **Command Palette**: Capture the screen with `Ctrl+K` opened and "Bandra West" typed in.
* [ ] **Forecast & Interventions**: A close-up of the right-hand panel with one of the Intervention switches (e.g., Traffic Restriction) toggled ON.
* [ ] **Scenario Simulator**: Capture the modal open with sliders adjusted to 50%.

## 18. TERMINOLOGY GUIDE

| Use This | Avoid This | Reason |
| :--- | :--- | :--- |
| **"Prototype data" / "Demo baseline"** | "Live real-time data" | The current app does not yet connect to live APIs. |
| **"Modeled source attribution"** | "AI Inversion Model" | We have not yet implemented a true chemical/AI inversion model. |
| **"VAYU Scenario Model"** | "High-fidelity predictive physics" | The current simulation is rule-based and deterministic, not a physics engine. |
| **"Estimated exposure risk reduction"** | "Hospital respiratory admissions" | We cannot medically validate hospital admission drops yet. |
| **"Baseline time-series forecast"** | "Advanced deep learning prediction" | Sets honest expectations for the Phase 1 backend implementation. |

## 19. ONE-PAGE PRODUCT SUMMARY

**VAYU: Urban Environmental Digital Twin**

*   **Problem:** Urban planners lack integrated, proactive tools to predict air pollution and test the impact of policy interventions before implementation.
*   **Solution:** A map-based digital twin that unites telemetry, forecasting, and scenario simulation into a single executive dashboard.
*   **Core Features:**
    *   Interactive Digital Twin with layer toggles and 24h timeline playback.
    *   Localized pollution Hotspot tracking.
    *   Modeled Source Attribution.
    *   Policy Scenario Simulator for predictive decision-making.
*   **Technology:** React 19, TypeScript, Vite frontend (FastAPI backend planned).
*   **AI/ML:** Currently using deterministic baseline models and UI logic; designed as a shell to accept advanced time-series forecasting and SHAP attribution models in Phase 2.
*   **Current Status:** High-fidelity Frontend Prototype (Fully responsive UI, hardcoded demo data). Ready for backend API integration.
*   **Future Roadmap:** FastAPI integration → Historical Validation Engine → Public API ingestion (OpenWeather) → Advanced ML replacement.
*   **Demo Flow:** Select City → Analyze Timeline & Hotspots → Identify Source → Simulate Policy Intervention → Observe Improved AQI.
