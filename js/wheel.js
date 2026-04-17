// ─────────────────────────────────────────
// RADIAL METRICS — carrusel horizontal con arco simulado
//
// 5 fichas montadas en un arco virtual horizontal.
// Siempre visibles: 1 central (activa) + 1 izq. + 1 dcha.
// Swipe horizontal con inercia y snap suave.
// ─────────────────────────────────────────

'use strict';

class RadialMetrics {
  constructor(container, data) {
    this.el   = container;
    this.data = data;
    this.n    = data.length;

    // Layout — SPREAD recalculado en resize()
    this.SPREAD    = 0;
    this.ARC_DIP   = 12;   // px de hundimiento parabólico en laterales
    this.SCALE_1   = 0.72; // escala de fichas en posición ±1
    this.OPACITY_1 = 0.38; // opacidad de fichas en posición ±1

    // 5 slots DOM (-2·-1·0·+1·+2); solo 3 visibles en cada momento
    this.SLOTS = 5;
    this.HALF  = 2;

    // Física
    this.offset   = 0;
    this.velocity = 0;
    this.dragging = false;
    this.lastX    = 0;
    this.lastT    = 0;
    this.rafId    = null;
    this._snapTid = null;

    this._build();
    this._bind();
    requestAnimationFrame(() => this.resize());
  }

  // ─── DOM ──────────────────────────────
  _build() {
    this.el.innerHTML = '';
    this.cards = Array.from({ length: this.SLOTS }, () => {
      const card = document.createElement('div');
      card.className = 'metric-card';
      card.innerHTML =
        `<div class="metric-card__icon"></div>
         <div class="metric-card__name"></div>
         <div class="metric-card__value"></div>
         <div class="metric-card__label"></div>
         <p class="metric-card__phrase"></p>`;
      this.el.appendChild(card);
      return card;
    });
  }

  // ─── Render ───────────────────────────
  _render() {
    const base = Math.floor(this.offset);
    const frac = this.offset - base;

    for (let s = 0; s < this.SLOTS; s++) {
      const rel    = s - this.HALF;      // -2, -1, 0, +1, +2
      const pos    = rel - frac;         // posición continua relativa al centro
      const absPos = Math.abs(pos);
      const card   = this.cards[s];

      // Ocultar fichas demasiado lejanas
      if (absPos > 1.6) {
        card.style.opacity       = '0';
        card.style.pointerEvents = 'none';
        continue;
      }

      const t       = Math.min(absPos, 1);
      const x       = pos * this.SPREAD;
      const y       = t * t * this.ARC_DIP;          // hundimiento parabólico
      const scale   = 1 - t * (1 - this.SCALE_1);
      const opacity = 1 - t * (1 - this.OPACITY_1);
      const active  = absPos < 0.42;

      card.style.transform     = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
      card.style.opacity       = String(Math.max(0, opacity));
      card.style.zIndex        = String(Math.round(10 - absPos * 5));
      card.style.pointerEvents = active ? 'auto' : 'none';
      card.classList.toggle('active', active);

      // Contenido
      const di   = ((base + rel) % this.n + this.n) % this.n;
      const item = this.data[di];
      this._fill(card, item, active);
    }
  }

  _fill(card, item, active) {
    const iconEl = card.querySelector('.metric-card__icon');
    if (iconEl.dataset.id !== item.id) {
      iconEl.innerHTML  = item.icon;
      iconEl.dataset.id = item.id;
    }
    card.querySelector('.metric-card__name').textContent   = item.name;
    card.querySelector('.metric-card__value').textContent  = item.value  || '—';
    card.querySelector('.metric-card__label').textContent  = active ? (item.label  || '') : '';
    card.querySelector('.metric-card__phrase').textContent = active ? (item.phrase || '') : '';
  }

  // ─── Gestos ───────────────────────────
  _bind() {
    const el = this.el;

    el.addEventListener('touchstart',  e => { e.preventDefault(); this._start(e.touches[0].clientX); }, { passive: false });
    el.addEventListener('touchmove',   e => { e.preventDefault(); this._move(e.touches[0].clientX);  }, { passive: false });
    el.addEventListener('touchend',    () => this._end());
    el.addEventListener('touchcancel', () => this._end());

    el.addEventListener('mousedown', e => { e.preventDefault(); this._start(e.clientX); });
    window.addEventListener('mousemove', e => { if (this.dragging) this._move(e.clientX); });
    window.addEventListener('mouseup',   () => { if (this.dragging) this._end(); });
  }

  _start(x) {
    this._cancelAll();
    this.dragging = true;
    this.lastX    = x;
    this.lastT    = performance.now();
    this.velocity = 0;
  }

  _move(x) {
    if (!this.dragging) return;
    const now = performance.now();
    const dx  = x - this.lastX;
    const dt  = Math.max(1, now - this.lastT);

    this.offset   -= dx / this.SPREAD;
    this.velocity  = -(dx / dt) * (1000 / 60) / this.SPREAD;

    this.lastX = x;
    this.lastT = now;
    this._render();
  }

  _end() {
    if (!this.dragging) return;
    this.dragging = false;
    this._inertia();
  }

  // ─── Física ───────────────────────────
  _inertia() {
    const decay = 0.88;
    const tick  = () => {
      if (Math.abs(this.velocity) < 0.006) {
        this.velocity = 0;
        this._snap();
        return;
      }
      this.offset   += this.velocity;
      this.velocity *= decay;
      this._render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  _snap() {
    const target = Math.round(this.offset);
    const start  = this.offset;
    const dist   = target - start;

    if (Math.abs(dist) < 0.002) {
      this.offset = target;
      this._render();
      return;
    }

    const dur = Math.min(320, Math.abs(dist) * 190);
    const t0  = performance.now();

    const tick = now => {
      const t    = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - t, 3);   // ease-out cúbica
      this.offset = start + dist * ease;
      this._render();
      if (t < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.offset = target;
        this._render();
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  _cancelAll() {
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    clearTimeout(this._snapTid);
    this._snapTid = null;
  }

  // ─── API pública ──────────────────────
  resize() {
    this.SPREAD = this.el.clientWidth * 0.56;
    this._render();
  }

  refresh() {
    this._render();
  }

  activeIndex() {
    return ((Math.round(this.offset)) % this.n + this.n) % this.n;
  }
}
