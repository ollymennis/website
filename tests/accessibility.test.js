import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

let doc;
let cssText;

beforeAll(() => {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
  const dom = new JSDOM(html);
  doc = dom.window.document;
  cssText = readFileSync(resolve(__dirname, '../style.css'), 'utf-8');
});

describe('image alt attributes', () => {
  it('all <img> in index.html have alt attributes', () => {
    const images = doc.querySelectorAll('img');
    const missingAlt = [];
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        missingAlt.push(img.getAttribute('src'));
      }
    });
    expect(missingAlt).toEqual([]);
  });
});

describe('canvas accessibility', () => {
  it('canvas has aria-hidden="true"', () => {
    const canvas = doc.getElementById('scribble-canvas');
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('buttons have text content', () => {
  it('all buttons have non-empty text', () => {
    const buttons = doc.querySelectorAll('button');
    const empty = [];
    buttons.forEach(btn => {
      const text = btn.textContent.trim();
      // Buttons with images (like close buttons) count if they have alt text on img
      const img = btn.querySelector('img[alt]');
      if (!text && !img) {
        empty.push(btn.className || btn.id || 'unknown');
      }
    });
    expect(empty).toEqual([]);
  });
});

describe('focus-visible styles', () => {
  const selectors = ['nav-btn', 'contact-item', 'specimen-size-btn'];

  selectors.forEach(sel => {
    it(`has :focus-visible style for .${sel}`, () => {
      expect(cssText).toMatch(new RegExp(`\\.${sel}:focus-visible`));
    });
  });
});
