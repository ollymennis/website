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
  if (!panel) return null;
  const slides = Array.from(panel.querySelectorAll('.work-slide'));
  if (slides.length === 0) return null;
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
    const text = item.querySelector('.contact-text');
    const isActive = i === index;
    item.classList.toggle('highlighted', isActive);
    if (text && item.dataset.hover) {
      text.textContent = isActive ? item.dataset.hover : item.dataset.default;
    }
  });
}

// --- Contact hover text swap ---
contactItems.forEach(item => {
  if (!item.dataset.hover) return;
  const text = item.querySelector('.contact-text');
  item.addEventListener('mouseenter', () => { text.textContent = item.dataset.hover; });
  item.addEventListener('mouseleave', () => { text.textContent = item.dataset.default; });
});

document.getElementById('copy-email').addEventListener('click', () => {
  navigator.clipboard.writeText('ollymennis@gmail.com');
  const msg = document.querySelector('.copied-msg');
  msg.removeAttribute('hidden');
  setTimeout(() => msg.setAttribute('hidden', ''), 2000);
});

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

const openCanvasBtn = document.getElementById('open-canvas');
if (openCanvasBtn) openCanvasBtn.addEventListener('click', openCanvas);
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

// --- Snake Loader ---
const snakeSvg = document.getElementById('snake-loader');
if (snakeSvg) {
  const CELL = 6;
  const STEP = 6;
  const TRAIL_LEN = 8;
  const INTERVAL = 120;

  // 3x3 snake path: L→R, R→L, L→R, then reverse back up the middle
  const path = [
    [0,0], [1,0], [2,0],   // row 0 →
    [2,1], [1,1], [0,1],   // row 1 ←
    [0,2], [1,2], [2,2],   // row 2 →
    [2,1], [1,1], [0,1],   // reverse back up
  ];

  let step = 0;
  const trail = [];

  // Pre-create rect elements for trail + head
  const rects = [];
  for (let i = 0; i < TRAIL_LEN + 1; i++) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', CELL);
    rect.setAttribute('height', CELL);
    rect.setAttribute('fill', 'currentColor');
    rect.setAttribute('opacity', '0');
    snakeSvg.appendChild(rect);
    rects.push(rect);
  }

  setInterval(() => {
    const pos = path[step % path.length];
    trail.push(pos);
    if (trail.length > TRAIL_LEN) trail.shift();

    // Hide all first
    rects.forEach(r => r.setAttribute('opacity', '0'));

    // Draw trail with fading opacity
    for (let i = 0; i < trail.length; i++) {
      const opacity = 0.6 - (trail.length - 1 - i) * 0.07;
      if (opacity <= 0) continue;
      rects[i].setAttribute('x', trail[i][0] * STEP);
      rects[i].setAttribute('y', trail[i][1] * STEP);
      rects[i].setAttribute('opacity', Math.max(0, opacity));
    }

    // Head at full opacity
    const head = rects[trail.length];
    head.setAttribute('x', pos[0] * STEP);
    head.setAttribute('y', pos[1] * STEP);
    head.setAttribute('opacity', '1');

    step++;
  }, INTERVAL);
}

// --- Draggable Stickers ---
let stickerZ = 100;

document.querySelectorAll('.sticker').forEach(sticker => {
  // Randomize position anywhere except the content box (top-left ~600x280)
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const CONTENT_W = 600;
  const CONTENT_H = 280;
  let x, y;
  do {
    x = Math.random() * (vw - 80);
    y = Math.random() * (vh - 80);
  } while (x < CONTENT_W && y < CONTENT_H);
  sticker.style.left = x + 'px';
  sticker.style.top = y + 'px';
  sticker.style.visibility = 'visible';

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function startDrag(clientX, clientY) {
    dragging = true;
    stickerZ++;
    sticker.style.zIndex = stickerZ;
    offsetX = clientX - sticker.getBoundingClientRect().left;
    offsetY = clientY - sticker.getBoundingClientRect().top;
    sticker.style.cursor = "url('/icons/mouse-click.svg'), grabbing";
  }

  function moveDrag(clientX, clientY) {
    if (!dragging) return;
    sticker.style.left = (clientX - offsetX) + 'px';
    sticker.style.top = (clientY - offsetY) + 'px';
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    sticker.style.cursor = "url('/icons/mouse-hover.svg'), grab";
  }

  // Mouse events
  sticker.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
  document.addEventListener('mousemove', (e) => { moveDrag(e.clientX, e.clientY); });
  document.addEventListener('mouseup', endDrag);

  // Touch events
  sticker.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  document.addEventListener('touchmove', (e) => { if (dragging) { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
  document.addEventListener('touchend', endDrag);
});
