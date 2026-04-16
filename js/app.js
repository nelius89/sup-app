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
  const row   = document.getElementById('spots-row');
  const spots = getAllSpots();
  row.innerHTML = '';

  spots.forEach(spot => {
    const btn = document.createElement('button');
    btn.className = 'spot-item' + (deleteMode === spot.id ? ' spot-item--delete-mode' : '');
    btn.dataset.id = spot.id;
    btn.innerHTML = `
      <span class="spot-item__name">${spot.name}</span>
      ${!spot.hardcoded ? `<span class="spot-item__delete" data-delete="${spot.id}">✕</span>` : ''}
    `;

    btn.addEventListener('click', (e) => {
      if (e.target.dataset.delete) return;
      loadSpot(spot);
    });

    if (!spot.hardcoded) {
      let pressTimer;
      btn.addEventListener('pointerdown', () => {
        pressTimer = setTimeout(() => {
          deleteMode = spot.id;
          renderSpotList();
        }, 600);
      });
      btn.addEventListener('pointerup',    () => clearTimeout(pressTimer));
      btn.addEventListener('pointerleave', () => clearTimeout(pressTimer));
    }

    row.appendChild(btn);
  });

  // Botón añadir — siempre al final del grid
  const addBtn = document.createElement('button');
  addBtn.className = 'btn-add-spot';
  addBtn.id = 'btn-add-spot';
  addBtn.textContent = '+';
  addBtn.addEventListener('click', openOverlay);
  row.appendChild(addBtn);

  // Botones borrar
  row.querySelectorAll('[data-delete]').forEach(btn => {
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
    const initIndex = getCurrentFranjaIndex();
    sliderEl.max   = (FRANJAS.length * FORECAST_DAYS) - 1;
    sliderEl.value = initIndex;
    renderResults(initIndex);
    initDrum();
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
  const score  = calcularScore(d.windKn, d.waveH, d.gustKn, d.wavePer, d.cloudPct);
  const estado = getEstado(score, d.weathercode);
  const info   = ESTADOS[estado];

  document.getElementById('diagnosis-title').textContent    = info.titulo;
  document.getElementById('diagnosis-desc').textContent     = info.desc;
  document.getElementById('diagnosis-illus').dataset.estado = estado;

  // Capa 2: Offshore
  const offshore = esOffshore(d.windDir, currentSpot);
  document.getElementById('offshore-alert').classList.toggle('hidden', !offshore);

  // Capa 3: Drum de métricas — nuevos IDs
  const lv = labelViento(d.windKn);
  document.getElementById('dv-wind').textContent = `${d.windKn.toFixed(1)} kn`;
  document.getElementById('dl-wind').textContent = lv.label;
  document.getElementById('dp-wind').textContent = lv.phrase;

  const lo = labelOla(d.waveH);
  document.getElementById('dv-wave').textContent = `${d.waveH.toFixed(1)} m`;
  document.getElementById('dl-wave').textContent = lo.label;
  document.getElementById('dp-wave').textContent = lo.phrase;

  const lr = labelRacha(d.gustKn);
  document.getElementById('dv-gusts').textContent = `${d.gustKn.toFixed(1)} kn`;
  document.getElementById('dl-gusts').textContent = lr.label;
  document.getElementById('dp-gusts').textContent = lr.phrase;

  const lp = labelPeriodo(d.wavePer);
  document.getElementById('dv-period').textContent = `${d.wavePer.toFixed(0)} s`;
  document.getElementById('dl-period').textContent = lp.label;
  document.getElementById('dp-period').textContent = lp.phrase;

  const ld = labelDireccion(d.windDir);
  document.getElementById('dv-dir').textContent = degreesToCardinal(d.windDir);
  document.getElementById('dl-dir').textContent = ld.label;
  document.getElementById('dp-dir').textContent = ld.phrase;

  // Barra temporal: etiqueta
  document.getElementById('time-bar-label').textContent = sliderLabel(sliderIndex);
}

// ── Drum: scroll e inicio ──
const ITEM_HEIGHT = 80;

function updateDrumOpacity() {
  const drum  = document.getElementById('metrics-drum');
  const items = [...drum.querySelectorAll('.drum-item')];
  const center = drum.scrollTop + drum.clientHeight / 2;

  items.forEach(item => {
    const itemCenter = item.offsetTop + ITEM_HEIGHT / 2;
    const dist = Math.abs(center - itemCenter);
    const isActive = dist < ITEM_HEIGHT * 0.55;
    item.classList.toggle('active', isActive);
  });
}

function initDrum() {
  const drum = document.getElementById('metrics-drum');
  // Padding dinámico para que primer y último item lleguen al centro
  const pad = Math.max(0, (drum.clientHeight / 2) - (ITEM_HEIGHT / 2));
  drum.style.paddingTop    = pad + 'px';
  drum.style.paddingBottom = pad + 'px';
  drum.scrollTop = 0;
  updateDrumOpacity();
  drum.addEventListener('scroll', updateDrumOpacity, { passive: true });
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
