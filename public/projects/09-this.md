# this
_how this website works_

this portfolio is a single HTML file, a custom markdown renderer, and a lot of wiring. every project you've seen so far loads its content from a `.md` file, parsed at runtime into interactive demos — no framework, no build step for content

<iframe src="/media/this/index.html" class="this-embed" style="width:100%;height:380px;border:1px solid var(--border);border-radius:12px" loading="lazy"></iframe>

<hr />

### the renderer

project content lives in markdown files under `/projects/`. when you click a project, the site fetches the markdown, parses it through a custom renderer, injects the HTML, and then calls `initProjectDemos()` — a single function that scans the injected DOM for class names and data attributes, then wires up every interactive element it finds

```the markdown for each project is just text and HTML. the renderer passes through raw HTML tags (divs, videos, iframes, SVGs) untouched — which means demos can be embedded directly in the writing
```

### dynamic demos and diagrams

each project has its own flavor of interactivity, all initialized from the same pipeline:

**svg maker** — the website demo builds an SVG canvas with namespace-correct elements, then runs a looping animation: delete prompt → type new prompt → show loading grid → stream code character by character → render the final SVG paths → update the similarity rail with matched icons. it auto-plays via `IntersectionObserver` when scrolled into view

mention the other diagrammy things!!

**asset cabinet** — the search demo types "michael jordan" into a fake search bar, bubbles in pills with staggered delays, then pops result cards with a bounce curve. the whole sequence loops on a timer

**quarto** — the embedding sphere is a standalone Three.js app running in an iframe. it loads a 2MB corpus of Shakespeare passages with precomputed 1,536-dimensional embeddings, projects them to 3D via client-side PCA, and renders ~1,900 particles with bloom post-processing. hover to see sources, click to select

### everything else

**stickers** are randomly positioned on load (avoiding the content area) and draggable with mouse or touch. they stack with incrementing z-index

**the scribble canvas** covers the full viewport — draw anywhere that isn't a button or link. strokes auto-erase 600ms after you lift, fading out over another 600ms. it's DPI-aware and syncs its color with the current theme

**keyboard nav** — arrow keys move between sections and projects. number keys jump to specific projects. `/` toggles dark mode. escape closes things

**deep linking** — the URL hash maps to sections and projects. `/#moneybot` opens the work section with moneybot loaded. `/#cv` opens information with the resume

### the pattern

every demo follows the same wiring:

+ markdown includes a class name (`.figcli-demo`, `.cabinet-demo`, etc.)
+ `initProjectDemos()` finds it after injection
+ the initializer builds DOM, attaches listeners, starts timers
+ CSS classes control state transitions
+ `data-initialized` prevents double-init on re-opens
