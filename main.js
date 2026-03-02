// --- Accordion ---
const toggles = document.querySelectorAll('.accordion-toggle');

toggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const item = toggle.parentElement;
    const content = item.querySelector('.accordion-content');
    const indicator = toggle.querySelector('.accordion-indicator');
    const isOpen = content.classList.contains('open');

    if (isOpen) {
      content.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      indicator.innerHTML = '[+]';
    } else {
      content.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      indicator.innerHTML = '[&minus;]';
    }
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

function isWorkOpen() {
  const workContent = document.querySelector('[data-section="work"] .accordion-content');
  return workContent && workContent.classList.contains('open');
}

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (!isWorkOpen()) return;

  if (e.code === 'ArrowRight') {
    e.preventDefault();
    gotoSlide(currentSlide + 1);
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    gotoSlide(currentSlide - 1);
  }
});
