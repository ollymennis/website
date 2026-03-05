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

  // Clear project highlight and hide display when leaving work-work
  if (name !== 'work-work') {
    highlightedProject = -1;
    activeProjectNum = null;
    projectItems.forEach(item => item.classList.remove('highlighted'));
    projectDisplay.classList.remove('active');
    projectContents.forEach(el => el.classList.remove('active'));
  }

  if (cvModalOpen) closeCvModal();
  primedItem = null;

  // Enable page scroll when work-work is active (content may be tall)
  document.documentElement.style.overflow = name === 'work-work' ? '' : 'hidden';

  // Stagger stickers out when entering work-work, back in when leaving
  const stickers = document.querySelectorAll('.sticker');
  stickers.forEach((sticker, i) => {
    if (name === 'work-work') {
      sticker.style.transitionDelay = `${i * 60}ms`;
      sticker.classList.add('sticker-out');
    } else {
      sticker.style.transitionDelay = `${i * 40}ms`;
      sticker.classList.remove('sticker-out');
    }
  });

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
  if (cvModalOpen && e.code === 'Escape') {
    closeCvModal();
    return;
  }
  if (cvModalOpen && e.code === 'Space') {
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

  // Work-work: arrow keys cycle projects, number keys switch directly
  if (sections[currentNav] === 'work-work') {
    if (key === 'ArrowRight' || key === 'KeyD') {
      e.preventDefault();
      const nextNum = Math.min(projectItems.length, activeProjectNum + 1);
      switchProject(nextNum);
      return;
    }
    if (key === 'ArrowLeft' || key === 'KeyA') {
      e.preventDefault();
      const prevNum = Math.max(1, activeProjectNum - 1);
      switchProject(prevNum);
      return;
    }
    const num = key.match(/^Digit(\d)$/);
    if (num) {
      const idx = parseInt(num[1], 10);
      if (idx >= 1 && idx <= projectItems.length) {
        e.preventDefault();
        switchProject(idx);
      }
    }
    if (key === 'Enter' && highlightedProject >= 0) {
      e.preventDefault();
      switchProject(highlightedProject + 1);
    }
    return;
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
let cvModalOpen = false;

function openCvModal() {
  cvModal.classList.add('active');
  cvModalOpen = true;
}

function closeCvModal() {
  cvModal.classList.remove('active');
  cvModalOpen = false;
}

cvLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (cvModalOpen) closeCvModal();
  else openCvModal();
});

document.getElementById('cv-close').addEventListener('click', () => closeCvModal());

// --- Project Markdown Loader ---
function parseProjectMd(md) {
  const lines = md.split('\n');
  let title = '';
  let subtitle = '';
  let bodyLines = [];
  let i = 0;

  // First line: # title
  if (lines[i] && lines[i].startsWith('# ')) {
    title = lines[i].slice(2).trim();
    i++;
  }
  // Optional subtitle: _text_ on next non-empty line
  while (i < lines.length && !lines[i].trim()) i++;
  if (lines[i] && /^_(.+)_$/.test(lines[i].trim())) {
    subtitle = lines[i].trim().slice(1, -1);
    i++;
  }
  // Rest is body
  bodyLines = lines.slice(i);

  // Convert body markdown to HTML
  let bodyHtml = '';
  for (const line of bodyLines) {
    const trimmed = line.trim();
    if (!trimmed) { bodyHtml += '\n'; continue; }
    // Pass through HTML tags directly
    if (trimmed.startsWith('<video')) { bodyHtml += `<div class="video-crop">${trimmed}</div>\n`; continue; }
    if (trimmed.startsWith('<')) { bodyHtml += trimmed + '\n'; continue; }
    // h3
    if (trimmed.startsWith('### ')) { bodyHtml += `<h3>${trimmed.slice(4)}</h3>\n`; continue; }
    // Regular paragraph
    bodyHtml += `<p>${trimmed}</p>\n`;
  }

  return { title, subtitle, bodyHtml };
}

const projectMdCache = {};

async function loadProjectMd(el) {
  const mdPath = el.dataset.md;
  if (!mdPath) return;
  if (projectMdCache[mdPath]) {
    el.innerHTML = projectMdCache[mdPath];
    initHoverPreviews(el);
    initLoopAtVideos(el);
    return;
  }
  const md = await fetch(mdPath).then(r => r.text());
  const { title, subtitle, bodyHtml } = parseProjectMd(md);
  const html = `<div class="project-header"><h2>${title}</h2>${subtitle ? `<p class="project-subtitle">${subtitle}</p>` : '<p class="project-subtitle"></p>'}</div><div class="project-body">${bodyHtml}</div>`;
  projectMdCache[mdPath] = html;
  el.innerHTML = html;
  initHoverPreviews(el);
  initLoopAtVideos(el);
}

function initHoverPreviews(el) {
  el.querySelectorAll('.hover-preview[data-preview]').forEach(span => {
    const img = document.createElement('img');
    img.className = 'preview-img';
    img.src = span.dataset.preview;
    span.appendChild(img);
    span.addEventListener('mouseenter', () => {
      img.style.display = 'block';
      const rect = span.getBoundingClientRect();
      const imgW = 700;
      let left = rect.left;
      let top = rect.bottom + 8;
      // Clamp to viewport
      if (left + imgW > window.innerWidth) left = window.innerWidth - imgW - 16;
      if (left < 16) left = 16;
      // If it would overflow bottom, show above
      img.style.left = left + 'px';
      img.style.top = top + 'px';
      requestAnimationFrame(() => {
        const imgRect = img.getBoundingClientRect();
        if (imgRect.bottom > window.innerHeight) {
          img.style.top = (rect.top - imgRect.height - 8) + 'px';
        }
      });
    });
    span.addEventListener('mouseleave', () => {
      img.style.display = 'none';
    });
  });
}

function initLoopAtVideos(el) {
  el.querySelectorAll('video[data-loop-at]').forEach(video => {
    const loopTime = parseFloat(video.dataset.loopAt);
    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= loopTime) {
        video.currentTime = 0;
        video.play();
      }
    });
  });
}

// Preload all project markdown
document.querySelectorAll('.project-content[data-md]').forEach(el => loadProjectMd(el));

// --- Inline Project Display ---
const projectDisplay = document.getElementById('project-display');
const projectContents = document.querySelectorAll('.project-content');
let activeProjectNum = null;

function switchProject(num) {
  activeProjectNum = num;
  projectDisplay.classList.add('active');
  projectContents.forEach(el => el.classList.toggle('active', el.dataset.projectContent === String(num)));
  projectDisplay.scrollTop = 0;
  projectItems.forEach(item => {
    item.classList.toggle('highlighted', item.dataset.project === String(num));
  });
}

// --- Project Items ---
const projectItems = Array.from(document.querySelectorAll('.project-item'));
let highlightedProject = -1;

function highlightProject(index) {
  highlightedProject = index;
  projectItems.forEach((item, i) => {
    item.classList.toggle('highlighted', i === index);
  });
}

projectItems.forEach(item => {
  item.addEventListener('click', () => {
    switchProject(parseInt(item.dataset.project));
  });
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
  if (stickerDragging || cvModalOpen) return;
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
  return el.closest('button, a, .nav-btn, .contact-item, .sticker, .cv-modal, .project-display');
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

// --- Icon Row Animation ---
const iconFiles = [
  'alertOnline','avatar','bankAccount','bankLinked','biometricsFace','biometricsFingerprint',
  'block','botMic','cardActive','cardAdd','cardBasic','cardCredit','cardInactive','cashAppPay',
  'categoryAccessories','categoryAccessoriesHats','categoryApparel','categoryAuto','categoryBar',
  'categoryCafe','categoryDiy','categoryEntertainment','categoryFashion','categoryFoodDrinkAlt',
  'categoryFurniture','categoryGrocery','categoryHome','categoryHomeAuto','categoryKids',
  'categoryRent','categoryShoesHeel','categorySports','categorySportsAlt','categoryTech',
  'categoryTourism','categoryToys','categoryTransportation','categoryTravel','deposit',
  'depositBarcode','depositCheck','depositPaper','discountMaximum','discountMinimum',
  'documentPaystub','documentQuill','fast','fpoShrimp','governmentFlag','hyperlink','idea',
  'instant','international','location','music','next','note','notifications',
  'overdraftProtection','passcodeFill','paychecks','photo','qr','recurringAutomatic',
  'savingsApy','savingsGoal','timeProgressStart','traffic'
];

let iconAnimSlots = null;
let iconAnimPool = [];
let iconInterval = null;

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function swapAllSlots() {
  if (!iconAnimSlots) return;
  const order = iconAnimSlots.map((s, i) => i);
  shuffleArray(order);
  order.forEach((slotIdx, i) => {
    const delay = i * 120 + Math.random() * 80;
    setTimeout(() => {
      if (iconAnimPool.length === 0) {
        iconAnimPool = iconFiles.filter(f => !iconAnimSlots.some(s => s.src.includes(f)));
        shuffleArray(iconAnimPool);
      }
      const slot = iconAnimSlots[slotIdx];
      const oldName = slot.src.split('/').pop().replace('.svg', '');
      const newName = iconAnimPool.pop();
      iconAnimPool.unshift(oldName);
      slot.src = `/media/icons-refresh/${newName}.svg`;
    }, delay);
  });
}

function startIconAnimation() {
  const row = document.getElementById('icon-row');
  if (!row) return;
  iconAnimSlots = Array.from(row.querySelectorAll('img'));
  iconAnimPool = iconFiles.filter(f => !iconAnimSlots.some(s => s.src.includes(f)));
  shuffleArray(iconAnimPool);
  if (iconInterval) return;
  swapAllSlots();
  iconInterval = setInterval(swapAllSlots, 1200);
}

function stopIconAnimation() {
  clearInterval(iconInterval);
  iconInterval = null;
  iconAnimSlots = null;
}

// Hook into switchProject to start/stop animation
const _origSwitchProject = switchProject;
switchProject = function(num) {
  _origSwitchProject(num);
  if (num === 5) startIconAnimation();
  else stopIconAnimation();
};
