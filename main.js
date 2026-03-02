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

  // Clear contact highlight when leaving information
  if (name !== 'information') {
    highlightedContact = -1;
    contactItems.forEach(item => item.classList.remove('highlighted'));
  }
}

navBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    switchSection(i);
    btn.blur();
  });
});

// --- Slide System (shared by both work sections) ---
function createSlideController(panelSelector, counterId) {
  const panel = document.querySelector(panelSelector);
  const slides = Array.from(panel.querySelectorAll('.work-slide'));
  const counterEl = document.getElementById(counterId);
  let current = 0;
  let transitioning = false;

  return {
    slides,
    goto(index) {
      if (transitioning || index === current || index < 0 || index >= slides.length) return;
      const prev = current;
      current = index;

      slides[prev].classList.remove('active');
      const exitClass = index > prev ? 'exit-left' : 'exit-right';
      slides[prev].classList.add(exitClass);
      slides[current].classList.add('active');

      transitioning = true;
      setTimeout(() => {
        slides[prev].classList.remove(exitClass);
        transitioning = false;
      }, 250);

      counterEl.textContent = String(current + 1).padStart(2, '0');
    },
    next() { this.goto(current + 1); },
    prev() { this.goto(current - 1); },
    get current() { return current; },
  };
}

const workSlides = createSlideController('[data-panel="work-work"]', 'work-current');
const indieSlides = createSlideController('[data-panel="independent-work"]', 'indie-current');

function getActiveSlideController() {
  const name = sections[currentNav];
  if (name === 'work-work') return workSlides;
  if (name === 'independent-work') return indieSlides;
  return null;
}

// --- Keyboard navigation ---
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (canvasOpen) {
    if (e.code === 'Escape') closeCanvas();
    return;
  }

  const key = e.code;

  // D: toggle dark mode
  if (key === 'KeyD') {
    e.preventDefault();
    toggleDarkMode();
    return;
  }

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

  // Left/Right: work slides (only when a work section is active)
  const slider = getActiveSlideController();
  if (slider) {
    if (key === 'ArrowRight') {
      e.preventDefault();
      slider.next();
      return;
    }
    if (key === 'ArrowLeft') {
      e.preventDefault();
      slider.prev();
      return;
    }
    const num = key.match(/^Digit(\d)$/);
    if (num) {
      const idx = parseInt(num[1], 10) - 1;
      if (idx >= 0 && idx < slider.slides.length) {
        e.preventDefault();
        slider.goto(idx);
      }
    }
  }

  // Number keys for information items (highlight)
  if (sections[currentNav] === 'information') {
    const num = key.match(/^Digit(\d)$/);
    if (num) {
      const idx = parseInt(num[1], 10) - 1;
      if (idx >= 0 && idx < contactItems.length) {
        e.preventDefault();
        highlightContact(idx);
      }
    }
    // Enter triggers the highlighted item
    if (key === 'Enter' && highlightedContact >= 0) {
      e.preventDefault();
      contactItems[highlightedContact].click();
    }
  }
});

// --- Information keyboard nav ---
const contactItems = Array.from(document.querySelectorAll('.contact-item'));
let highlightedContact = -1;

function highlightContact(index) {
  highlightedContact = index;
  contactItems.forEach((item, i) => {
    item.classList.toggle('highlighted', i === index);
  });
}

// --- Dark mode ---
let darkMode = false;

function toggleDarkMode() {
  darkMode = !darkMode;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : '');
}

// --- Drawing Canvas ---
const modal = document.getElementById('canvas-modal');
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
let canvasOpen = false;
let drawing = false;

function openCanvas() {
  modal.removeAttribute('hidden');
  canvasOpen = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#1a1a18';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function closeCanvas() {
  modal.setAttribute('hidden', '');
  canvasOpen = false;
}

document.getElementById('open-canvas').addEventListener('click', openCanvas);
document.getElementById('canvas-close').addEventListener('click', closeCanvas);
document.getElementById('canvas-clear').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeCanvas();
});

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => { drawing = false; });
canvas.addEventListener('mouseleave', () => { drawing = false; });

document.getElementById('canvas-send').addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = 'message.png';
  link.href = dataURL;
  link.click();
  closeCanvas();
});
