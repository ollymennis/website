let timeout = null;

export function showToast(message) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = message;
  el.removeAttribute('hidden');
  el.classList.add('show');

  clearTimeout(timeout);
  timeout = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.setAttribute('hidden', ''), 200);
  }, 2000);
}
