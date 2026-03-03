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
    if (key === 'ArrowRight' || key === 'KeyD') {
      e.preventDefault();
      slider.next();
      return;
    }
    if (key === 'ArrowLeft' || key === 'KeyA') {
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

  // Information items: arrow keys cycle, number keys select, enter activates
  if (sections[currentNav] === 'information') {
    if (key === 'ArrowRight' || key === 'KeyD') {
      e.preventDefault();
      highlightContact(Math.min(contactItems.length - 1, highlightedContact + 1));
      return;
    }
    if (key === 'ArrowLeft' || key === 'KeyA') {
      e.preventDefault();
      highlightContact(Math.max(0, highlightedContact - 1));
      return;
    }
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
const isTouchDevice = 'ontouchstart' in window;
let primedItem = null;

contactItems.forEach(item => {
  if (!item.dataset.hover) return;
  const text = item.querySelector('.contact-text');

  if (isTouchDevice) {
    item.addEventListener('click', (e) => {
      if (primedItem !== item) {
        // First tap: show hover state with ?
        e.preventDefault();
        // Reset previous primed item
        if (primedItem) {
          const prevText = primedItem.querySelector('.contact-text');
          prevText.textContent = primedItem.dataset.default;
          primedItem.classList.remove('highlighted');
        }
        text.textContent = item.dataset.hover + '?';
        item.classList.add('highlighted');
        primedItem = item;
      } else {
        // Second tap: activate — let it through
        text.textContent = item.dataset.default;
        item.classList.remove('highlighted');
        primedItem = null;
      }
    });
  } else {
    item.addEventListener('mouseenter', () => { text.textContent = item.dataset.hover; });
    item.addEventListener('mouseleave', () => { text.textContent = item.dataset.default; });
  }
});

document.getElementById('copy-email').addEventListener('click', () => {
  navigator.clipboard.writeText('ollymennis@gmail.com');
  const emailText = document.querySelector('#copy-email .contact-text');
  emailText.innerHTML = '01 <span style="opacity: 0.5;">copied ✓</span>';
  setTimeout(() => { emailText.textContent = '01 email'; }, 2000);
});

// --- Dark mode ---
let darkMode = false;

function toggleDarkMode() {
  darkMode = !darkMode;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : '');
}

let canvasOpen = false;

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
    stickerDragging = true;
  }

  function moveDrag(clientX, clientY) {
    if (!dragging) return;
    sticker.style.left = (clientX - offsetX) + 'px';
    sticker.style.top = (clientY - offsetY) + 'px';
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    stickerDragging = false;
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

// --- Scribble Canvas ---
const scribbleCanvas = document.getElementById('scribble-canvas');
const scribbleCtx = scribbleCanvas.getContext('2d');
const strokes = [];
let scribbling = false;

function resizeScribble() {
  const dpr = window.devicePixelRatio || 1;
  scribbleCanvas.width = window.innerWidth * dpr;
  scribbleCanvas.height = window.innerHeight * dpr;
  scribbleCtx.scale(dpr, dpr);
}
resizeScribble();
window.addEventListener('resize', resizeScribble);

let stickerDragging = false;

function startScribble(x, y) {
  if (stickerDragging) return;
  scribbling = true;
  strokes.push({ points: [{ x, y, t: Date.now() }] });
}

function moveScribble(x, y) {
  if (!scribbling) return;
  strokes[strokes.length - 1].points.push({ x, y, t: Date.now() });
}

function endScribble() {
  scribbling = false;
}

function isInteractive(el) {
  return el.closest('button, a, .nav-btn, .contact-item, .sticker');
}

document.addEventListener('mousedown', (e) => { if (!isInteractive(e.target)) startScribble(e.clientX, e.clientY); });
document.addEventListener('mousemove', (e) => moveScribble(e.clientX, e.clientY));
document.addEventListener('mouseup', endScribble);

document.addEventListener('touchstart', (e) => { if (!isInteractive(e.target)) startScribble(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
document.addEventListener('touchmove', (e) => { if (scribbling) moveScribble(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
document.addEventListener('touchend', endScribble);

// Render loop: erase points from front after 5s per point
const ERASE_DELAY = 1500;
const style = getComputedStyle(document.documentElement);

function renderScribble() {
  scribbleCtx.clearRect(0, 0, scribbleCanvas.width, scribbleCanvas.height);
  const now = Date.now();

  for (let i = strokes.length - 1; i >= 0; i--) {
    const pts = strokes[i].points;
    // Remove expired points from the front
    while (pts.length > 0 && now - pts[0].t > ERASE_DELAY) {
      pts.shift();
    }
    // Remove empty strokes
    if (pts.length < 2) {
      strokes.splice(i, 1);
      continue;
    }

    scribbleCtx.globalAlpha = 1;
    scribbleCtx.strokeStyle = style.getPropertyValue('--fg').trim();
    scribbleCtx.lineWidth = 2;
    scribbleCtx.lineCap = 'square';
    scribbleCtx.lineJoin = 'miter';
    scribbleCtx.beginPath();
    scribbleCtx.moveTo(pts[0].x, pts[0].y);
    for (let j = 1; j < pts.length; j++) {
      scribbleCtx.lineTo(pts[j].x, pts[j].y);
    }
    scribbleCtx.stroke();
  }

  requestAnimationFrame(renderScribble);
}
requestAnimationFrame(renderScribble);
