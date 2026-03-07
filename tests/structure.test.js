import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

let doc;

beforeAll(() => {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
  const dom = new JSDOM(html);
  doc = dom.window.document;
});

describe('nav buttons', () => {
  it('has nav buttons with correct data-section values', () => {
    const btns = doc.querySelectorAll('.nav-btn');
    const sections = Array.from(btns).map(b => b.dataset.section);
    expect(sections).toContain('about');
    expect(sections).toContain('work-work');
    expect(sections).toContain('information');
  });
});

describe('content panels', () => {
  it('has panels matching nav sections', () => {
    const panels = doc.querySelectorAll('.content-panel[data-panel]');
    const panelValues = Array.from(panels).map(p => p.dataset.panel);
    expect(panelValues).toContain('about');
    expect(panelValues).toContain('work-work');
    expect(panelValues).toContain('information');
  });
});

describe('required IDs', () => {
  const ids = [
    'project-display',
    'cv-modal',
    'cv-close',
    'cv-content',
    'copy-email',
    'scribble-canvas',
  ];

  ids.forEach(id => {
    it(`has element with id="${id}"`, () => {
      expect(doc.getElementById(id)).not.toBeNull();
    });
  });
});

describe('project items', () => {
  it('has 6 project items with data-project, data-slug', () => {
    const items = doc.querySelectorAll('.project-item[data-project][data-slug]');
    expect(items.length).toBe(6);
  });
});

describe('project content divs', () => {
  it('has 6 project content divs with data-project-content and data-md', () => {
    const contents = doc.querySelectorAll('.project-content[data-project-content][data-md]');
    expect(contents.length).toBe(6);
  });

  it('project content numbers match project item numbers', () => {
    const itemNums = Array.from(doc.querySelectorAll('.project-item[data-project]'))
      .map(el => el.dataset.project);
    const contentNums = Array.from(doc.querySelectorAll('.project-content[data-project-content]'))
      .map(el => el.dataset.projectContent);
    expect(contentNums.sort()).toEqual(itemNums.sort());
  });
});

describe('contact items', () => {
  it('information panel contact items have data-default, data-hover, data-index', () => {
    const infoPanel = doc.querySelector('[data-panel="information"]');
    const emailBtn = infoPanel.querySelector('#copy-email');
    expect(emailBtn).not.toBeNull();
    expect(emailBtn.dataset.default).toBeTruthy();
    expect(emailBtn.dataset.hover).toBeTruthy();
    expect(emailBtn.dataset.index).toBeDefined();
  });
});

describe('sticker images', () => {
  it('has sticker images with src attributes', () => {
    const stickers = doc.querySelectorAll('img.sticker');
    expect(stickers.length).toBeGreaterThan(0);
    stickers.forEach(s => {
      expect(s.getAttribute('src')).toBeTruthy();
    });
  });
});
