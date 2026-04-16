// ─────────────────────────────────────────
// APP — Lógica principal y navegación
// ─────────────────────────────────────────

// ── Estado ──
let currentSpot   = null;
let currentData   = null; // { marine, forecast }
let deleteMode    = null; // id del spot en modo borrar

// ── Vistas ──
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Home ──
function renderSpotList() {
  const list   = document.getElementById('spot-list');
  const spots  = getAllSpots();
  list.innerHTML = '';

  spots.forEach(spot => {
    const li = document.createElement('li');
    li.className = 'spot-item' + (deleteMode === spot.id ? ' spot-item--delete-mode' : '');
    li.dataset.id = spot.id;
    li.innerHTML = `
      <div>
        <div class="spot-item__name">${spot.name}</div>
        <div class="spot-item__city">${spot.city}</div>
      </div>
      ${!spot.hardcoded ? `<button class="spot-item__delete" data-delete="${spot.id}">✕</button>` : ''}
    `;

    // Tap → navegar a resultados
    li.addEventListener('click', (e) => {
      if (e.target.dataset.delete) return; // lo maneja el botón de borrar
      loadSpot(spot);
    });

    // Long press → modo borrar (solo spots de usuario)
    if (!spot.hardcoded) {
      let pressTimer;
      li.addEventListener('pointerdown', () => {
        pressTimer = setTimeout(() => {
          deleteMode = spot.id;
          renderSpotList();
        }, 600);
      });
      li.addEventListener('pointerup',   () => clearTimeout(pressTimer));
      li.addEventListener('pointerleave', () => clearTimeout(pressTimer));
    }

    list.appendChild(li);
  });

  // Botón borrar dentro del item
  list.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeUserSpot(btn.dataset.delete);
      deleteMode = null;
      renderSpotList();
    });
  });
}

// ── Cargar datos y mostrar resultados ──
async function loadSpot(spot) {
  currentSpot = spot;
  setActiveSpot(spot.id);
  showView('view-results');

  document.getElementById('results-spot-name').textContent = spot.name;
  document.getElementById('diagnosis-title').textContent   = 'Cargando...';
  document.getElementById('diagnosis-desc').textContent    = '';

  try {
    currentData = await fetchSpotData(spot);
    const sliderEl  = document.getElementById('time-slider');
    const initIndex = getCurrentFranjaIndex(); // franja según hora actual
    sliderEl.max   = (FRANJAS.length * FORECAST_DAYS) - 1;
    sliderEl.value = initIndex;
    renderResults(initIndex);
  } catch (err) {
    document.getElementById('diagnosis-title').textContent = 'Sin conexión';
    document.getElementById('diagnosis-desc').textContent  = 'No se han podido cargar los datos. Comprueba tu conexión.';
  }
}

function renderResults(sliderIndex) {
  if (!currentData) return;
  const { marine, forecast } = currentData;
  const d = getDataForSlider(sliderIndex, marine, forecast);

  // Capa 1: Score y estado
  const score    = calcularScore(d.windKn, d.waveH, d.gustKn, d.wavePer, d.cloudPct);
  const estado   = getEstado(score, d.weathercode);
  const info     = ESTADOS[estado];

  document.getElementById('diagnosis-title').textContent = info.titulo;
  document.getElementById('diagnosis-desc').textContent  = info.desc;
  document.getElementById('diagnosis-illus').dataset.estado = estado;

  // Capa 2: Offshore
  const offshore = esOffshore(d.windDir, currentSpot);
  document.getElementById('offshore-alert').classList.toggle('hidden', !offshore);

  // Capa 3: Métricas
  const lv = labelViento(d.windKn);
  document.getElementById('metric-wind-value').textContent  = `${d.windKn.toFixed(1)} kn`;
  document.getElementById('metric-wind-label').textContent  = lv.label;
  document.getElementById('metric-wind-phrase').textContent = lv.phrase;

  const lo = labelOla(d.waveH);
  document.getElementById('metric-wave-value').textContent  = `${d.waveH.toFixed(1)} m`;
  document.getElementById('metric-wave-label').textContent  = lo.label;
  document.getElementById('metric-wave-phrase').textContent = lo.phrase;

  const lr = labelRacha(d.gustKn);
  document.getElementById('metric-gusts-value').textContent  = `${d.gustKn.toFixed(1)} kn`;
  document.getElementById('metric-gusts-label').textContent  = lr.label;
  document.getElementById('metric-gusts-phrase').textContent = lr.phrase;

  const lp = labelPeriodo(d.wavePer);
  document.getElementById('metric-period-value').textContent  = `${d.wavePer.toFixed(0)} s`;
  document.getElementById('metric-period-label').textContent  = lp.label;
  document.getElementById('metric-period-phrase').textContent = lp.phrase;

  const ld = labelDireccion(d.windDir);
  document.getElementById('metric-direction-value').textContent  = degreesToCardinal(d.windDir);
  document.getElementById('metric-direction-label').textContent  = ld.label;
  document.getElementById('metric-direction-phrase').textContent = ld.phrase;

  // Barra temporal: etiqueta
  document.getElementById('time-bar-label').textContent = sliderLabel(sliderIndex);
}

// ── Overlay: añadir spot ──
let selectedGeoResult = null;

function openOverlay() {
  document.getElementById('overlay-add-spot').classList.remove('hidden');
  document.getElementById('search-input').focus();
}

function closeOverlay() {
  document.getElementById('overlay-add-spot').classList.add('hidden');
  document.getElementById('search-input').value   = '';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('add-spot-confirm').classList.add('hidden');
  document.getElementById('spot-name-input').value = '';
  selectedGeoResult = null;
}

async function handleSearch(query) {
  const list = document.getElementById('search-results');
  list.innerHTML = '<li style="padding:14px 16px;opacity:0.4;font-size:13px">Buscando...</li>';
  const results = await searchSpots(query);

  list.innerHTML = '';
  if (!results.length) {
    list.innerHTML = '<li style="padding:14px 16px;opacity:0.4;font-size:13px">Sin resultados</li>';
    return;
  }

  results.forEach(r => {
    const li = document.createElement('li');
    li.className = 'search-result-item';
    li.innerHTML = `${r.name}<span class="search-result-item__country">${r.country || ''}</span>`;
    li.addEventListener('click', () => selectGeoResult(r));
    list.appendChild(li);
  });
}

function selectGeoResult(result) {
  selectedGeoResult = result;
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('spot-name-input').value = result.name;
  document.getElementById('add-spot-confirm').classList.remove('hidden');
}

function saveNewSpot() {
  if (!selectedGeoResult) return;
  const name = document.getElementById('spot-name-input').value.trim() || selectedGeoResult.name;
  const newSpot = {
    id: `user-${Date.now()}`,
    name,
    city: selectedGeoResult.admin1 || selectedGeoResult.country || '',
    lat: selectedGeoResult.latitude,
    lon: selectedGeoResult.longitude,
    hardcoded: false,
    offshore_range: [225, 315] // default — misma costa
  };
  addUserSpot(newSpot);
  closeOverlay();
  renderSpotList();
}

// ── Event listeners ──
document.addEventListener('DOMContentLoaded', () => {
  renderSpotList();
  showView('view-home');

  // Back button
  document.getElementById('btn-back').addEventListener('click', () => {
    showView('view-home');
    renderSpotList();
  });

  // Abrir overlay
  document.getElementById('btn-add-spot').addEventListener('click', openOverlay);
  document.getElementById('btn-close-overlay').addEventListener('click', closeOverlay);

  // Cerrar overlay tocando fuera
  document.getElementById('overlay-add-spot').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeOverlay();
  });

  // Búsqueda con debounce
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    if (q.length < 2) {
      document.getElementById('search-results').innerHTML = '';
      return;
    }
    searchTimer = setTimeout(() => handleSearch(q), 350);
  });

  // Guardar spot nuevo
  document.getElementById('btn-save-spot').addEventListener('click', saveNewSpot);

  // Slider temporal
  document.getElementById('time-slider').addEventListener('input', (e) => {
    renderResults(parseInt(e.target.value));
  });

  // Cerrar modo borrar tocando fuera de la lista
  document.addEventListener('click', (e) => {
    if (deleteMode && !e.target.closest('.spot-list')) {
      deleteMode = null;
      renderSpotList();
    }
  });
});
