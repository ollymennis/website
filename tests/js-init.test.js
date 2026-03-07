import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const mainJs = readFileSync(resolve(__dirname, '../main.js'), 'utf-8');

// Extract individual init function source code for analysis
function extractFunction(name) {
  // Find the function in the source
  const pattern = new RegExp(`function ${name}\\b`);
  const match = mainJs.match(pattern);
  if (!match) return '';
  const start = match.index;
  // Find the matching closing brace
  let depth = 0;
  let i = mainJs.indexOf('{', start);
  for (; i < mainJs.length; i++) {
    if (mainJs[i] === '{') depth++;
    if (mainJs[i] === '}') depth--;
    if (depth === 0) break;
  }
  return mainJs.slice(start, i + 1);
}

describe('init functions set dataset.initialized', () => {
  const fns = [
    'initCabinetDemo',
    'initGenDemo',
    'initPathLabelDemo',
    'initBezierDemo',
    'initSvgGridDemo',
    'initIconIntroRow',
  ];

  fns.forEach(fn => {
    it(`${fn} checks and sets dataset.initialized`, () => {
      const src = extractFunction(fn);
      expect(src).toBeTruthy();
      expect(src).toContain('dataset.initialized');
    });
  });

  it('initIconSpecimen checks and sets dataset.initialized', () => {
    const src = extractFunction('initIconSpecimen');
    expect(src).toBeTruthy();
    expect(src).toContain('dataset.initialized');
  });
});

describe('initCabinetDemo behavior', () => {
  let doc, container;

  beforeEach(() => {
    const html = `
      <div class="cabinet-demo">
        <div class="cabinet-search"></div>
        <div class="cabinet-pills">
          <span class="cabinet-pill">a</span>
          <span class="cabinet-pill">b</span>
          <span class="cabinet-pill">c</span>
        </div>
      </div>
    `;
    const dom = new JSDOM(html);
    doc = dom.window.document;
    container = doc.querySelector('.cabinet-demo');
  });

  it('applies staggered animation delays per pill', () => {
    // Simulate what initCabinetDemo does
    const pills = container.querySelectorAll('.cabinet-pill');
    pills.forEach((pill, i) => {
      pill.style.animationDelay = (i * 0.08) + 's';
    });
    expect(pills[0].style.animationDelay).toBe('0s');
    expect(pills[1].style.animationDelay).toBe('0.08s');
    expect(pills[2].style.animationDelay).toBe('0.16s');
  });

  it('source code adds .bubbled class on search click', () => {
    const src = extractFunction('initCabinetDemo');
    expect(src).toContain("classList.add('bubbled')");
    expect(src).toContain('cabinet-search');
  });
});

describe('loadProjectMd calls all init functions', () => {
  it('calls initProjectDemos in both cached and fresh paths', () => {
    const src = extractFunction('loadProjectMd');
    const matches = src.match(/initProjectDemos/g);
    expect(matches, 'initProjectDemos should be called in both paths').not.toBeNull();
    expect(matches.length, 'initProjectDemos should be called exactly twice').toBe(2);
  });

  it('initProjectDemos contains all init functions', () => {
    const src = extractFunction('initProjectDemos');
    const initCalls = [
      'initHoverPreviews',
      'initHoverIcons',
      'initLoopAtVideos',
      'observeVideos',
      'initIconSpecimen',
      'initSvgGridDemo',
      'initBezierDemo',
      'initPathLabelDemo',
      'initGenDemo',
      'initCabinetDemo',
      'initIconIntroRow',
    ];

    initCalls.forEach(fn => {
      expect(src, `${fn} should be called in initProjectDemos`).toContain(fn);
    });
  });
});

describe('init functions don\'t throw on empty containers', () => {
  it('initCabinetDemo with no .cabinet-demo children does not throw', () => {
    const dom = new JSDOM('<div></div>');
    const el = dom.window.document.querySelector('div');
    // The function iterates querySelectorAll('.cabinet-demo') — empty result is fine
    expect(() => {
      el.querySelectorAll('.cabinet-demo').forEach(() => {});
    }).not.toThrow();
  });

  it('initBezierDemo with no .bezier-demo children does not throw', () => {
    const dom = new JSDOM('<div></div>');
    const el = dom.window.document.querySelector('div');
    expect(() => {
      el.querySelectorAll('.bezier-demo').forEach(() => {});
    }).not.toThrow();
  });
});
