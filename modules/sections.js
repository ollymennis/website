function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

const SECTION_NAMES = ['Hero', 'Approach', 'Icons', 'Work', 'Process', 'Download', 'Connect'];

export class SectionManager {
  constructor(sections) {
    this.sections = Array.from(sections);
    this.current = 0;
    this.transitioning = false;

    // Handle initial hash
    const hash = parseInt(location.hash.replace('#', ''), 10);
    if (!isNaN(hash) && hash >= 0 && hash < this.sections.length) {
      this.sections[0].classList.remove('active');
      this.current = hash;
      this.sections[hash].classList.add('active');
    }

    this.updateHUD();
  }

  goto(index) {
    if (this.transitioning) return;
    if (index === this.current) return;

    const prev = this.current;
    this.current = clamp(index, 0, this.sections.length - 1);
    if (prev === this.current) return;

    this.sections[prev].classList.remove('active');
    this.sections[prev].classList.add(index > prev ? 'exit-left' : 'exit-right');

    this.sections[this.current].classList.add('active', 'entering');

    this.transitioning = true;
    setTimeout(() => {
      this.sections[prev].classList.remove('exit-left', 'exit-right');
      this.sections[this.current].classList.remove('entering');
      this.transitioning = false;
    }, 400);

    this.updateHUD();
    history.replaceState(null, '', `#${this.current}`);
  }

  next() {
    this.goto(this.current + 1);
  }

  prev() {
    this.goto(this.current - 1);
  }

  scrollDown() {
    const inner = this.sections[this.current].querySelector('.section-inner');
    if (inner) inner.scrollBy({ top: 100, behavior: 'smooth' });
  }

  scrollUp() {
    const inner = this.sections[this.current].querySelector('.section-inner');
    if (inner) inner.scrollBy({ top: -100, behavior: 'smooth' });
  }

  updateHUD() {
    const pct = (this.current / (this.sections.length - 1)) * 100;
    const fill = document.getElementById('hud-fill');
    const currentEl = document.querySelector('.hud-current');
    const nameEl = document.getElementById('hud-section-name');

    if (fill) fill.style.setProperty('--pct', `${pct}%`);
    if (currentEl) currentEl.textContent = String(this.current).padStart(2, '0');
    if (nameEl) nameEl.textContent = SECTION_NAMES[this.current] || '';
  }
}
