// --- Nav / Tab system ---
const navBtns = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.content-panel');

function switchSection(name) {
  navBtns.forEach(btn => {
    const isActive = btn.dataset.section === name;
    btn.classList.toggle('active', isActive);
    btn.querySelector('.nav-indicator').innerHTML = isActive ? '[&minus;]' : '[+]';
    const label = btn.dataset.section;
    btn.dataset.text = isActive ? `[-] ${label}` : `[+] ${label}`;
  });

  panels.forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === name);
  });
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchSection(btn.dataset.section);
  });
});

// --- Work Slides ---
const slides = document.querySelectorAll('.work-slide');
const currentEl = document.getElementById('work-current');
const totalEl = document.getElementById('work-total');
let currentSlide = 0;
let transitioning = false;

totalEl.textContent = slides.length;

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

  currentEl.textContent = currentSlide + 1;
}

function isWorkActive() {
  const workPanel = document.querySelector('[data-panel="work"]');
  return workPanel && workPanel.classList.contains('active');
}

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (!isWorkActive()) return;

  if (e.code === 'ArrowRight') {
    e.preventDefault();
    gotoSlide(currentSlide + 1);
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    gotoSlide(currentSlide - 1);
  }
});
