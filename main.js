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

  // Clear project highlight when leaving work-work
  if (name !== 'work-work') {
    highlightedProject = -1;
    projectItems.forEach(item => item.classList.remove('highlighted'));
  }

  // Reset primed item
  if (primedItem) {
    const prevText = primedItem.querySelector('.contact-text');
    prevText.textContent = primedItem.dataset.default;
    primedItem.classList.remove('highlighted');
    primedItem = null;
  }

  if (activeModalType) closeModal();

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

const indieSlides = createSlideController('[data-panel="independent-work"]', 'indie-current');

function getActiveSlideController() {
  if (sections[currentNav] === 'independent-work') return indieSlides;
  return null;
}

// --- Keyboard navigation ---
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (activeModalType && e.code === 'Escape') {
    closeAnyModal();
    return;
  }
  if (activeModalType && e.code === 'Space') {
    e.preventDefault();
    const inner = activeModalType === 'cv'
      ? cvModal.querySelector('.cv-modal-inner')
      : projectModal.querySelector('.project-modal-inner');
    inner.scrollBy(0, e.shiftKey ? -200 : 200);
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

  // Work-work project items: arrow keys cycle, number keys select, enter activates
  if (sections[currentNav] === 'work-work') {
    if (key === 'ArrowRight' || key === 'KeyD') {
      e.preventDefault();
      highlightProject(Math.min(projectItems.length - 1, highlightedProject + 1));
      return;
    }
    if (key === 'ArrowLeft' || key === 'KeyA') {
      e.preventDefault();
      highlightProject(Math.max(0, highlightedProject - 1));
      return;
    }
    const projNum = key.match(/^Digit(\d)$/);
    if (projNum) {
      const idx = parseInt(projNum[1], 10) - 1;
      if (idx >= 0 && idx < projectItems.length) {
        e.preventDefault();
        highlightProject(idx);
      }
      return;
    }
    if (key === 'Enter' && highlightedProject >= 0) {
      e.preventDefault();
      openProjectModal(parseInt(projectItems[highlightedProject].dataset.project, 10));
      return;
    }
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
const contactItems = Array.from(document.querySelectorAll('.contact-item:not(.project-item)'));
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

// --- Modal System (CV + Project) ---
const cvModal = document.getElementById('cv-modal');
const cvLink = document.querySelector('[data-default="03 cv"]');
const projectModal = document.getElementById('project-modal');
const projectContents = document.querySelectorAll('.project-content');

let activeModalType = null; // 'cv' | 'project' | null
let activeProjectNum = null;

function openCvModal() {
  closeAnyModal();
  cvModal.classList.add('active');
  activeModalType = 'cv';
}

function openProjectModal(num) {
  if (activeModalType === 'project' && activeProjectNum === num) {
    closeAnyModal();
    return;
  }
  closeAnyModal();
  projectContents.forEach(el => {
    el.classList.toggle('active', el.dataset.projectContent === String(num));
  });
  projectModal.classList.add('active');
  activeModalType = 'project';
  activeProjectNum = num;
}

function closeAnyModal() {
  cvModal.classList.remove('active');
  projectModal.classList.remove('active');
  projectContents.forEach(el => el.classList.remove('active'));
  activeModalType = null;
  activeProjectNum = null;
}

function closeModal() {
  closeAnyModal();
}

cvLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (activeModalType === 'cv') closeAnyModal();
  else openCvModal();
});

document.getElementById('cv-close').addEventListener('click', () => closeAnyModal());
document.getElementById('project-close').addEventListener('click', () => closeAnyModal());

contactItems.forEach(item => {
  if (item === cvLink) return;
  item.addEventListener('click', () => { if (activeModalType) closeAnyModal(); });
});

// --- Project Items ---
const projectItems = Array.from(document.querySelectorAll('.project-item'));
let highlightedProject = -1;

function highlightProject(index) {
  highlightedProject = index;
  projectItems.forEach((item, i) => {
    const text = item.querySelector('.contact-text');
    const isActive = i === index;
    item.classList.toggle('highlighted', isActive);
    if (text && item.dataset.hover) {
      text.textContent = isActive ? item.dataset.hover : item.dataset.default;
    }
  });
}

// Project hover text swap
projectItems.forEach(item => {
  if (!item.dataset.hover) return;
  const text = item.querySelector('.contact-text');

  if (isTouchDevice) {
    item.addEventListener('click', (e) => {
      if (primedItem !== item) {
        e.preventDefault();
        if (primedItem) {
          const prevText = primedItem.querySelector('.contact-text');
          prevText.textContent = primedItem.dataset.default;
          primedItem.classList.remove('highlighted');
        }
        text.textContent = item.dataset.hover;
        item.classList.add('highlighted');
        primedItem = item;
      } else {
        text.textContent = item.dataset.default;
        item.classList.remove('highlighted');
        primedItem = null;
        openProjectModal(parseInt(item.dataset.project, 10));
      }
    });
  } else {
    item.addEventListener('mouseenter', () => { text.textContent = item.dataset.hover; });
    item.addEventListener('mouseleave', () => { text.textContent = item.dataset.default; });
    item.addEventListener('click', () => {
      openProjectModal(parseInt(item.dataset.project, 10));
    });
  }
});


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
  if (stickerDragging || activeModalType) return;
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
  return el.closest('button, a, .nav-btn, .contact-item, .sticker, .project-modal, .cv-modal');
}

document.addEventListener('mousedown', (e) => { if (!isInteractive(e.target)) startScribble(e.clientX, e.clientY); });
document.addEventListener('mousemove', (e) => moveScribble(e.clientX, e.clientY));
document.addEventListener('mouseup', endScribble);

document.addEventListener('touchstart', (e) => { if (!isInteractive(e.target)) { e.preventDefault(); startScribble(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
document.addEventListener('touchmove', (e) => { if (scribbling) { e.preventDefault(); moveScribble(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
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
