// --- Measure nav height for mobile sticky stacking ---
const navEl = document.querySelector('.nav');
function updateNavHeight() {
  if (window.innerWidth <= 800) {
    document.documentElement.style.setProperty('--nav-height', navEl.offsetHeight + 'px');
  }
}
updateNavHeight();
window.addEventListener('resize', updateNavHeight);

// --- Nav / Tab system ---
const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
const panels = document.querySelectorAll('.content-panel');
const sections = navBtns.map(btn => btn.dataset.section);
let currentNav = 0;

function switchSection(indexOrName) {
  const index = typeof indexOrName === 'string' ? sections.indexOf(indexOrName) : indexOrName;
  if (index < 0) return;
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

  // Update URL hash
  history.replaceState(null, '', name === 'about' ? location.pathname : '#' + name);

  if (cvModalOpen) closeCvModal();
  primedItem = null;

  // Enable page scroll when work-work is active (content may be tall)
  // On mobile, CSS handles overflow — never set hidden
  if (window.innerWidth > 800) {
    document.documentElement.style.overflow = name === 'work-work' ? '' : 'hidden';
  } else {
    document.documentElement.style.overflow = '';
  }

  // When leaving work-work, bring stickers back in
  if (name !== 'work-work') {
    const stickers = document.querySelectorAll('.sticker');
    stickers.forEach((sticker, i) => {
      sticker.style.transitionDelay = `${i * 40}ms`;
      sticker.classList.remove('sticker-out');
    });
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
  if (e.code === 'Escape') {
    if (lightboxOpen) { closeLightbox(); return; }
    if (activeProjectNum !== null) { closeProjectDisplay(); return; }
    if (cvModalOpen) { closeCvModal(); return; }
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
let emailTimeout = null;
document.getElementById('copy-email').addEventListener('click', () => {
  navigator.clipboard.writeText('ollymennis@gmail.com').catch(() => {});
  const emailText = document.querySelector('#copy-email .contact-text');
  emailText.innerHTML = '01 <span style="opacity: 0.5;">copied ollymennis@gmail.com</span>';
  emailCopied = true;
  clearTimeout(emailTimeout);
  emailTimeout = setTimeout(() => { emailText.textContent = '01 email'; emailCopied = false; }, 3000);
});

// --- Dark mode ---
let darkMode = false;

function toggleDarkMode() {
  darkMode = !darkMode;
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : '');
}

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
  let inCodeBlock = false;
  let codeContent = '';
  let inBulletList = false;
  for (const line of bodyLines) {
    const trimmed = line.trim();
    // Code fence toggle
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeContent = trimmed.slice(3).trim() ? trimmed.slice(3).trim() + '\n' : '';
        // Check for single-line fenced code: ``` text ```
        if (trimmed.endsWith('```') && trimmed.length > 3 && trimmed.slice(3).trim().endsWith('```')) {
          const raw = trimmed.slice(3, trimmed.lastIndexOf('```')).trim();
          bodyHtml += `<pre><code>${raw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>\n`;
          inCodeBlock = false;
          codeContent = '';
        }
      } else {
        bodyHtml += `<pre><code>${codeContent.trimEnd().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>\n`;
        inCodeBlock = false;
        codeContent = '';
      }
      continue;
    }
    if (inCodeBlock) { codeContent += line + '\n'; continue; }
    if (!trimmed) { if (inBulletList) { bodyHtml += '</ul>\n'; inBulletList = false; } bodyHtml += '\n'; continue; }
    // Pass through HTML tags directly
    if (trimmed.startsWith('<video')) { bodyHtml += `<div class="video-crop">${trimmed}</div>\n`; continue; }
    if (trimmed.startsWith('<!--')) { bodyHtml += trimmed + '\n'; continue; }
    if (trimmed.startsWith('<') && /^<(div|img|hr|blockquote|pre|table|ul|ol|li|iframe|figure|section|aside|nav|header|footer)\b/i.test(trimmed)) { bodyHtml += trimmed + '\n'; continue; }
    // h2 and h3 (check h3 first since ### also starts with ##)
    if (trimmed.startsWith('### ')) { bodyHtml += `<h3>${inlineMd(trimmed.slice(4))}</h3>\n`; continue; }
    if (trimmed.startsWith('## ')) { bodyHtml += `<h2>${inlineMd(trimmed.slice(3))}</h2>\n`; continue; }
    // Bullet lists (+ or →)
    if (trimmed.startsWith('+ ') || trimmed.startsWith('→')) {
      const text = trimmed.startsWith('+ ') ? trimmed.slice(2) : trimmed.slice(1).trim();
      const marker = trimmed[0];
      if (!inBulletList) { bodyHtml += `<ul class="bullet-list">`; inBulletList = true; }
      bodyHtml += `<li><span class="bullet-marker">${marker}</span>${inlineMd(text)}</li>\n`;
      continue;
    }
    if (inBulletList) { bodyHtml += '</ul>\n'; inBulletList = false; }
    // Blockquote
    if (trimmed.startsWith('>')) { bodyHtml += `<blockquote><p>${inlineMd(trimmed.slice(1).trim())}</p></blockquote>\n`; continue; }
    // Regular paragraph
    bodyHtml += `<p>${inlineMd(trimmed)}</p>\n`;
  }
  if (inBulletList) { bodyHtml += '</ul>\n'; }
  if (inCodeBlock) { bodyHtml += `<pre><code>${codeContent.trimEnd().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>\n`; }

  return { title, subtitle, bodyHtml };
}

function inlineMd(text) {
  return text
    .replace(/`([^`]+)`/g, (_, code) => `<code>${code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>');
}

const projectMdCache = {};

async function loadProjectMd(el) {
  const mdPath = el.dataset.md;
  if (!mdPath) return;
  if (projectMdCache[mdPath]) {
    el.innerHTML = projectMdCache[mdPath];
    initHoverPreviews(el);
    initHoverIcons(el);
    initLoopAtVideos(el);
    observeVideos(el);
    initIconSpecimen(el);
    initSvgGridDemo(el);
    initBezierDemo(el);
    initPathLabelDemo(el);
    initGenDemo(el);
    initIconIntroRow(el);
    return;
  }
  const resp = await fetch(mdPath);
  if (!resp.ok) return;
  const md = await resp.text();
  const { title, subtitle, bodyHtml } = parseProjectMd(md);
  const html = `<div class="project-header"><h2>${title}</h2>${subtitle ? `<p class="project-subtitle">${subtitle}</p>` : '<p class="project-subtitle"></p>'}</div><div class="project-body">${bodyHtml}</div>`;
  projectMdCache[mdPath] = html;
  el.innerHTML = html;
  initHoverPreviews(el);
  initHoverIcons(el);
  initLoopAtVideos(el);
  observeVideos(el);
  initIconSpecimen(el);
  initSvgGridDemo(el);
  initBezierDemo(el);
  initPathLabelDemo(el);
  initGenDemo(el);
  initIconIntroRow(el);
}

function initHoverIcons(el) {
  el.querySelectorAll('.hover-icon[data-icon]').forEach(span => {
    const img = document.createElement('img');
    img.className = 'hover-icon-img';
    img.src = span.dataset.icon;
    if (span.dataset.iconWidth) img.style.width = span.dataset.iconWidth;
    span.appendChild(img);
    span.addEventListener('mouseenter', (e) => {
      img.style.display = 'block';
      img.style.left = e.clientX + 'px';
      img.style.top = (e.clientY - img.offsetHeight - 8) + 'px';
    });
    span.addEventListener('mousemove', (e) => {
      img.style.left = e.clientX + 'px';
      img.style.top = (e.clientY - img.offsetHeight - 8) + 'px';
    });
    span.addEventListener('mouseleave', () => {
      img.style.display = 'none';
    });
  });
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
  el.querySelectorAll('video[data-playback-rate]').forEach(video => {
    video.playbackRate = parseFloat(video.dataset.playbackRate);
  });
  el.querySelectorAll('video[data-loop-at], video[data-start-at]').forEach(video => {
    const startTime = parseFloat(video.dataset.startAt) || 0;
    const loopTime = parseFloat(video.dataset.loopAt) || Infinity;
    if (startTime) video.currentTime = startTime;
    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= loopTime) {
        video.currentTime = startTime;
        video.play();
      }
    });
  });
}

// --- Icon Specimen Viewer ---
const specimenCategories = {
  'identity': ['avatar', 'biometricsFace', 'biometricsFingerprint', 'passcodeFill'],
  'banking': ['bankAccount', 'bankLinked', 'cashAppPay', 'overdraftProtection'],
  'cards': ['cardActive', 'cardAdd', 'cardBasic', 'cardCredit', 'cardInactive'],
  'spending': [
    'categoryAccessories', 'categoryAccessoriesHats', 'categoryApparel', 'categoryAuto',
    'categoryBar', 'categoryCafe', 'categoryDiy', 'categoryEntertainment', 'categoryFashion',
    'categoryFoodDrinkAlt', 'categoryFurniture', 'categoryGrocery', 'categoryHome',
    'categoryHomeAuto', 'categoryKids', 'categoryRent', 'categoryShoesHeel', 'categorySports',
    'categorySportsAlt', 'categoryTech', 'categoryTourism', 'categoryToys',
    'categoryTransportation', 'categoryTravel'
  ],
  'deposits': ['deposit', 'depositBarcode', 'depositCheck', 'depositPaper'],
  'documents': ['documentPaystub', 'documentQuill'],
  'savings': ['discountMaximum', 'discountMinimum', 'paychecks', 'recurringAutomatic', 'savingsApy', 'savingsGoal'],
  'general': [
    'block', 'botMic', 'fast', 'fpoShrimp', 'governmentFlag', 'hyperlink', 'idea',
    'instant', 'international', 'location', 'music', 'next', 'note', 'notifications',
    'photo', 'qr', 'timeProgressStart', 'traffic'
  ]
};

function initIconIntroRow(el) {
  el.querySelectorAll('.icon-intro-row').forEach(row => {
    if (row.dataset.initialized) return;
    row.dataset.initialized = '1';
    const basePath = '/media/icons-refresh/';
    const allNames = iconFiles.slice();
    const slots = Array.from(row.querySelectorAll('img'));
    let pool = [];
    function refill() {
      pool = allNames.filter(n => !slots.some(s => s.src.includes(n)));
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
    }
    function swapOne() {
      if (pool.length === 0) refill();
      const idx = Math.floor(Math.random() * slots.length);
      slots[idx].src = basePath + pool.pop() + '.svg';
    }
    refill();
    setInterval(swapOne, 150);
  });
}

function initGenDemo(el) {
  el.querySelectorAll('.gen-demo').forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    const svg = container.querySelector('svg');
    const loadingG = svg.querySelector('.gen-loading');
    const resultG = svg.querySelector('.gen-result');
    const codeOut = container.querySelector('.gen-code-output');
    if (!svg || !loadingG || !resultG) return;

    const LOADING_PATH = [
      [0, 0], [1, 0], [2, 0], [3, 0],
      [3, 1], [2, 1], [1, 1], [0, 1],
      [0, 2], [1, 2], [2, 2], [3, 2],
      [3, 3], [2, 3], [1, 3], [0, 3],
      [0, 2], [1, 2], [2, 2], [3, 2],
      [3, 1], [2, 1], [1, 1], [0, 1],
    ];
    const OX = 10, OY = 10;
    let interval = null;
    let codeInterval = null;
    let running = false;

    const SVG_META = [
      { file: 'palm-tree', labels: ['trunk', 'left-lower-frond', 'right-lower-frond', 'left-upper-frond', 'right-upper-frond', 'left-mid-frond', 'right-mid-frond'] },
      { file: 'trash can', labels: ['handle', 'lid', 'can', 'lines'] },
      { file: 'bike-better', name: 'bicycle', labels: ['back-wheel', 'front-wheel', 'frame', 'seat', 'fork', 'center-hub', 'rear-hub'] },
      { file: 'constitution', labels: ['scroll', 'text', 'seal'] },
      { file: 'seattle', labels: ['observation-deck', 'spire', 'shaft', 'base'] },
      { file: 'singapore', labels: ['skypark', 'towers', 'waterline'] },
      { file: 'cairo', labels: ['pyramid', 'horizon', 'sun'] },
      { file: 'guadalajara', labels: ['left-tower', 'right-tower', 'dome', 'cross', 'doorway'] },
      { file: 'cheeseburger', labels: ['top-bun', 'lettuce', 'patty', 'bottom-bun'] },
      { file: 'christmas light', labels: ['wire', 'cord', 'base', 'bulb'] },
      { file: 'coiled snake', labels: ['coil', 'head'] },
      { file: 'los angeles', labels: ['fronds', 'trunk'] },
    ];

    function formatSvgCode(svgText, labels) {
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const paths = doc.querySelectorAll('path');
      let code = '<svg viewBox="0 0 24 24" fill="none">\n';
      paths.forEach((p, i) => {
        code += '  <!-- ' + (labels[i] || 'path-' + (i + 1)) + ' -->\n';
        code += '  <path d="' + p.getAttribute('d') + '"\n';
        const fill = p.getAttribute('fill');
        if (fill && fill !== 'none') code += '    fill="' + fill + '"\n';
        code += '    stroke="#FF00FF" stroke-width="2"\n';
        code += '    stroke-linejoin="round"/>\n';
      });
      code += '</svg>';
      return code;
    }

    function parseSvgPaths(svgText, labels) {
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      return Array.from(doc.querySelectorAll('path')).map((p, i) => {
        const result = { label: labels[i] || 'path-' + (i + 1), d: p.getAttribute('d') };
        if (p.getAttribute('fill') === '#FF00FF') result.fill = '#FF00FF';
        return result;
      });
    }

    let QUEUE = [];
    let queueIdx = 0;
    let SVG_CODE = '';

    Promise.all(SVG_META.map(meta =>
      fetch('/media/svg maker/decent/' + encodeURIComponent(meta.file) + '.svg')
        .then(r => r.text())
        .then(text => ({
          name: meta.name || meta.file.replace(/-/g, ' '),
          code: formatSvgCode(text, meta.labels),
          paths: parseSvgPaths(text, meta.labels),
        }))
        .catch(() => null)
    )).then(results => {
      QUEUE = results.filter(Boolean);
      if (QUEUE.length) {
        SVG_CODE = QUEUE[0].code;
        const promptLabel = container.querySelector('[style*="margin-bottom"]');
        if (promptLabel) promptLabel.textContent = 'click to generate "' + QUEUE[0].name + '"';
      }
    });

    function startStreaming(duration) {
      if (!codeOut) return;
      const pre = codeOut.parentElement;
      codeOut.textContent = '';
      if (pre) pre.scrollTop = 0;
      let charIdx = 0;
      const charsPerTick = 2;
      const totalTicks = Math.ceil(SVG_CODE.length / charsPerTick);
      const tickMs = duration / totalTicks;
      codeInterval = setInterval(() => {
        const end = Math.min(charIdx + charsPerTick, SVG_CODE.length);
        codeOut.textContent += SVG_CODE.slice(charIdx, end);
        charIdx = end;
        if (pre) pre.scrollTop = pre.scrollHeight;
        if (charIdx >= SVG_CODE.length) clearInterval(codeInterval);
      }, tickMs);
    }

    function stopStreaming() {
      clearInterval(codeInterval);
      codeInterval = null;
    }

    function startLoading() {
      if (running) return;
      running = true;
      resultG.style.display = 'none';
      loadingG.style.display = '';
      if (codeOut) codeOut.textContent = '';
      let idx = 0;
      let trail = [];
      interval = setInterval(() => {
        trail = [idx, ...trail].slice(0, 10);
        idx = (idx + 1) % LOADING_PATH.length;
        let html = '';
        for (let i = 0; i < trail.length; i++) {
          const [tx, ty] = LOADING_PATH[trail[i]];
          const op = 0.6 - (i * 0.06);
          if (op <= 0) continue;
          html += `<rect x="${OX + tx}" y="${OY + ty}" width="1" height="1" fill="#FF00FF" opacity="${op}"/>`;
        }
        const [cx, cy] = LOADING_PATH[idx];
        html += `<rect x="${OX + cx}" y="${OY + cy}" width="1" height="1" fill="#FF00FF" opacity="1"/>`;
        loadingG.innerHTML = html;
      }, 120);
    }

    function stopLoading() {
      clearInterval(interval);
      interval = null;
      loadingG.style.display = 'none';
      loadingG.innerHTML = '';
    }

    function buildPathsHTML(pathData) {
      return pathData.map(p => {
        const fill = p.fill ? ` fill="${p.fill}"` : ' fill="none"';
        return `<g class="pl-path" data-label="${p.label}"><path d="${p.d}" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round"${fill} class="pl-magenta"/><path d="${p.d}" stroke="#009CFF" stroke-width="0.12" stroke-linejoin="round" fill="none"/></g>`;
      }).join('');
    }

    function showResult() {
      stopLoading();
      stopStreaming();
      const item = QUEUE[queueIdx];
      if (item.paths) {
        resultG.innerHTML = buildPathsHTML(item.paths);
      }
      if (codeOut) {
        codeOut.textContent = SVG_CODE;
        const pre = codeOut.parentElement;
        if (pre) pre.scrollTo({ top: 0, behavior: 'smooth' });
      }
      resultG.style.display = '';
      // Re-hide blue indicator paths on new content
      resultG.querySelectorAll('.pl-path path:nth-child(2)').forEach(bp => { bp.style.opacity = '0'; });
      running = false;
      // Update caption to next prompt and auto-queue
      queueIdx = (queueIdx + 1) % QUEUE.length;
      const promptLabel = container.querySelector('[style*="margin-bottom"]');
      if (promptLabel) promptLabel.textContent = `click to generate "${QUEUE[queueIdx].name}"`;
    }

    function generateNext() {
      if (running || !QUEUE.length) return;
      const item = QUEUE[queueIdx];
      SVG_CODE = item.code;
      const delay = 4000 + Math.random() * 2000;
      startLoading();
      startStreaming(delay);
      setTimeout(showResult, delay);
    }

    container.addEventListener('click', () => {
      if (running || !QUEUE.length) return;
      generateNext();
    });
  });
}

function initPathLabelDemo(el) {
  el.querySelectorAll('.path-label-demo').forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    const paths = container.querySelectorAll('.pl-path');
    const label = container.querySelector('.pl-label');
    if (!paths.length || !label) return;
    // Hide blue indicator paths by default
    paths.forEach(p => {
      p.style.cursor = 'pointer';
      p.querySelectorAll('path:nth-child(2)').forEach(bp => { bp.style.opacity = '0'; });
    });
    const svg = container.querySelector('svg');
    if (!svg) return;
    svg.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      label.style.left = (e.clientX - rect.left + 12) + 'px';
      label.style.top = (e.clientY - rect.top + 12) + 'px';
      const els = document.elementsFromPoint(e.clientX, e.clientY);
      let hoveredPath = null;
      for (const el of els) {
        const g = el.closest('.pl-path');
        if (g && container.contains(g)) { hoveredPath = g; break; }
      }
      const currentPaths = container.querySelectorAll('.pl-path');
      currentPaths.forEach(p => {
        p.style.opacity = hoveredPath ? (p === hoveredPath ? '1' : '0.15') : '1';
        p.querySelectorAll('.pl-magenta').forEach(m => { m.style.mixBlendMode = hoveredPath && p === hoveredPath ? 'multiply' : ''; });
        p.querySelectorAll('path:nth-child(2)').forEach(bp => { bp.style.opacity = hoveredPath && p === hoveredPath ? '1' : '0'; });
      });
      if (hoveredPath) {
        label.textContent = hoveredPath.dataset.label;
        label.style.opacity = '1';
      } else {
        label.style.opacity = '0';
      }
    });
    svg.addEventListener('mouseleave', () => {
      const currentPaths = container.querySelectorAll('.pl-path');
      currentPaths.forEach(p => {
        p.style.opacity = '1';
        p.querySelectorAll('.pl-magenta').forEach(m => { m.style.mixBlendMode = ''; });
        p.querySelectorAll('path:nth-child(2)').forEach(bp => { bp.style.opacity = '0'; });
      });
      label.style.opacity = '0';
    });
  });
}

function initBezierDemo(el) {
  el.querySelectorAll('.bezier-demo').forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    const svg = container.querySelector('svg');
    if (!svg) return;
    const curve = svg.querySelector('.bz-curve');
    const handle1 = svg.querySelector('.bz-handle1');
    const handle2 = svg.querySelector('.bz-handle2');
    const cp1 = svg.querySelector('.bz-cp1');
    const cp2 = svg.querySelector('.bz-cp2');
    const labelCp1 = svg.querySelector('.bz-label-cp1');
    const labelCp2 = svg.querySelector('.bz-label-cp2');
    const curveFill = svg.querySelector('.bz-curve-fill');
    const cmd = svg.querySelector('.bz-cmd');
    if (!curve || !cp1 || !cp2) return;

    const p0 = { x: 4, y: 20 };
    const p1 = { x: 20, y: 4 };
    let c1 = { x: 4, y: 8 };
    let c2 = { x: 20, y: 16 };
    let dragging = null;

    function update() {
      const d = `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`;
      curve.setAttribute('d', d);
      if (curveFill) curveFill.setAttribute('d', d);
      handle1.setAttribute('x2', c1.x); handle1.setAttribute('y2', c1.y);
      handle2.setAttribute('x2', c2.x); handle2.setAttribute('y2', c2.y);
      const s = 0.4;
      cp1.setAttribute('d', `M ${c1.x} ${c1.y-s} L ${c1.x+s} ${c1.y} L ${c1.x} ${c1.y+s} L ${c1.x-s} ${c1.y} Z`);
      cp2.setAttribute('d', `M ${c2.x} ${c2.y-s} L ${c2.x+s} ${c2.y} L ${c2.x} ${c2.y+s} L ${c2.x-s} ${c2.y} Z`);
      if (labelCp1) { labelCp1.setAttribute('x', c1.x - 1.8); labelCp1.setAttribute('y', c1.y - 1); }
      if (labelCp2) { labelCp2.setAttribute('x', c2.x + 0.8); labelCp2.setAttribute('y', c2.y - 1); }
      if (cmd) cmd.textContent = `C ${Math.round(c1.x)} ${Math.round(c1.y)}, ${Math.round(c2.x)} ${Math.round(c2.y)}, ${p1.x} ${p1.y}`;
    }

    function toSvgCoords(e) {
      const rect = svg.getBoundingClientRect();
      return {
        x: Math.round(((e.clientX - rect.left) / rect.width) * 25),
        y: Math.round(((e.clientY - rect.top) / rect.height) * 25)
      };
    }

    function onDown(target) {
      return e => { e.preventDefault(); dragging = target; cp1.style.cursor = cp2.style.cursor = 'grabbing'; };
    }
    cp1.addEventListener('pointerdown', onDown(c1));
    cp2.addEventListener('pointerdown', onDown(c2));

    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const pos = toSvgCoords(e);
      dragging.x = Math.max(0, Math.min(25, pos.x));
      dragging.y = Math.max(0, Math.min(25, pos.y));
      update();
    });
    window.addEventListener('pointerup', () => {
      if (dragging) { dragging = null; cp1.style.cursor = cp2.style.cursor = 'grab'; }
    });
  });
}

function initSvgGridDemo(el) {
  el.querySelectorAll('.svg-grid-demo').forEach(container => {
    if (container.dataset.initialized) return;
    container.dataset.initialized = 'true';
    const svg = container.querySelector('svg');
    const coord = container.querySelector('.svg-grid-coord');
    const dot = container.querySelector('.svg-grid-dot');
    if (!svg || !coord) return;
    const plPaths = container.querySelectorAll('.pl-path');
    // Hide blue indicator paths on init
    plPaths.forEach(p => {
      p.querySelectorAll('path:nth-child(2)').forEach(bp => { bp.style.opacity = '0'; });
    });
    // Find paired code block
    const codeBlock = container.parentElement && container.parentElement.querySelector('pre code');
    const codeSpans = codeBlock ? codeBlock.querySelectorAll('[data-path-code]') : [];
    container.addEventListener('mousemove', e => {
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 24;
      const y = ((e.clientY - rect.top) / rect.height) * 24;
      const rx = Math.round(x);
      const ry = Math.round(y);
      // Detect hovered path
      let hoveredPath = null;
      if (plPaths.length) {
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        for (const el of els) {
          const g = el.closest('.pl-path');
          if (g) { hoveredPath = g; break; }
        }
      }
      coord.textContent = `(${rx}, ${ry})`;
      const cRect = container.getBoundingClientRect();
      if (dot) {
        dot.style.display = 'block';
        dot.style.left = (rect.left - cRect.left + rx / 24 * rect.width) + 'px';
        dot.style.top = (rect.top - cRect.top + ry / 24 * rect.height) + 'px';
      }
      if (plPaths.length) {
        plPaths.forEach(p => {
          p.style.opacity = hoveredPath ? (p === hoveredPath ? '1' : '0.15') : '1';
          p.querySelectorAll('path:nth-child(2)').forEach(bp => { bp.style.opacity = hoveredPath && p === hoveredPath ? '1' : '0'; });
        });
        codeSpans.forEach(s => {
          s.style.opacity = hoveredPath ? (s.dataset.pathCode === hoveredPath.dataset.label ? '1' : '0.25') : '1';
        });
      }
      coord.style.position = 'absolute';
      coord.style.display = 'block';
      coord.style.left = (e.clientX - cRect.left + 12) + 'px';
      coord.style.top = (e.clientY - cRect.top + 12) + 'px';
      coord.style.right = 'auto';
    });
    container.addEventListener('mouseleave', () => {
      coord.textContent = '';
      coord.style.display = 'none';
      if (dot) dot.style.display = 'none';
      if (plPaths.length) {
        plPaths.forEach(p => {
          p.style.opacity = '1';
          p.querySelectorAll('path:nth-child(2)').forEach(bp => { bp.style.opacity = '0'; });
        });
        codeSpans.forEach(s => { s.style.opacity = '1'; });
      }
    });
  });
}

function initIconSpecimen(el) {
  const container = el.querySelector('#icon-specimen');
  if (!container) return;
  const body = container.querySelector('#specimen-body');
  if (!body || body.dataset.initialized) return;
  body.dataset.initialized = 'true';

  // Build categorized grid
  for (const [category, icons] of Object.entries(specimenCategories)) {
    const section = document.createElement('div');
    section.className = 'specimen-section';

    const title = document.createElement('div');
    title.className = 'specimen-section-title';
    title.textContent = category;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'specimen-grid';

    for (const name of icons) {
      const item = document.createElement('div');
      item.className = 'specimen-icon';

      const img = document.createElement('img');
      img.src = `/media/icons-refresh/${name}.svg`;
      img.alt = name;
      item.appendChild(img);

      const label = document.createElement('span');
      label.className = 'specimen-icon-label';
      // Convert camelCase to readable: categoryFoodDrinkAlt → food drink alt
      label.textContent = name
        .replace(/^category/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      item.appendChild(label);

      grid.appendChild(item);
    }

    section.appendChild(grid);
    body.appendChild(section);
  }

  // Size controls
  const buttons = container.querySelectorAll('.specimen-size-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.style.setProperty('--specimen-size', btn.dataset.size + 'px');
    });
  });
}

// --- Play videos only when in view ---
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.play().catch(() => {});
    } else {
      entry.target.pause();
    }
  });
}, { threshold: 0.25 });

function observeVideos(el) {
  el.querySelectorAll('video[autoplay]').forEach(video => {
    video.autoplay = false;
    video.pause();
    videoObserver.observe(video);
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

  // Stagger stickers out when opening a project
  const stickers = document.querySelectorAll('.sticker');
  stickers.forEach((sticker, i) => {
    sticker.style.transitionDelay = `${i * 60}ms`;
    sticker.classList.add('sticker-out');
  });
  projectContents.forEach(el => el.classList.toggle('active', el.dataset.projectContent === String(num)));
  projectItems.forEach(item => {
    item.classList.toggle('highlighted', item.dataset.project === String(num));
  });
  projectDisplay.scrollTop = 0;

  // Update URL hash
  const activeItem = projectItems.find(item => item.dataset.project === String(num));
  if (activeItem && activeItem.dataset.slug) {
    history.replaceState(null, '', '#' + activeItem.dataset.slug);
  }
}

function closeProjectDisplay() {
  projectDisplay.classList.remove('active');

  // Stagger stickers back in when closing a project
  const stickers = document.querySelectorAll('.sticker');
  stickers.forEach((sticker, i) => {
    sticker.style.transitionDelay = `${i * 40}ms`;
    sticker.classList.remove('sticker-out');
  });
  projectContents.forEach(el => el.classList.remove('active'));
  highlightedProject = -1;
  activeProjectNum = null;
  projectItems.forEach(item => item.classList.remove('highlighted'));
  history.replaceState(null, '', '#work-work');
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

document.getElementById('project-display-close').addEventListener('click', closeProjectDisplay);

// --- Handle URL hash for deep linking ---
function handleHash() {
  if (!location.hash) return;
  const slug = location.hash.slice(1);
  // Check sections first
  if (sections.includes(slug)) {
    switchSection(slug);
    return;
  }
  // Then check projects
  const match = projectItems.find(item => item.dataset.slug === slug);
  if (match) {
    switchSection('work-work');
    switchProject(parseInt(match.dataset.project));
  }
}
handleHash();
window.addEventListener('hashchange', handleHash);

// --- Load CV from markdown ---
fetch('/cv/cv.md')
  .then(r => { if (!r.ok) throw new Error(); return r.text(); })
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
  })
  .catch(() => {});

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
  if (window.innerWidth <= 800) return;
  if (stickerDragging || cvModalOpen || activeProjectNum !== null || lightboxOpen) return;
  scribbling = true;
  document.body.classList.add('drawing');
  strokes.push({ points: [{ x, y }], endTime: null });
  startScribbleLoop();
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
  if (strokes.length > 0) {
    requestAnimationFrame(renderScribble);
  } else {
    scribbleAnimating = false;
  }
}
let scribbleAnimating = false;
function startScribbleLoop() {
  if (!scribbleAnimating) {
    scribbleAnimating = true;
    requestAnimationFrame(renderScribble);
  }
}

// --- Icon Row Animation ---
const iconFiles = [
  'avatar','bankAccount','bankLinked','biometricsFace','biometricsFingerprint',
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
  if (num === 7) startIconAnimation();
  else stopIconAnimation();
};

// --- Media Lightbox ---
const lightbox = document.getElementById('media-lightbox');
let lightboxOpen = false;

function openLightbox(el) {
  const clone = el.cloneNode(true);
  clone.style = '';
  clone.className = '';
  clone.removeAttribute('class');
  if (clone.tagName === 'VIDEO') {
    clone.muted = true;
    clone.autoplay = true;
    clone.loop = true;
    clone.playsInline = true;
  }
  lightbox.innerHTML = '';
  lightbox.appendChild(clone);
  lightbox.classList.add('active');
  lightboxOpen = true;
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.innerHTML = '';
  lightboxOpen = false;
}

lightbox.addEventListener('click', closeLightbox);

projectDisplay.addEventListener('click', (e) => {
  const media = e.target.closest('.project-body img, .project-body video');
  if (!media) return;
  if (media.closest('.media-fixed') || media.classList.contains('media-fixed')) return;
  openLightbox(media);
});
