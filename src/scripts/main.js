/**
 * VAYU — Urban Environmental Digital Twin
 * Main Application Logic & Interactive UX Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initWindCanvas();
  initMapLayers();
  initTimelineScrubber();
  initInterventions();
  initCitySelector();
  initHotspotBeacons();
  initCommandPalette();
  initSimulationStudio();
  initChartHover();
  initDonutHover();
  initClock();
});

/* ==========================================================================
   1. DYNAMIC WIND PARTICLE STREAMLINES CANVAS
   ========================================================================== */
let windCanvasActive = true;
let windAnimId = null;

function initWindCanvas() {
  const canvas = document.getElementById('windParticleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const particleCount = 65;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: 18 + Math.random() * 24,
      speed: 1.2 + Math.random() * 1.6,
      opacity: 0.15 + Math.random() * 0.45,
      angle: Math.PI * 0.22 // NW to SE breeze
    });
  }

  function renderWind() {
    if (!windCanvasActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    particles.forEach(p => {
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

    windAnimId = requestAnimationFrame(renderWind);
  }

  renderWind();
}

/* ==========================================================================
   2. MAP LAYER TOGGLES
   ========================================================================== */
function initMapLayers() {
  const layerAirQuality = document.getElementById('layerAirQuality');
  const layerTraffic = document.getElementById('layerTraffic');
  const layerIndustrial = document.getElementById('layerIndustrial');
  const layerWeather = document.getElementById('layerWeather');
  const trafficSvg = document.getElementById('trafficLayerSvg');
  const aerialImage = document.getElementById('aerialImage');

  if (layerAirQuality) {
    layerAirQuality.addEventListener('click', () => {
      layerAirQuality.classList.toggle('active');
      const active = layerAirQuality.classList.contains('active');
      if (aerialImage) {
        aerialImage.style.filter = active
          ? 'contrast(1.04) brightness(1.02) saturate(1.08)'
          : 'contrast(1) brightness(1) saturate(0.85)';
      }
    });
  }

  if (layerTraffic) {
    layerTraffic.addEventListener('click', () => {
      layerTraffic.classList.toggle('active');
      const active = layerTraffic.classList.contains('active');
      if (trafficSvg) {
        trafficSvg.classList.toggle('active', active);
      }
    });
  }

  if (layerIndustrial) {
    layerIndustrial.addEventListener('click', () => {
      layerIndustrial.classList.toggle('active');
      const active = layerIndustrial.classList.contains('active');
      const kurlaBeacon = document.getElementById('beaconKurla');
      if (kurlaBeacon) {
        kurlaBeacon.style.transform = active ? 'translate(-50%, -50%) scale(1.3)' : 'translate(-50%, -50%) scale(1)';
      }
    });
  }

  if (layerWeather) {
    layerWeather.addEventListener('click', () => {
      layerWeather.classList.toggle('active');
      windCanvasActive = layerWeather.classList.contains('active');
      if (windCanvasActive && !windAnimId) {
        initWindCanvas();
      }
    });
  }
}

/* ==========================================================================
   3. TIMELINE PLAYBACK & SCRUBBER
   ========================================================================== */
const diurnalCycle = {
  6:  { aqi: 184, pm25: 78, pm10: 128, no2: 52, so2: 9, o3: 64, desc: 'Morning Inversion Peak' },
  9:  { aqi: 198, pm25: 88, pm10: 142, no2: 68, so2: 11, o3: 78, desc: 'Rush Hour Congestion' },
  12: { aqi: 168, pm25: 68, pm10: 112, no2: 42, so2: 8, o3: 96, desc: 'Moderate Afternoon' },
  15: { aqi: 144, pm25: 54, pm10: 96, no2: 36, so2: 7, o3: 110, desc: 'Coastal Sea Breeze Dispersion' },
  18: { aqi: 182, pm25: 76, pm10: 124, no2: 58, so2: 9, o3: 84, desc: 'Evening Commute Inversion' },
  21: { aqi: 174, pm25: 72, pm10: 118, no2: 48, so2: 8, o3: 72, desc: 'Night Stagnation' }
};

let currentHour = 12;
let isPlayingTimeline = false;
let playInterval = null;

function initTimelineScrubber() {
  const stationMarks = document.querySelectorAll('.station-mark');
  const thumb = document.getElementById('timelineThumb');
  const fill = document.getElementById('timelineProgressFill');
  const playBtn = document.getElementById('timelinePlayBtn');
  const playSvg = document.getElementById('playIconSvg');
  const pauseSvg = document.getElementById('pauseIconSvg');

  stationMarks.forEach(station => {
    station.addEventListener('click', () => {
      const hour = parseInt(station.getAttribute('data-hour'), 10);
      setTimelineHour(hour);
      if (isPlayingTimeline) stopPlay();
    });
  });

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlayingTimeline) {
        stopPlay();
      } else {
        startPlay();
      }
    });
  }

  function startPlay() {
    isPlayingTimeline = true;
    playSvg.classList.add('hidden');
    pauseSvg.classList.remove('hidden');

    const hours = [6, 9, 12, 15, 18, 21];
    playInterval = setInterval(() => {
      let idx = hours.indexOf(currentHour);
      idx = (idx + 1) % hours.length;
      setTimelineHour(hours[idx]);
    }, 1800);
  }

  function stopPlay() {
    isPlayingTimeline = false;
    playSvg.classList.remove('hidden');
    pauseSvg.classList.add('hidden');
    if (playInterval) clearInterval(playInterval);
  }
}

function setTimelineHour(hour) {
  currentHour = hour;
  const stationMarks = document.querySelectorAll('.station-mark');
  const thumb = document.getElementById('timelineThumb');
  const fill = document.getElementById('timelineProgressFill');

  stationMarks.forEach(s => {
    const h = parseInt(s.getAttribute('data-hour'), 10);
    if (h === hour) {
      s.classList.add('active');
      const leftPercent = s.style.left;
      if (thumb) thumb.style.left = leftPercent;
      if (fill) fill.style.width = leftPercent;
    } else {
      s.classList.remove('active');
    }
  });

  const data = diurnalCycle[hour] || diurnalCycle[12];

  // Update Header Time
  const timeStr = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 ${hour === 12 ? 'PM' : 'AM'}`;
  const headerTime = document.getElementById('headerTime');
  if (headerTime) headerTime.textContent = timeStr;

  // Update Live Card
  animateNumber('fmcAqiVal', data.aqi);
  animateNumber('valPm25', data.pm25);
  animateNumber('valPm10', data.pm10);
  animateNumber('valNo2', data.no2);
  animateNumber('valSo2', data.so2);
  animateNumber('valO3', data.o3);

  // Donut center
  animateNumber('donutCenterAqi', data.aqi);
}

/* ==========================================================================
   4. COMPARE INTERVENTIONS LOGIC & CHART RECALCULATION
   ========================================================================== */
function initInterventions() {
  const toggleTraffic = document.getElementById('toggleTraffic');
  const toggleIndustrial = document.getElementById('toggleIndustrial');
  const toggleCombined = document.getElementById('toggleCombined');
  const runSimBtn = document.getElementById('runSimulationBtn');

  if (toggleTraffic) toggleTraffic.addEventListener('change', recalcInterventions);
  if (toggleIndustrial) toggleIndustrial.addEventListener('change', recalcInterventions);
  if (toggleCombined) {
    toggleCombined.addEventListener('change', () => {
      if (toggleCombined.checked) {
        if (toggleTraffic) toggleTraffic.checked = true;
        if (toggleIndustrial) toggleIndustrial.checked = true;
      }
      recalcInterventions();
    });
  }

  if (runSimBtn) {
    runSimBtn.addEventListener('click', () => {
      const modal = document.getElementById('simModalOverlay');
      if (modal) modal.classList.remove('hidden');
    });
  }

  recalcInterventions();
}

function recalcInterventions() {
  const trafficOn = document.getElementById('toggleTraffic')?.checked || false;
  const industrialOn = document.getElementById('toggleIndustrial')?.checked || false;
  const combinedOn = document.getElementById('toggleCombined')?.checked || false;

  let deltaPct = 0;
  let targetAqi = 168; // Baseline 24h average

  if (combinedOn) {
    deltaPct = 40;
    targetAqi = 98;
  } else if (trafficOn && industrialOn) {
    deltaPct = 34;
    targetAqi = 112;
  } else if (trafficOn) {
    deltaPct = 15;
    targetAqi = 142;
  } else if (industrialOn) {
    deltaPct = 20;
    targetAqi = 134;
  } else {
    deltaPct = 0;
    targetAqi = 172;
  }

  animateNumber('predAqiNum', targetAqi);
  const pctText = document.getElementById('predPercentText');
  if (pctText) pctText.textContent = `${deltaPct}%`;

  // Update Scenario SVG Curve & points
  updateScenarioPath(targetAqi);
}

function updateScenarioPath(aqi) {
  const pathScenario = document.getElementById('pathScenario');
  const scenarioArea = document.getElementById('scenarioArea');
  const pt1 = document.getElementById('ptScen1');
  const pt2 = document.getElementById('ptScen2');
  const pt3 = document.getElementById('ptScen3');
  const pt4 = document.getElementById('ptScen4');

  // Y scale: 0 AQI = 140, 100 AQI = 100, 200 AQI = 60, 300 AQI = 20
  // Formula: y = 140 - (aqi / 300) * 120
  const yTarget = 140 - (aqi / 300) * 120;
  const yMid = (92 + yTarget) / 2;

  const newPath = `M 120 92 Q 170 ${yMid + 6} 220 ${yTarget + 4} T 330 ${yTarget}`;
  const newArea = `M 120 92 Q 170 ${yMid + 6} 220 ${yTarget + 4} T 330 ${yTarget} L 330 140 L 120 140 Z`;

  if (pathScenario) pathScenario.setAttribute('d', newPath);
  if (scenarioArea) scenarioArea.setAttribute('d', newArea);

  if (pt1) pt1.setAttribute('cy', yMid + 4);
  if (pt2) pt2.setAttribute('cy', yTarget + 3);
  if (pt3) pt3.setAttribute('cy', yTarget + 1);
  if (pt4) pt4.setAttribute('cy', yTarget);
}

/* ==========================================================================
   5. CITY SELECTOR DROPDOWN
   ========================================================================== */
function initCitySelector() {
  const dropdown = document.getElementById('cityDropdown');
  const btn = document.getElementById('citySelectorBtn');
  const currentName = document.getElementById('currentLocationName');
  const fmcName = document.getElementById('fmcCityName');
  const fmcTemp = document.getElementById('fmcTemp');
  const fmcWind = document.getElementById('fmcWind');
  const items = document.querySelectorAll('#cityMenu .dropdown-item');

  if (btn && dropdown) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
    });
  }

  items.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const cityName = item.getAttribute('data-city');
      const aqi = parseInt(item.getAttribute('data-aqi'), 10);
      const temp = item.getAttribute('data-temp');
      const wind = item.getAttribute('data-wind');

      if (currentName) currentName.textContent = cityName.split(',')[0];
      if (fmcName) fmcName.textContent = cityName.split(',')[0];
      if (fmcTemp) fmcTemp.textContent = `${temp}°C`;
      if (fmcWind) fmcWind.textContent = wind;

      animateNumber('fmcAqiVal', aqi);
      animateNumber('donutCenterAqi', aqi);

      dropdown.classList.remove('open');
    });
  });
}

/* ==========================================================================
   6. INTERACTIVE HOTSPOT BEACONS
   ========================================================================== */
function initHotspotBeacons() {
  const beacons = document.querySelectorAll('.hotspot-beacon');
  const popover = document.getElementById('telemetryPopover');
  const closeBtn = document.getElementById('tpCloseBtn');
  const tpTitle = document.getElementById('tpTitle');
  const tpAqiPill = document.getElementById('tpAqiPill');
  const tpSector = document.getElementById('tpSector');

  beacons.forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = b.getBoundingClientRect();
      const name = b.getAttribute('data-name');
      const aqi = b.getAttribute('data-aqi');
      const category = b.getAttribute('data-category');

      if (tpTitle) tpTitle.textContent = name;
      if (tpAqiPill) tpAqiPill.textContent = `${aqi} AQI`;
      if (tpSector) tpSector.textContent = category;

      if (popover) {
        popover.style.top = `${rect.top}px`;
        popover.style.left = `${rect.left + rect.width / 2}px`;
        popover.classList.remove('hidden');
      }
    });
  });

  if (closeBtn && popover) {
    closeBtn.addEventListener('click', () => {
      popover.classList.add('hidden');
    });
  }

  document.addEventListener('click', () => {
    if (popover) popover.classList.add('hidden');
  });

  // Leaderboard item clicks
  const lbItems = document.querySelectorAll('.lb-item');
  lbItems.forEach(item => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-hotspot');
      const beacon = document.querySelector(`.hotspot-beacon[data-name="${name}"]`);
      if (beacon) {
        beacon.click();
        beacon.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

/* ==========================================================================
   7. COMMAND PALETTE (⌘ K)
   ========================================================================== */
function initCommandPalette() {
  const trigger = document.getElementById('navSearchTrigger');
  const overlay = document.getElementById('commandModalOverlay');
  const closeBtn = document.getElementById('cmdCloseBtn');
  const input = document.getElementById('cmdInput');
  const cmdItems = document.querySelectorAll('.cmd-item');

  function openPalette() {
    if (overlay) {
      overlay.classList.remove('hidden');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  }

  function closePalette() {
    if (overlay) overlay.classList.add('hidden');
  }

  if (trigger) trigger.addEventListener('click', openPalette);
  if (closeBtn) closeBtn.addEventListener('click', closePalette);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
    }
    if (e.key === 'Escape') {
      closePalette();
      const simModal = document.getElementById('simModalOverlay');
      if (simModal) simModal.classList.add('hidden');
    }
  });

  // Filter items
  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      cmdItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });
  }

  // Action clicks
  cmdItems.forEach(item => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      closePalette();

      if (action.startsWith('focus-')) {
        const place = action.replace('focus-', '');
        const targetBeacon = document.querySelector(`.hotspot-beacon[data-name*="${place}" i]`);
        if (targetBeacon) targetBeacon.click();
      } else if (action === 'toggle-traffic') {
        const t = document.getElementById('toggleTraffic');
        if (t) {
          t.checked = !t.checked;
          recalcInterventions();
        }
      } else if (action === 'toggle-industrial') {
        const ind = document.getElementById('toggleIndustrial');
        if (ind) {
          ind.checked = !ind.checked;
          recalcInterventions();
        }
      } else if (action === 'launch-sim') {
        const modal = document.getElementById('simModalOverlay');
        if (modal) modal.classList.remove('hidden');
      }
    });
  });
}

/* ==========================================================================
   8. SCENARIO SIMULATION STUDIO MODAL
   ========================================================================== */
function initSimulationStudio() {
  const modal = document.getElementById('simModalOverlay');
  const closeBtn = document.getElementById('simModalCloseBtn');
  const openBtn = document.getElementById('openForecastModalBtn');
  const applyBtn = document.getElementById('applySimBtn');

  const sFleet = document.getElementById('sliderFleet');
  const sDust = document.getElementById('sliderDust');
  const sInd = document.getElementById('sliderInd');

  const vFleet = document.getElementById('valFleetSlider');
  const vDust = document.getElementById('valDustSlider');
  const vInd = document.getElementById('valIndSlider');
  const projAqi = document.getElementById('simProjectedAqi');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  function updateStudio() {
    const f = parseInt(sFleet.value, 10);
    const d = parseInt(sDust.value, 10);
    const i = parseInt(sInd.value, 10);

    if (vFleet) vFleet.textContent = `${f}%`;
    if (vDust) vDust.textContent = `${d}%`;
    if (vInd) vInd.textContent = `${i}%`;

    // Projected AQI calculation
    const reduction = Math.round(f * 0.35 + d * 0.25 + i * 0.4);
    const computedAqi = Math.max(55, Math.round(168 - reduction * 1.1));
    if (projAqi) projAqi.textContent = computedAqi;
  }

  [sFleet, sDust, sInd].forEach(s => {
    if (s) s.addEventListener('input', updateStudio);
  });

  if (applyBtn && modal) {
    applyBtn.addEventListener('click', () => {
      const finalAqi = parseInt(projAqi.textContent, 10);
      animateNumber('predAqiNum', finalAqi);
      updateScenarioPath(finalAqi);
      modal.classList.add('hidden');
    });
  }
}

/* ==========================================================================
   9. INTERACTIVE CHART HOVER
   ========================================================================== */
function initChartHover() {
  const container = document.getElementById('chartContainer');
  const svg = document.getElementById('forecastSvgChart');
  const tooltip = document.getElementById('chartTooltip');
  const hoverGroup = document.getElementById('chartHoverGroup');
  const crosshair = document.getElementById('hoverCrosshair');
  const dot = document.getElementById('hoverCursorDot');
  const ctTime = document.getElementById('ctTime');
  const ctBase = document.getElementById('ctBaselineVal');
  const ctSim = document.getElementById('ctSimulatedVal');

  if (!container || !svg || !tooltip) return;

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 340;

    if (x >= 30 && x <= 330) {
      if (hoverGroup) hoverGroup.classList.remove('hidden');
      if (crosshair) {
        crosshair.setAttribute('x1', x);
        crosshair.setAttribute('x2', x);
      }

      // Compute estimated Y & AQI
      const progress = (x - 30) / 300;
      const hourOffset = Math.round(progress * 24);
      const isPast = x <= 120;

      let baselineAqi = Math.round(160 + Math.sin(progress * Math.PI * 2) * 20);
      let simAqi = isPast ? baselineAqi : Math.round(baselineAqi * 0.78);

      if (dot) {
        const y = 140 - (simAqi / 300) * 120;
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
      }

      if (ctTime) ctTime.textContent = isPast ? `Observed (-${Math.round((120 - x) / 5)}h)` : `+${hourOffset}h Forecast`;
      if (ctBase) ctBase.textContent = `${baselineAqi} AQI`;
      if (ctSim) ctSim.textContent = `${simAqi} AQI`;

      tooltip.classList.remove('hidden');
      tooltip.style.left = `${(x / 340) * 100}%`;
    }
  });

  svg.addEventListener('mouseleave', () => {
    if (hoverGroup) hoverGroup.classList.add('hidden');
    if (tooltip) tooltip.classList.add('hidden');
  });
}

/* ==========================================================================
   10. DONUT CHART HOVER EFFECTS
   ========================================================================== */
function initDonutHover() {
  const segments = document.querySelectorAll('.donut-segment');
  const legendItems = document.querySelectorAll('.source-legend-item');
  const centerAqi = document.getElementById('donutCenterAqi');

  segments.forEach(seg => {
    seg.addEventListener('mouseenter', () => {
      const source = seg.getAttribute('data-source');
      const pct = seg.getAttribute('data-pct');
      if (centerAqi) centerAqi.textContent = `${pct}%`;
      highlightLegend(source);
    });

    seg.addEventListener('mouseleave', () => {
      if (centerAqi) centerAqi.textContent = document.getElementById('fmcAqiVal')?.textContent || '168';
      clearLegendHighlights();
    });
  });

  legendItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const source = item.getAttribute('data-source');
      highlightSegment(source);
    });

    item.addEventListener('mouseleave', () => {
      clearSegmentHighlights();
    });
  });

  function highlightLegend(source) {
    legendItems.forEach(item => {
      item.style.opacity = item.getAttribute('data-source') === source ? '1' : '0.4';
    });
  }

  function clearLegendHighlights() {
    legendItems.forEach(item => (item.style.opacity = '1'));
  }

  function highlightSegment(source) {
    segments.forEach(seg => {
      if (seg.getAttribute('data-source') === source) {
        seg.style.strokeWidth = '30';
      } else {
        seg.style.opacity = '0.4';
      }
    });
  }

  function clearSegmentHighlights() {
    segments.forEach(seg => {
      seg.style.strokeWidth = '24';
      seg.style.opacity = '1';
    });
  }
}

/* ==========================================================================
   11. REAL-TIME CLOCK
   ========================================================================== */
function initClock() {
  const dateEl = document.getElementById('headerDate');
  const timeEl = document.getElementById('headerTime');

  function update() {
    const now = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const dateFormatted = now.toLocaleDateString('en-GB', options);
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (dateEl) dateEl.textContent = dateFormatted;
    if (timeEl && !isPlayingTimeline) timeEl.textContent = timeFormatted;
  }

  update();
  setInterval(update, 30000);
}

/* ==========================================================================
   UTILITY: NUMBER COUNTER ANIMATION
   ========================================================================== */
function animateNumber(elementId, targetVal, duration = 400) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const startVal = parseInt(el.textContent, 10) || 0;
  if (startVal === targetVal) return;

  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (targetVal - startVal) * easeProgress);

    el.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = targetVal;
    }
  }

  requestAnimationFrame(step);
}
