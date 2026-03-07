import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Extract parseProjectMd and inlineMd from main.js source
const mainJs = readFileSync(resolve(__dirname, '../main.js'), 'utf-8');

// Build a self-contained parser by extracting both functions
function buildParser() {
  // Extract inlineMd
  const inlineMdMatch = mainJs.match(/function inlineMd\(text\)\s*\{/);
  if (!inlineMdMatch) throw new Error('Could not find inlineMd');
  let depth = 0, i = mainJs.indexOf('{', inlineMdMatch.index);
  for (; i < mainJs.length; i++) {
    if (mainJs[i] === '{') depth++;
    if (mainJs[i] === '}') depth--;
    if (depth === 0) break;
  }
  const inlineMdSrc = mainJs.slice(inlineMdMatch.index, i + 1);

  // Extract parseProjectMd
  const parseMdMatch = mainJs.match(/function parseProjectMd\(md\)\s*\{/);
  if (!parseMdMatch) throw new Error('Could not find parseProjectMd');
  depth = 0;
  i = mainJs.indexOf('{', parseMdMatch.index);
  for (; i < mainJs.length; i++) {
    if (mainJs[i] === '{') depth++;
    if (mainJs[i] === '}') depth--;
    if (depth === 0) break;
  }
  const parseMdSrc = mainJs.slice(parseMdMatch.index, i + 1);

  // Create the function in an isolated scope
  const fn = new Function(`
    ${inlineMdSrc}
    ${parseMdSrc}
    return parseProjectMd;
  `);
  return fn();
}

const parseProjectMd = buildParser();

describe('title extraction', () => {
  it('extracts title from # heading', () => {
    const result = parseProjectMd('# My Title\n\nSome body text');
    expect(result.title).toBe('My Title');
  });
});

describe('subtitle extraction', () => {
  it('extracts subtitle from _italic_ on next non-empty line', () => {
    const result = parseProjectMd('# Title\n\n_the subtitle_\n\nbody');
    expect(result.subtitle).toBe('the subtitle');
  });

  it('returns empty subtitle when none present', () => {
    const result = parseProjectMd('# Title\n\nbody text');
    expect(result.subtitle).toBe('');
  });
});

describe('heading conversion', () => {
  it('converts ### heading to <h3>', () => {
    const result = parseProjectMd('# T\n\nbody\n\n### Section');
    expect(result.bodyHtml).toContain('<h3>Section</h3>');
  });

  it('converts ## heading to <h2>', () => {
    const result = parseProjectMd('# T\n\nbody\n\n## Section');
    expect(result.bodyHtml).toContain('<h2>Section</h2>');
  });
});

describe('bullet lists', () => {
  it('converts + bullet items to .bullet-list with .bullet-marker', () => {
    const result = parseProjectMd('# T\n\n+ first item\n+ second item');
    expect(result.bodyHtml).toContain('class="bullet-list"');
    expect(result.bodyHtml).toContain('class="bullet-marker"');
    expect(result.bodyHtml).toContain('first item');
    expect(result.bodyHtml).toContain('second item');
  });
});

describe('raw HTML preservation', () => {
  it('preserves div HTML tags', () => {
    const result = parseProjectMd('# T\n\n<div class="test">content</div>');
    expect(result.bodyHtml).toContain('<div class="test">content</div>');
  });

  it('preserves video tags', () => {
    const result = parseProjectMd('# T\n\n<video src="test.mp4" autoplay></video>');
    expect(result.bodyHtml).toContain('video');
    expect(result.bodyHtml).toContain('test.mp4');
  });

  it('preserves img tags', () => {
    const result = parseProjectMd('# T\n\n<img src="test.png" alt="test" />');
    expect(result.bodyHtml).toContain('<img src="test.png"');
  });
});

describe('inline formatting', () => {
  it('handles inline code', () => {
    const result = parseProjectMd('# T\n\nUse `code` here');
    expect(result.bodyHtml).toContain('<code>code</code>');
  });

  it('handles bold', () => {
    const result = parseProjectMd('# T\n\nSome **bold** text');
    expect(result.bodyHtml).toContain('<strong>bold</strong>');
  });

  it('handles italic', () => {
    const result = parseProjectMd('# T\n\nSome _italic_ text');
    expect(result.bodyHtml).toContain('<em>italic</em>');
  });
});

describe('blockquotes', () => {
  it('converts > line to blockquote', () => {
    const result = parseProjectMd('# T\n\n> quoted text');
    expect(result.bodyHtml).toContain('<blockquote>');
    expect(result.bodyHtml).toContain('quoted text');
  });
});

describe('code blocks', () => {
  it('converts fenced code blocks to pre/code', () => {
    const result = parseProjectMd('# T\n\n```\nconst x = 1;\n```');
    expect(result.bodyHtml).toContain('<pre><code>');
    expect(result.bodyHtml).toContain('const x = 1;');
  });
});
