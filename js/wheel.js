'use strict';

// ─────────────────────────────────────────
// SLIDE SWIPER — 2 slides horizontales
// ─────────────────────────────────────────

class SlideSwiper {
  constructor(track, dotsEl) {
    this.track   = track;
    this.dotsEl  = dotsEl;
    this.count   = track.children.length;
    this.current = 0;
    this.startX  = 0;
    this.diffX   = 0;
    this.active  = false;
    this._bind();
    this._update(false);
  }

  _bind() {
    const t = this.track;
    t.addEventListener('touchstart',  e => this._start(e.touches[0].clientX), { passive: true });
    t.addEventListener('touchmove',   e => { if (this.active) { e.preventDefault(); this._move(e.touches[0].clientX); } }, { passive: false });
    t.addEventListener('touchend',    () => this._end());
    t.addEventListener('touchcancel', () => this._end());
    t.addEventListener('mousedown',   e => { e.preventDefault(); this._start(e.clientX); });
    window.addEventListener('mousemove', e => { if (this.active) this._move(e.clientX); });
    window.addEventListener('mouseup',   () => { if (this.active) this._end(); });
  }

  _start(x) {
    this.startX = x;
    this.diffX  = 0;
    this.active = true;
    this.track.style.transition = 'none';
  }

  _move(x) {
    this.diffX     = x - this.startX;
    const pct      = (this.current * -100) + (this.diffX / this.track.offsetWidth) * 100;
    this.track.style.transform = `translateX(${pct}%)`;
  }

  _end() {
    if (!this.active) return;
    this.active = false;
    const threshold = this.track.offsetWidth * 0.22;
    if      (this.diffX < -threshold) this.goTo(Math.min(this.current + 1, this.count - 1));
    else if (this.diffX >  threshold) this.goTo(Math.max(this.current - 1, 0));
    else                              this._update(true);
  }

  goTo(index) {
    this.current = index;
    this._update(true);
  }

  _update(animate) {
    this.track.style.transition = animate
      ? 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none';
    this.track.style.transform = `translateX(${this.current * -100}%)`;
    this.dotsEl.querySelectorAll('.mdot').forEach((d, i) =>
      d.classList.toggle('mdot--active', i === this.current)
    );
  }

  reset() { this.goTo(0); }
}
