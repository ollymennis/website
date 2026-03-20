# this
_how this website works_

this portfolio is a single HTML file, a custom markdown renderer, and a lot of wiring. every project you've seen so far loads its content from a `.md` file, parsed at runtime into interactive demos — no framework, no build step for content

<iframe src="/media/this/index.html" class="this-embed" style="width:100%;height:380px;border:1px solid var(--border);border-radius:12px" loading="lazy"></iframe>

<hr />


### dynamic demos and diagrams

each project has its own flavor of interactivity, all initialized from the same pipeline:

**svg maker** — the website demo builds an SVG canvas with namespace-correct elements, then runs a looping animation: delete prompt → type new prompt → show loading grid → stream code character by character → render the final SVG paths → update the similarity rail with matched icons. it auto-plays via `IntersectionObserver` when scrolled into view

the svg maker project also has several interactive diagrams built directly into the markdown: a **24x24 grid explorer** where hovering highlights individual SVG paths and syncs with the paired code block, a **draggable bézier curve** that updates the `C` command in real time as you move the control points, and **hoverable path-labeled icons** that show semantic labels (like "top-bun", "lettuce", "patty") for each path group — revealing how the model thinks about structure

**asset cabinet** — the search demo types "michael jordan" into a fake search bar, bubbles in pills with staggered delays, then pops result cards with a bounce curve. the whole sequence loops on a timer

**quarto** — the embedding sphere is a standalone Three.js app running in an iframe. it loads a 2MB corpus of Shakespeare passages with precomputed 1,536-dimensional embeddings, projects them to 3D via client-side PCA, and renders ~1,900 particles with bloom post-processing. hover to see sources, click to select

**stickers** are randomly positioned on load (avoiding the content area) and draggable with mouse or touch. they stack with incrementing z-index

<div class="sticker-playground" style="width:100%;height:300px;position:relative"></div>

**scribble** strokes auto-erase 600ms after you lift, fading out over another 600ms. it's DPI-aware and syncs its color with the current theme

**keyboard nav** — arrow keys (and wasd) move between sections and projects. number keys jump to specific projects. `/` toggles dark mode. escape closes things. death to clicking
