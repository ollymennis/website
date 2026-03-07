import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

let cssText;
let htmlText;

beforeAll(() => {
  cssText = readFileSync(resolve(__dirname, '../style.css'), 'utf-8');
  htmlText = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
});

describe('CSS custom properties', () => {
  const vars = ['--bg', '--fg', '--fg-muted', '--border', '--surface', '--mono'];

  vars.forEach(v => {
    it(`defines ${v} in :root`, () => {
      expect(cssText).toMatch(new RegExp(`${v.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*:`));
    });
  });
});

describe('dark mode overrides', () => {
  it('overrides all custom properties in [data-theme="dark"]', () => {
    // Extract the dark theme block
    const darkMatch = cssText.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/);
    expect(darkMatch).not.toBeNull();
    const darkBlock = darkMatch[1];
    const colorVars = ['--bg', '--fg', '--fg-muted', '--border', '--surface'];
    colorVars.forEach(v => {
      expect(darkBlock).toContain(v);
    });
  });
});

describe('font-face declarations', () => {
  it('declares Commit Mono font-face', () => {
    expect(cssText).toMatch(/font-family:\s*['"]Commit Mono['"]/);
  });

  it('declares Cash Sans font-face', () => {
    expect(cssText).toMatch(/font-family:\s*['"]Cash Sans['"]/);
  });
});

describe('reset styles', () => {
  it('has -webkit-tap-highlight-color: transparent in reset', () => {
    expect(cssText).toContain('-webkit-tap-highlight-color: transparent');
  });
});

describe('mobile media queries', () => {
  it('has 700px breakpoint media query', () => {
    expect(cssText).toMatch(/@media\s*\(max-width:\s*700px\)/);
  });

  it('has 1100px breakpoint media query', () => {
    expect(cssText).toMatch(/@media\s*\(max-width:\s*1100px\)/);
  });
});

describe('demo CSS classes', () => {
  const demoClasses = [
    'cabinet-demo', 'cabinet-title', 'cabinet-search', 'cabinet-pill', 'cabinet-pills',
    'cabinet-search-icon', 'cabinet-cursor',
    'bezier-demo',
    'icon-specimen', 'specimen-controls', 'specimen-size-btn', 'specimen-grid', 'specimen-icon',
    'path-label-demo',
  ];

  demoClasses.forEach(cls => {
    it(`has CSS rule for .${cls}`, () => {
      expect(cssText).toMatch(new RegExp(`\\.${cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}[\\s{,:.\\[]`));
    });
  });
});

describe('HTML classes have CSS definitions', () => {
  it('all classes used in index.html have at least one CSS rule', () => {
    const dom = new JSDOM(htmlText);
    const doc = dom.window.document;
    const allEls = doc.querySelectorAll('[class]');
    const classesUsed = new Set();
    allEls.forEach(el => {
      el.classList.forEach(c => classesUsed.add(c));
    });

    // Classes that are structural-only (styled via inheritance, no dedicated CSS rule)
    const intentionallyUnstyled = new Set(['project-num', 'work-counter']);

    const missing = [];
    for (const cls of classesUsed) {
      if (intentionallyUnstyled.has(cls)) continue;
      // Escape the class name for regex
      const escaped = cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Look for the class in CSS - either as .classname followed by typical CSS tokens
      const hasRule = new RegExp(`\\.${escaped}([\\s{,:.\\[>~+]|$)`, 'm').test(cssText);
      if (!hasRule) missing.push(cls);
    }
    expect(missing).toEqual([]);
  });
});

describe('grid diagram aspect-ratio', () => {
  it('enforces aspect-ratio: 1/1 on grid diagram SVGs', () => {
    expect(cssText).toMatch(/aspect-ratio:\s*1\s*\/\s*1/);
  });
});
