import JSZip from 'jszip';
import { showToast } from './toast.js';

export class DownloadBuilder {
  constructor(manifest) {
    this.manifest = manifest;
    this.options = {
      format: 'svg',
      strokeWidth: '1.5',
      color: 'currentColor',
      subset: 'all',
    };

    this.init();
  }

  init() {
    // Format toggle
    this.bindToggle('dl-format', (val) => { this.options.format = val; });
    // Stroke toggle
    this.bindToggle('dl-stroke', (val) => { this.options.strokeWidth = val; });
    // Color toggle
    this.bindToggle('dl-color', (val) => {
      this.options.color = val;
      const customInput = document.getElementById('dl-custom-color');
      if (val === 'custom') {
        customInput.hidden = false;
        customInput.focus();
      } else {
        customInput.hidden = true;
      }
    });
    // Subset toggle
    this.bindToggle('dl-subset', (val) => {
      this.options.subset = val;
      this.updateMeta();
    });

    // Custom color input
    const customInput = document.getElementById('dl-custom-color');
    customInput.addEventListener('input', () => {
      this.options.color = customInput.value;
    });

    // Download button
    document.getElementById('download-btn').addEventListener('click', () => {
      this.download();
    });

    this.updateMeta();
  }

  bindToggle(id, onChange) {
    const el = document.getElementById(id);
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      el.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.dataset.value);
    });
  }

  getIcons() {
    if (this.options.subset === 'all') return this.manifest;
    return this.manifest.filter(i => i.category === this.options.subset);
  }

  updateMeta() {
    const count = this.getIcons().length;
    const el = document.getElementById('download-meta');
    if (el) el.textContent = `${count} icons`;
  }

  processSVG(svg) {
    let result = svg;
    if (this.options.strokeWidth) {
      result = result.replace(/stroke-width="[^"]*"/g, `stroke-width="${this.options.strokeWidth}"`);
    }
    if (this.options.color && this.options.color !== 'currentColor') {
      result = result.replace(/stroke="currentColor"/g, `stroke="${this.options.color}"`);
    }
    return result;
  }

  buildSprite(icons) {
    const symbols = icons.map(icon => {
      const inner = icon.svg
        .replace(/<svg[^>]*>/, '')
        .replace(/<\/svg>/, '');
      return `  <symbol id="${icon.slug}" viewBox="0 0 24 24">${inner}</symbol>`;
    }).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols}\n</svg>`;
  }

  async download() {
    const icons = this.getIcons();
    if (icons.length === 0) {
      showToast('No icons to download');
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder('icons');

    if (this.options.format === 'sprite') {
      const sprite = this.buildSprite(icons);
      folder.file('sprite.svg', this.processSVG(sprite));
    } else {
      for (const icon of icons) {
        folder.file(`${icon.slug}.svg`, this.processSVG(icon.svg));
      }
    }

    showToast('Building download...');

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: 'icons.zip',
    });
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${icons.length} icons`);
  }
}
