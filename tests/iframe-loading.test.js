import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const mainJs = readFileSync(resolve(__dirname, '../main.js'), 'utf-8');
const indexHtml = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
const thisMd = readFileSync(resolve(__dirname, '../public/projects/09-this.md'), 'utf-8');

// Count all project markdown files referenced in index.html
const projectMdPaths = [...indexHtml.matchAll(/data-md="([^"]+)"/g)].map(m => m[1]);

// Count icon SVG files fetched on init in main.js
const iconFilesMatch = mainJs.match(/const iconFiles = \[([\s\S]*?)\];/);
const iconFilesList = iconFilesMatch
  ? iconFilesMatch[1].match(/'[^']+'/g) || []
  : [];

describe('THIS iframe is lazy-loaded', () => {

  it('09-this.md uses data-lazy-src instead of src for the iframe', () => {
    // The iframe should NOT have a src attribute — only data-lazy-src
    expect(thisMd).toContain('data-lazy-src="/media/this/index.html"');
    expect(thisMd).not.toMatch(/[^-]src="\/media\/this\/index\.html"/);
  });

  it('09-this.md iframe does not have loading="lazy" (we handle it ourselves)', () => {
    // We use data-lazy-src instead of the browser's loading="lazy"
    const iframeLine = thisMd.split('\n').find(l => l.includes('data-lazy-src'));
    expect(iframeLine).not.toContain('loading="lazy"');
  });

  it('main.js activates lazy iframes when a project is selected', () => {
    // switchProject should find iframes with data-lazy-src and set their src
    expect(mainJs).toContain("querySelectorAll('iframe[data-lazy-src]')");
    expect(mainJs).toContain('iframe.dataset.lazySrc');
  });

  it('the iframe is NOT loaded on page init', () => {
    // The markdown parser will render <iframe data-lazy-src="..."> into the DOM
    // Without a src attribute, the browser will not fetch the iframe content
    // Verify the markdown does not contain src= for the this iframe
    const iframeMatch = thisMd.match(/<iframe[^>]*this\/index\.html[^>]*>/);
    expect(iframeMatch).not.toBeNull();
    expect(iframeMatch[0]).not.toMatch(/(?<!data-lazy-)src="/);
    expect(iframeMatch[0]).toContain('data-lazy-src=');
  });
});

describe('resource loading on init', () => {

  it('all project markdown files are fetched eagerly on page load', () => {
    expect(mainJs).toContain("document.querySelectorAll('.project-content[data-md]').forEach");
    expect(projectMdPaths.length).toBe(10); // 9 projects + 1 CV
  });

  it('main.js preloads a large number of icon SVGs on init', () => {
    expect(iconFilesList.length).toBeGreaterThan(50);
    expect(mainJs).toContain('Promise.all(');
    expect(mainJs).toContain("fetch(`/media/icons-refresh/icon-svgs/${name}.svg`)");
  });

  it('total init fetch count is high (markdown + icons)', () => {
    const markdownFetches = projectMdPaths.length;
    const iconFetches = iconFilesList.length;
    const totalFetches = markdownFetches + iconFetches;
    expect(totalFetches).toBeGreaterThan(60);
  });

  it('HTML and project files are served with no-cache headers', () => {
    const vercelJson = readFileSync(resolve(__dirname, '../vercel.json'), 'utf-8');
    const config = JSON.parse(vercelJson);
    const noCacheRules = config.headers.filter(h =>
      h.headers.some(hh => hh.value.includes('no-cache'))
    );
    expect(noCacheRules.length).toBeGreaterThanOrEqual(2);
  });
});

describe('no iframe resources loaded until project is opened', () => {

  it('the THIS iframe has no src on initial render', () => {
    // When the markdown is parsed and injected, the iframe has data-lazy-src but no src
    // This means the browser makes ZERO requests for iframe content on page load
    const iframeLine = thisMd.split('\n').find(l => l.includes('data-lazy-src'));
    expect(iframeLine).toBeDefined();
    // Ensure there's no src="..." (only data-lazy-src="...")
    const withoutDataAttr = iframeLine.replace(/data-lazy-src="[^"]*"/g, '');
    expect(withoutDataAttr).not.toMatch(/\bsrc="/);
  });

  it('switchProject sets src from data-lazy-src for the active project', () => {
    // The activation code should be inside switchProject
    const switchProjectFn = mainJs.slice(
      mainJs.indexOf('function switchProject('),
      mainJs.indexOf('function switchProject(') + 2000
    );
    expect(switchProjectFn).toContain('data-lazy-src');
    expect(switchProjectFn).toContain('iframe.src');
  });
});
