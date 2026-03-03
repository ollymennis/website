# Portfolio Site Scaffold — Keyboard-Navigated Single Page Experience

A technical spec and build plan for a keyboard-first, presentation-style portfolio site with an integrated open-source icon package explorer.

---

## 1. Concept & Goals

**What this is:** A single-page portfolio experience structured as sequential "slides" (sections), navigable entirely by keyboard. The site itself becomes a demonstration of craft — not just a list of projects, but an *interactive artifact*. The icon package integration gives visitors a live, tactile way to explore and download the icons.

**Design philosophy:** Neutral, precise, tool-like. The interface should feel like a well-made instrument, not a typical portfolio. Every detail deliberate.

**Memorable differentiator:** The icon explorer isn't a link to a GitHub repo — it's a live, searchable, filterable, downloadable browser built into the page itself.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Vanilla JS (ES modules) OR Astro | Astro gives you component structure without runtime overhead; vanilla gives maximum control |
| **Styling** | CSS custom properties + no framework | Full control over layout and animation; utility classes become noise at this level of precision |
| **Icon generation** | Custom JS module | Parse your icon SVGs, inject into DOM, handle copy/download |
| **Bundler** | Vite | Fast DX, handles SVG imports, ESM-native |
| **Font** | Self-hosted variable font | Use your own icon package's aesthetic or a complementary monospace/grotesque |

No React. No Tailwind. The constraints will push you toward better CSS and cleaner JS.

---

## 3. Site Architecture

```
/
├── index.html              # Single HTML file, all sections present in DOM
├── style.css               # Global + section-specific styles
├── main.js                 # Entry: keyboard controller, section manager
├── /modules
│   ├── keyboard.js         # All keyboard bindings
│   ├── sections.js         # Section navigation state machine
│   ├── icons.js            # Icon data loading, search, filter, download
│   └── theme.js            # Light/dark, contrast, zoom
├── /icons
│   ├── /svg                # Raw SVG source files (your icon package)
│   ├── icons-manifest.json # Generated index: name, tags, category, unicode point
│   └── build.js            # Node script: scans /svg, outputs manifest + sprite
└── /public
    └── fonts/
```

---

## 4. Section Map

Each section is a `<section data-index="N">` in the DOM. Only one is "active" at a time via a CSS class. Navigation moves through them linearly with arrow keys, or jumps via number keys.

```
0 — Hero            Name, title, one-line philosophy
1 — Approach        Your design + engineering POV (short manifesto)
2 — Icon Package    Live icon explorer (main feature section)
3 — Selected Work   2–4 case studies, keyboard-navigable sub-slides
4 — Process         How you think/build (ASCII table aesthetic works great here)
5 — Download        Icon package download builder (weight, format, subset)
6 — Connect         Links, contact, open source
```

---

## 5. Keyboard Controller

The keyboard system is the spine of the experience. Build it as a state machine with clear modes.

```javascript
// modules/keyboard.js

const MODES = {
  NAVIGATE: 'navigate',   // Default: arrow keys move between sections
  SEARCH: 'search',       // Icon search input is focused
  INSPECT: 'inspect',     // An icon is selected, showing detail panel
};

const keybindings = {
  [MODES.NAVIGATE]: {
    'ArrowRight': () => sections.next(),
    'ArrowLeft':  () => sections.prev(),
    'ArrowDown':  () => sections.scrollDown(),
    'ArrowUp':    () => sections.scrollUp(),
    'KeyF':       () => enterSearch(),
    'KeyT':       () => theme.toggle(),
    'KeyC':       () => theme.toggleContrast(),
    'Escape':     () => noop(),
    // Number keys 0-9: jump to section
  },
  [MODES.SEARCH]: {
    'Escape':     () => exitSearch(),
    'ArrowDown':  () => icons.selectNext(),
    'ArrowUp':    () => icons.selectPrev(),
    'Enter':      () => icons.openSelected(),
  },
  [MODES.INSPECT]: {
    'Escape':     () => icons.closeSelected(),
    'KeyC':       () => icons.copySelected('svg'),
    'KeyN':       () => icons.copySelected('name'),
    'ArrowRight': () => icons.nextIcon(),
    'ArrowLeft':  () => icons.prevIcon(),
  },
};
```

Display a persistent keyboard cheatsheet in the footer (toggle with `H` to hide).

---

## 6. Section Navigation System

```javascript
// modules/sections.js

class SectionManager {
  constructor(sections) {
    this.sections = sections;  // Array of DOM elements
    this.current = 0;
    this.transitioning = false;
  }

  goto(index) {
    if (this.transitioning) return;
    const prev = this.current;
    this.current = clamp(index, 0, this.sections.length - 1);
    
    this.sections[prev].classList.remove('active');
    this.sections[prev].classList.add(index > prev ? 'exit-left' : 'exit-right');
    
    this.sections[this.current].classList.add('active', 'entering');
    
    // Clean up classes after transition
    this.transitioning = true;
    setTimeout(() => {
      this.sections[prev].classList.remove('exit-left', 'exit-right');
      this.sections[this.current].classList.remove('entering');
      this.transitioning = false;
    }, 400);

    this.updateProgress();
    history.replaceState(null, '', `#${this.current}`);
  }

  next() { this.goto(this.current + 1); }
  prev() { this.goto(this.current - 1); }
}
```

CSS transitions handle the visual movement. No JS animation libraries needed.

---

## 7. Icon Package — The Core Feature

This is what makes the site genuinely useful, not just decorative.

### 7a. Build Step — Generate Manifest

```javascript
// icons/build.js (run with: node icons/build.js)
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { parse } from 'path';

const svgDir = './icons/svg';
const files = readdirSync(svgDir).filter(f => f.endsWith('.svg'));

const manifest = files.map(file => {
  const name = parse(file).name;
  const svg = readFileSync(`${svgDir}/${file}`, 'utf8');
  
  // Extract tags from filename conventions: e.g. "arrow-right--ui--navigation.svg"
  const parts = name.split('--');
  const slug = parts[0];
  const category = parts[1] || 'misc';
  const tags = parts.slice(1);

  return { slug, name: slug, category, tags, svg };
});

writeFileSync('./icons/icons-manifest.json', JSON.stringify(manifest, null, 2));
console.log(`Built manifest: ${manifest.length} icons`);
```

### 7b. Icon Search Module

```javascript
// modules/icons.js

class IconExplorer {
  constructor(manifest) {
    this.all = manifest;
    this.filtered = manifest;
    this.selected = null;
    this.query = '';
    this.activeCategory = 'all';
  }

  search(query) {
    this.query = query.toLowerCase();
    this.filter();
  }

  setCategory(cat) {
    this.activeCategory = cat;
    this.filter();
  }

  filter() {
    this.filtered = this.all.filter(icon => {
      const matchesQuery = !this.query ||
        icon.name.includes(this.query) ||
        icon.tags.some(t => t.includes(this.query));
      const matchesCat = this.activeCategory === 'all' ||
        icon.category === this.activeCategory;
      return matchesQuery && matchesCat;
    });
    this.render();
  }

  select(icon) {
    this.selected = icon;
    keyboard.setMode('inspect');
    this.renderDetail(icon);
  }

  async copyToClipboard(icon, format) {
    const text = format === 'svg' ? icon.svg : icon.name;
    await navigator.clipboard.writeText(text);
    this.showCopiedFeedback(format);
  }

  downloadSVG(icon) {
    const blob = new Blob([icon.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `${icon.name}.svg`
    });
    a.click();
    URL.revokeObjectURL(url);
  }

  render() {
    const grid = document.getElementById('icon-grid');
    grid.innerHTML = this.filtered.map(icon => `
      <button class="icon-cell" data-slug="${icon.slug}" title="${icon.name}">
        ${icon.svg}
        <span class="icon-label">${icon.name}</span>
      </button>
    `).join('');
    document.getElementById('icon-count').textContent = `${this.filtered.length} icons`;
  }
}
```

### 7c. Download Builder

The download section lets visitors configure and download a subset of the icon package:

```
[Format]       SVG  |  PNG (24px)  |  PNG (48px)  |  Sprite SVG
[Stroke width] 1px  |  1.5px  |  2px
[Color]        currentColor  |  #000  |  custom
[Subset]       All  |  Category  |  Selected only
```

Use [JSZip](https://stuk.github.io/jszip/) (client-side, ~100KB) to package the download as a `.zip` — no server required.

```javascript
import JSZip from 'jszip';

async function buildDownload(icons, options) {
  const zip = new JSZip();
  const folder = zip.folder('icons');

  for (const icon of icons) {
    let svg = icon.svg;
    if (options.strokeWidth) {
      svg = svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${options.strokeWidth}"`);
    }
    if (options.color !== 'currentColor') {
      svg = svg.replace(/stroke="currentColor"/g, `stroke="${options.color}"`);
    }
    folder.file(`${icon.name}.svg`, svg);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  // trigger download
}
```

---

## 8. CSS Architecture

```css
/* Core structure */
:root {
  --bg: #f5f4f1;
  --fg: #1a1a18;
  --accent: #2d4cff;     /* Your brand color */
  --mono: 'YourIconFont', 'Commit Mono', monospace;
  --sans: 'Your Display Font', sans-serif;

  --section-transition: 380ms cubic-bezier(0.4, 0, 0.2, 1);
  --zoom: 1;             /* controlled by +/- keys */
}

[data-theme="dark"] {
  --bg: #111110;
  --fg: #e8e6e1;
}

/* Section system */
section {
  position: fixed;
  inset: 0;
  padding: var(--section-padding);
  opacity: 0;
  pointer-events: none;
  transform: translateX(60px);
  transition: opacity var(--section-transition),
              transform var(--section-transition);
}

section.active {
  opacity: 1;
  pointer-events: all;
  transform: translateX(0);
}

section.exit-left  { transform: translateX(-60px); opacity: 0; }
section.exit-right { transform: translateX(60px);  opacity: 0; }

/* Zoom system */
html { font-size: calc(16px * var(--zoom)); }

/* Icon grid */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 4px;
}

.icon-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: border-color 120ms, background 120ms;
}

.icon-cell:hover,
.icon-cell:focus-visible {
  border-color: var(--fg);
  background: var(--fg);
  color: var(--bg);
}
```

---

## 9. Progress + Navigation HUD

Persistent UI overlaid on all sections:

```html
<!-- Always visible -->
<nav class="hud" aria-label="Site navigation">
  <div class="hud-progress">
    <span class="hud-current">01</span>
    <div class="hud-track">
      <div class="hud-fill" style="--pct: 0%"></div>
    </div>
    <span class="hud-total">06</span>
  </div>
  <div class="hud-section-name">Hero</div>
</nav>

<footer class="keyboard-legend" id="kbd-legend">
  <span><kbd>←</kbd><kbd>→</kbd> navigate</span>
  <span><kbd>F</kbd> search icons</span>
  <span><kbd>T</kbd> theme</span>
  <span><kbd>H</kbd> hide keys</span>
</footer>
```

---

## 10. Build & Dev Workflow

```bash
# Setup
npm create vite@latest portfolio -- --template vanilla
cd portfolio
npm install jszip

# Development
npm run dev

# Icon manifest rebuild (run after adding/changing icons)
node icons/build.js

# Production build
npm run build
```

Add the manifest build to the Vite config as a plugin so it auto-runs when SVG files change:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { exec } from 'child_process';

export default defineConfig({
  plugins: [{
    name: 'icon-manifest',
    handleHotUpdate({ file }) {
      if (file.includes('/icons/svg/')) {
        exec('node icons/build.js');
      }
    }
  }]
});
```

---

## 11. Deployment

**Recommended: GitHub Pages or Netlify**

Since everything is client-side (no server, no API), you can host for free with a simple static deploy.

```bash
# Netlify: drop /dist folder or connect GitHub repo
# GitHub Pages: set publish dir to /dist in repo settings
```

Link the icon package's GitHub repo from the site — the download button and the source should point to the same repo.

---

## 12. Build Order

Work in this sequence to avoid getting lost:

1. **HTML skeleton** — all sections in DOM, no styling
2. **Section navigation JS** — get arrow keys working, sections swapping
3. **CSS layout** — fixed positioning, transitions, HUD
4. **Theme system** — CSS variables, `T` key toggle
5. **Icon manifest** — write `build.js`, generate JSON from your SVGs
6. **Icon grid** — render manifest to DOM, basic grid layout
7. **Icon search** — filter by query and category
8. **Icon detail panel** — select, copy SVG, copy name
9. **Download builder** — format options, JSZip packaging
10. **Polish** — keyboard legend, zoom, section labels, transitions
11. **Mobile fallback** — the keyboard UX won't translate; add a simplified scroll layout for touch devices

---

## 13. Nice-to-Haves (Post-MVP)

- **Icon usage preview** — paste in a code snippet and see the icon rendered in context
- **Figma plugin link** — if your icons are on Figma Community, surface it here
- **MCP integration note** — mention your icons-mcp project with a link; the portfolio site and the MCP tool are companions
- **Version history** — show a simple changelog of icon additions per release
- **Embed snippet generator** — copy a `<script>` tag that lets others use the icon set via CDN

---

*End of scaffold.*
