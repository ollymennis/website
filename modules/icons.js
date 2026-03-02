import { showToast } from './toast.js';

export class IconExplorer {
  constructor(manifest, onModeChange) {
    this.all = manifest;
    this.filtered = manifest;
    this.selected = null;
    this.selectedIndex = -1;
    this.query = '';
    this.activeCategory = 'all';
    this.onModeChange = onModeChange;

    this.grid = document.getElementById('icon-grid');
    this.searchInput = document.getElementById('icon-search');
    this.countEl = document.getElementById('icon-count');
    this.filtersEl = document.getElementById('category-filters');
    this.detailEl = document.getElementById('icon-detail');
    this.detailPreview = document.getElementById('icon-detail-preview');
    this.detailName = document.getElementById('icon-detail-name');
    this.detailMeta = document.getElementById('icon-detail-meta');
    this.detailCode = document.getElementById('icon-detail-code');

    this.init();
  }

  init() {
    // Build category filters
    const categories = ['all', ...new Set(this.all.map(i => i.category))];
    this.filtersEl.innerHTML = categories.map(cat =>
      `<button class="category-btn${cat === 'all' ? ' active' : ''}" data-category="${cat}">${cat}</button>`
    ).join('');

    this.filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      this.setCategory(btn.dataset.category);
      this.filtersEl.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });

    // Search input
    this.searchInput.addEventListener('input', () => {
      this.search(this.searchInput.value);
    });

    // Grid clicks
    this.grid.addEventListener('click', (e) => {
      const cell = e.target.closest('.icon-cell');
      if (!cell) return;
      const slug = cell.dataset.slug;
      const icon = this.all.find(i => i.slug === slug);
      if (icon) this.select(icon);
    });

    // Detail panel buttons
    document.getElementById('icon-copy-svg').addEventListener('click', () => {
      if (this.selected) this.copyToClipboard(this.selected, 'svg');
    });
    document.getElementById('icon-copy-name').addEventListener('click', () => {
      if (this.selected) this.copyToClipboard(this.selected, 'name');
    });
    document.getElementById('icon-download').addEventListener('click', () => {
      if (this.selected) this.downloadSVG(this.selected);
    });
    document.getElementById('icon-detail-close').addEventListener('click', () => {
      this.closeSelected();
    });

    this.render();
  }

  search(query) {
    this.query = query.toLowerCase();
    this.filter();
  }

  setCategory(cat) {
    this.activeCategory = cat;
    this.filter();
  }

  filter() {
    this.filtered = this.all.filter(icon => {
      const matchesQuery = !this.query ||
        icon.name.includes(this.query) ||
        icon.slug.includes(this.query) ||
        icon.tags.some(t => t.includes(this.query));
      const matchesCat = this.activeCategory === 'all' ||
        icon.category === this.activeCategory;
      return matchesQuery && matchesCat;
    });
    this.render();
  }

  select(icon) {
    this.selected = icon;
    this.selectedIndex = this.filtered.indexOf(icon);
    this.onModeChange('inspect');

    // Highlight in grid
    this.grid.querySelectorAll('.icon-cell').forEach(el => el.classList.remove('selected'));
    const cell = this.grid.querySelector(`[data-slug="${icon.slug}"]`);
    if (cell) cell.classList.add('selected');

    // Fill detail panel
    this.detailPreview.innerHTML = icon.svg;
    this.detailName.textContent = icon.name;
    this.detailMeta.textContent = `${icon.category} · ${icon.tags.join(', ')}`;
    this.detailCode.textContent = icon.svg;

    this.detailEl.classList.add('open');
  }

  closeSelected() {
    this.selected = null;
    this.selectedIndex = -1;
    this.detailEl.classList.remove('open');
    this.grid.querySelectorAll('.icon-cell').forEach(el => el.classList.remove('selected'));
    this.onModeChange('navigate');
  }

  nextIcon() {
    if (this.filtered.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.filtered.length;
    this.select(this.filtered[this.selectedIndex]);
  }

  prevIcon() {
    if (this.filtered.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.filtered.length) % this.filtered.length;
    this.select(this.filtered[this.selectedIndex]);
  }

  selectNext() {
    if (this.filtered.length === 0) return;
    const next = Math.min(this.selectedIndex + 1, this.filtered.length - 1);
    const icon = this.filtered[next];
    this.selectedIndex = next;

    this.grid.querySelectorAll('.icon-cell').forEach(el => el.classList.remove('selected'));
    const cell = this.grid.querySelector(`[data-slug="${icon.slug}"]`);
    if (cell) {
      cell.classList.add('selected');
      cell.scrollIntoView({ block: 'nearest' });
    }
  }

  selectPrev() {
    if (this.filtered.length === 0) return;
    const prev = Math.max(this.selectedIndex - 1, 0);
    const icon = this.filtered[prev];
    this.selectedIndex = prev;

    this.grid.querySelectorAll('.icon-cell').forEach(el => el.classList.remove('selected'));
    const cell = this.grid.querySelector(`[data-slug="${icon.slug}"]`);
    if (cell) {
      cell.classList.add('selected');
      cell.scrollIntoView({ block: 'nearest' });
    }
  }

  openSelected() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filtered.length) {
      this.select(this.filtered[this.selectedIndex]);
    }
  }

  async copyToClipboard(icon, format) {
    const text = format === 'svg' ? icon.svg : icon.name;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${format === 'svg' ? 'SVG' : 'name'} to clipboard`);
    } catch {
      showToast('Copy failed — check permissions');
    }
  }

  downloadSVG(icon) {
    const blob = new Blob([icon.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `${icon.name}.svg`
    });
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${icon.name}.svg`);
  }

  render() {
    this.grid.innerHTML = this.filtered.map(icon => `
      <button class="icon-cell" data-slug="${icon.slug}" title="${icon.name}">
        ${icon.svg}
        <span class="icon-label">${icon.name}</span>
      </button>
    `).join('');
    this.countEl.textContent = `${this.filtered.length} icons`;
  }
}
