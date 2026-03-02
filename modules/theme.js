export class ThemeManager {
  constructor() {
    this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.zoom = 1;

    if (this.dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  toggle() {
    this.dark = !this.dark;
    document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : '');
  }

  zoomIn() {
    this.zoom = Math.min(this.zoom + 0.1, 1.5);
    document.documentElement.style.setProperty('--zoom', this.zoom);
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom - 0.1, 0.7);
    document.documentElement.style.setProperty('--zoom', this.zoom);
  }

  resetZoom() {
    this.zoom = 1;
    document.documentElement.style.setProperty('--zoom', 1);
  }
}
