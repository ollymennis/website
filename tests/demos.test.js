import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

const projectsDir = resolve(__dirname, '../public/projects');

function parseMdToDOM(filename) {
  const md = readFileSync(resolve(projectsDir, filename), 'utf-8');
  // Extract raw HTML blocks from the markdown (lines starting with <)
  const htmlBlocks = md.split('\n')
    .filter(line => line.trim().startsWith('<') || line.trim().startsWith('<!--'))
    .join('\n');
  const dom = new JSDOM(`<div>${htmlBlocks}</div>`);
  return { dom, doc: dom.window.document, raw: md };
}

describe('cabinet-demo', () => {
  let doc, raw;

  beforeAll(() => {
    const result = parseMdToDOM('03-asset-cabinet.md');
    doc = result.doc;
    raw = result.raw;
  });

  it('has cabinet-demo HTML (may be commented out)', () => {
    // The cabinet demo is in a comment in the markdown
    expect(raw).toContain('cabinet-demo');
    expect(raw).toContain('cabinet-title');
    expect(raw).toContain('cabinet-search');
    expect(raw).toContain('cabinet-search-icon');
    expect(raw).toContain('cabinet-pills');
    expect(raw).toContain('cabinet-pill');
  });

  it('cabinet demo has SVG goo filter with correct matrix values', () => {
    expect(raw).toContain('feGaussianBlur');
    expect(raw).toContain('feColorMatrix');
    expect(raw).toMatch(/values=["']1 0 0 0 0\s+0 1 0 0 0\s+0 0 1 0 0\s+0 0 0 18 -7["']/);
  });
});

describe('bezier-demo (02-svg-maker.md)', () => {
  let doc;

  beforeAll(() => {
    const result = parseMdToDOM('02-svg-maker.md');
    doc = result.doc;
  });

  it('has .bezier-demo container', () => {
    expect(doc.querySelector('.bezier-demo')).not.toBeNull();
  });

  it('has .bz-curve path', () => {
    expect(doc.querySelector('.bz-curve')).not.toBeNull();
  });

  it('has .bz-cp1 and .bz-cp2 control points', () => {
    expect(doc.querySelector('.bz-cp1')).not.toBeNull();
    expect(doc.querySelector('.bz-cp2')).not.toBeNull();
  });

  it('has .bz-handle1 and .bz-handle2', () => {
    expect(doc.querySelector('.bz-handle1')).not.toBeNull();
    expect(doc.querySelector('.bz-handle2')).not.toBeNull();
  });
});

describe('gen-demo (02-svg-maker.md)', () => {
  let doc;

  beforeAll(() => {
    const result = parseMdToDOM('02-svg-maker.md');
    doc = result.doc;
  });

  it('has .gen-demo container', () => {
    expect(doc.querySelector('.gen-demo')).not.toBeNull();
  });

  it('has .gen-loading group', () => {
    expect(doc.querySelector('.gen-loading')).not.toBeNull();
  });

  it('has .gen-result group', () => {
    expect(doc.querySelector('.gen-result')).not.toBeNull();
  });

  it('has .gen-code-output element', () => {
    expect(doc.querySelector('.gen-code-output')).not.toBeNull();
  });
});

describe('path-label-demo (02-svg-maker.md)', () => {
  let doc;

  beforeAll(() => {
    const result = parseMdToDOM('02-svg-maker.md');
    doc = result.doc;
  });

  it('has .path-label-demo containers', () => {
    const demos = doc.querySelectorAll('.path-label-demo');
    expect(demos.length).toBeGreaterThan(0);
  });

  it('has .pl-path elements with data-label', () => {
    const paths = doc.querySelectorAll('.pl-path[data-label]');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('has .pl-magenta elements', () => {
    expect(doc.querySelectorAll('.pl-magenta').length).toBeGreaterThan(0);
  });

  it('has .pl-label elements', () => {
    expect(doc.querySelectorAll('.pl-label').length).toBeGreaterThan(0);
  });
});

describe('icon-specimen (04-icons-mcp.md)', () => {
  it('initIconSpecimen expects #specimen-body and .specimen-controls', () => {
    // The icon specimen is dynamically built by JS, so we test the CSS has the classes
    const css = readFileSync(resolve(__dirname, '../style.css'), 'utf-8');
    expect(css).toContain('.specimen-controls');
    expect(css).toContain('.specimen-size-btn');
    expect(css).toContain('.specimen-grid');
    expect(css).toContain('.specimen-icon');
  });
});
