import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let cssText;

beforeAll(() => {
  cssText = readFileSync(resolve(__dirname, '../style.css'), 'utf-8');
});

// Helper: extract all media query blocks matching a regex pattern
function extractMediaBlock(regexStr) {
  const pattern = new RegExp(`@media\\s*${regexStr}\\s*\\{`, 'g');
  const blocks = [];
  let match;
  while ((match = pattern.exec(cssText))) {
    let depth = 0;
    let i = match.index + match[0].length - 1;
    for (; i < cssText.length; i++) {
      if (cssText[i] === '{') depth++;
      if (cssText[i] === '}') depth--;
      if (depth === 0) break;
    }
    blocks.push(cssText.slice(match.index, i + 1));
  }
  return blocks.join('\n');
}

describe('grid diagram aspect-ratio', () => {
  it('path-label-demo, svg-grid-demo, bezier-demo SVGs have aspect-ratio: 1/1', () => {
    const rule = cssText.match(/\.path-label-demo svg[\s\S]*?aspect-ratio:\s*1\s*\/\s*1/);
    expect(rule).not.toBeNull();
  });
});

describe('icon-grid-row mobile', () => {
  it('uses CSS grid 2-column layout on mobile', () => {
    const mobile = extractMediaBlock('\\(max-width:\\s*700px\\)');
    expect(mobile).toContain('.icon-grid-row');
    expect(mobile).toMatch(/grid-template-columns:\s*1fr\s+1fr/);
  });
});

describe('code block line-height on mobile', () => {
  it('code block line-height is 0.65 in 700px media query', () => {
    const mobile = extractMediaBlock('\\(max-width:\\s*700px\\)');
    expect(mobile).toContain('line-height: 0.65');
  });

  it('code block line-height is 0.65 in 1100px touch media query', () => {
    const touch = extractMediaBlock('\\(max-width:\\s*1100px\\)\\s*and\\s*\\(hover:\\s*none\\)');
    expect(touch).toContain('line-height: 0.65');
  });
});

describe('project-display-close on mobile', () => {
  it('is display: block on mobile', () => {
    const mobile = extractMediaBlock('\\(max-width:\\s*700px\\)');
    expect(mobile).toContain('.project-display-close');
    expect(mobile).toContain('display: block');
  });
});

describe('nav sticky on mobile', () => {
  it('nav is sticky on mobile', () => {
    const mobile = extractMediaBlock('\\(max-width:\\s*700px\\)');
    expect(mobile).toContain('.nav');
    expect(mobile).toContain('position: sticky');
  });
});
