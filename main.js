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

  if (modalOpen) closeModal();

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
  if (modalOpen && e.code === 'Escape') {
    closeModal();
    return;
  }
  if (modalOpen && e.code === 'Space') {
    e.preventDefault();
    cvModal.querySelector('.cv-modal-inner').scrollBy(0, e.shiftKey ? -200 : 200);
    return;
  }

  const key = e.code;

  // / : toggle dark mode
  if (key === 'Slash') {
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
        contactItems[idx].click();
      }
    }
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
        text.textContent = item.dataset.hover;
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
    item.addEventListener('mouseleave', () => { if (!emailCopied || item.id !== 'copy-email') text.textContent = item.dataset.default; });
  }
});

let emailCopied = false;
document.getElementById('copy-email').addEventListener('click', () => {
  navigator.clipboard.writeText('ollymennis@gmail.com');
  const emailText = document.querySelector('#copy-email .contact-text');
  emailText.innerHTML = '01 <span style="opacity: 0.5;">copied ollymennis@gmail.com</span>';
  emailCopied = true;
  setTimeout(() => { emailText.textContent = '01 email'; emailCopied = false; }, 3000);
});

// --- Dark mode ---
let darkMode = false;

function toggleDarkMode() {
  darkMode = !darkMode;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : '');
}

let canvasOpen = false;

// --- CV Modal ---
const cvModal = document.getElementById('cv-modal');
const cvLink = document.querySelector('[data-default="03 cv"]');

let modalOpen = false;

function openModal() {
  cvModal.classList.add('active');
  modalOpen = true;
}

function closeModal() {
  cvModal.classList.remove('active');
  modalOpen = false;
}

cvLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (modalOpen) closeModal();
  else openModal();
});

document.getElementById('cv-close').addEventListener('click', () => closeModal());

contactItems.forEach(item => {
  if (item === cvLink) return;
  item.addEventListener('click', () => { if (modalOpen) closeModal(); });
});

// --- Load CV from markdown ---
fetch('/cv/cv.md')
  .then(r => r.text())
  .then(md => {
    const lines = md.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
      // Skip h1 (name) and the line right after (subtitle) — already shown on site
      if (line.startsWith('# ')) {
        const name = line.slice(2).trim();
        html += `<h2 class="cv-name">${name}</h2>`;
        continue;
      }

      // h2 — role headers or education header
      if (line.startsWith('## ')) {
        if (inList) { html += '</ul></div>'; inList = false; }
        const heading = line.slice(3).trim();
        if (heading.toLowerCase() === 'education') continue;
        html += `<div class="cv-role"><p class="cv-role-header">${heading.replace(/ · /g, ' \u00b7 ').replace(/–/g, '\u2013')}</p>`;
        continue;
      }

      // List items
      if (line.startsWith('- ')) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${line.slice(2).replace(/—/g, '\u2014')}</li>`;
        continue;
      }

      // Plain text lines (subtitle, summary, education)
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) { html += '</ul></div>'; inList = false; }
        continue;
      }

      // Subtitle line (comes right after name)
      if (html.includes('cv-name') && !html.includes('cv-subtitle')) {
        html += `<p class="cv-subtitle">${trimmed}</p>`;
        continue;
      }

      // Summary paragraph (before first h2)
      if (!html.includes('cv-role')) {
        html += `<p class="cv-summary">${trimmed.replace(/—/g, '\u2014')}</p>`;
        continue;
      }

      // Education line
      html += `<p class="cv-education">${trimmed.replace(/ · /g, ' \u00b7 ').replace(/–/g, '\u2013')}</p>`;
    }

    if (inList) html += '</ul></div>';
    document.getElementById('cv-content').innerHTML = html;
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

    // Draw trail at full opacity in #ABC8D6
    for (let i = 0; i < trail.length; i++) {
      rects[i].setAttribute('x', trail[i][0] * STEP);
      rects[i].setAttribute('y', trail[i][1] * STEP);
      rects[i].setAttribute('fill', '#ABC8D6');
      rects[i].setAttribute('opacity', '1');
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
let stickerDragging = false;
const ERASE_DELAY = 600;

function resizeScribble() {
  const dpr = window.devicePixelRatio || 1;
  scribbleCanvas.width = window.innerWidth * dpr;
  scribbleCanvas.height = window.innerHeight * dpr;
  scribbleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeScribble();
window.addEventListener('resize', resizeScribble);

let fgColor = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
const fgObserver = new MutationObserver(() => {
  fgColor = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
});
fgObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

function startScribble(x, y) {
  if (stickerDragging || modalOpen) return;
  scribbling = true;
  document.body.classList.add('drawing');
  strokes.push({ points: [{ x, y }], endTime: null });
}

function moveScribble(x, y) {
  if (!scribbling) return;
  strokes[strokes.length - 1].points.push({ x, y });
}

function endScribble() {
  if (scribbling && strokes.length > 0) {
    strokes[strokes.length - 1].endTime = Date.now();
  }
  scribbling = false;
  document.body.classList.remove('drawing');
}

function isInteractive(el) {
  return el.closest('button, a, .nav-btn, .contact-item, .sticker, .cv-modal');
}

document.addEventListener('mousedown', (e) => { if (!isInteractive(e.target)) startScribble(e.clientX, e.clientY); });
document.addEventListener('mousemove', (e) => moveScribble(e.clientX, e.clientY));
document.addEventListener('mouseup', endScribble);

document.addEventListener('touchstart', (e) => { if (!isInteractive(e.target)) { e.preventDefault(); startScribble(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
document.addEventListener('touchmove', (e) => { if (scribbling) { e.preventDefault(); moveScribble(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
document.addEventListener('touchend', endScribble);

function renderScribble() {
  scribbleCtx.clearRect(0, 0, scribbleCanvas.width, scribbleCanvas.height);
  const now = Date.now();

  for (let i = strokes.length - 1; i >= 0; i--) {
    const stroke = strokes[i];
    if (stroke.endTime && now - stroke.endTime > ERASE_DELAY) {
      strokes.splice(i, 1);
      continue;
    }
    if (stroke.points.length < 2) continue;

    const alpha = stroke.endTime ? Math.max(0, 1 - (now - stroke.endTime) / ERASE_DELAY) : 1;
    scribbleCtx.globalAlpha = alpha;
    scribbleCtx.strokeStyle = fgColor;
    scribbleCtx.lineWidth = 2;
    scribbleCtx.lineCap = 'square';
    scribbleCtx.lineJoin = 'miter';
    scribbleCtx.beginPath();
    scribbleCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let j = 1; j < stroke.points.length; j++) {
      scribbleCtx.lineTo(stroke.points[j].x, stroke.points[j].y);
    }
    scribbleCtx.stroke();
  }

  scribbleCtx.globalAlpha = 1;
  requestAnimationFrame(renderScribble);
}
requestAnimationFrame(renderScribble);
