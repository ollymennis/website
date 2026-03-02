export const MODES = {
  NAVIGATE: 'navigate',
  SEARCH: 'search',
  INSPECT: 'inspect',
};

export class KeyboardController {
  constructor() {
    this.mode = MODES.NAVIGATE;
    this.bindings = {
      [MODES.NAVIGATE]: {},
      [MODES.SEARCH]: {},
      [MODES.INSPECT]: {},
    };

    document.addEventListener('keydown', (e) => this.handle(e));
  }

  setMode(mode) {
    this.mode = mode;
  }

  bind(mode, key, handler) {
    this.bindings[mode][key] = handler;
  }

  handle(e) {
    // Don't intercept if typing in an input (unless Escape)
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (isInput && e.code !== 'Escape' && this.mode !== MODES.SEARCH) return;

    const handler = this.bindings[this.mode]?.[e.code];
    if (handler) {
      // Let the search input handle normal typing
      if (this.mode === MODES.SEARCH && !['Escape', 'ArrowDown', 'ArrowUp', 'Enter'].includes(e.code)) {
        return;
      }
      e.preventDefault();
      handler(e);
    }
  }
}
