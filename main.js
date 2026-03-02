// --- Nav / Tab system ---
const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
const panels = document.querySelectorAll('.content-panel');
const sections = navBtns.map(btn => btn.dataset.section);
let currentNav = 0;

function switchSection(index) {
  currentNav = index;
  const name = sections[index];

  navBtns.forEach((btn, i) => {
    const isActive = i === index;
    btn.classList.toggle('active', isActive);
  });

  panels.forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === name);
  });
}

navBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    switchSection(i);
    btn.blur();
  });
});

// --- Work Slides ---
const slides = document.querySelectorAll('.work-slide');
const currentEl = document.getElementById('work-current');
let currentSlide = 0;
let transitioning = false;

function gotoSlide(index) {
  if (transitioning) return;
  if (index === currentSlide) return;
  if (index < 0 || index >= slides.length) return;

  const prev = currentSlide;
  currentSlide = index;

  slides[prev].classList.remove('active');
  slides[prev].classList.add(index > prev ? 'exit-left' : '');

  slides[currentSlide].classList.add('active');

  transitioning = true;
  setTimeout(() => {
    slides[prev].classList.remove('exit-left');
    transitioning = false;
  }, 250);

  currentEl.textContent = String(currentSlide + 1).padStart(2, '0');
}

function isWorkActive() {
  return sections[currentNav] === 'work';
}

// --- Keyboard navigation ---
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const key = e.code;

  // Up/Down and W/S: navigate main nav
  if (key === 'ArrowUp' || key === 'KeyW') {
    e.preventDefault();
    switchSection(Math.max(0, currentNav - 1));
    return;
  }
  if (key === 'ArrowDown' || key === 'KeyS') {
    e.preventDefault();
    switchSection(Math.min(sections.length - 1, currentNav + 1));
    return;
  }

  // Left/Right and A/D: work slides (only when work is active)
  if (isWorkActive()) {
    if (key === 'ArrowRight' || key === 'KeyD') {
      e.preventDefault();
      gotoSlide(currentSlide + 1);
      return;
    }
    if (key === 'ArrowLeft' || key === 'KeyA') {
      e.preventDefault();
      gotoSlide(currentSlide - 1);
      return;
    }
    // Number keys 1-9 for work slides
    const num = key.match(/^Digit(\d)$/);
    if (num) {
      const idx = parseInt(num[1], 10) - 1;
      if (idx >= 0 && idx < slides.length) {
        e.preventDefault();
        gotoSlide(idx);
      }
    }
  }
});
