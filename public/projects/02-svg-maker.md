# svg maker
_teaching a machine to draw_

## svg maker is a tool that generates SVG icons from short, natural language prompts — matching existing library styles, shape conventions, and grid constraints

### learning the language

to build this I had to go back to the fundamentals. SVG is instructions, not pixels. every icon lives on a 24x24 unit grid:

```<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">```

<div class="svg-grid-demo" style="position:relative;width:100%;max-width:400px;aspect-ratio:1;margin:2.5rem auto;cursor:crosshair;user-select:none"><svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block;background:var(--bg);border:1px solid var(--fg);border-radius:4px"><defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="none" stroke="var(--fg)" stroke-width="0.03" opacity="0.15"/></pattern></defs><rect width="24" height="24" fill="url(#grid)"/><line x1="0" y1="12" x2="24" y2="12" stroke="var(--fg)" stroke-width="0.06" opacity="0.08"/><line x1="12" y1="0" x2="12" y2="24" stroke="var(--fg)" stroke-width="0.06" opacity="0.08"/></svg><div class="svg-grid-coord" style="position:absolute;top:8px;right:8px;font-family:monospace;font-size:0.75rem;color:var(--fg);opacity:0.5;pointer-events:none"></div><div class="svg-grid-dot" style="position:absolute;width:6px;height:6px;border-radius:50%;background:var(--fg);pointer-events:none;display:none;transform:translate(-50%,-50%)"></div></div>

paths are built from a handful of commands. `M` moves the pen. `L` draws a line. `Z` closes the path. `C` draws a cubic bézier with two control points. `Q` draws a quadratic with one. `A` draws an arc and takes seven parameters.

<div class="bezier-demo" style="position:relative;width:100%;max-width:400px;aspect-ratio:1;margin:2.5rem auto"><svg viewBox="0 0 25 25" width="100%" height="100%" style="display:block;background:var(--bg);border:1px solid var(--fg);border-radius:4px"><defs><pattern id="grid2" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="none" stroke="var(--fg)" stroke-width="0.03" opacity="0.15"/></pattern></defs><rect width="25" height="25" fill="url(#grid2)"/><line x1="3" y1="20" x2="7" y2="4" stroke="var(--fg)" stroke-width="0.12" stroke-dasharray="0.3 0.3" opacity="0.3"/><line x1="21" y1="20" x2="17" y2="4" stroke="var(--fg)" stroke-width="0.12" stroke-dasharray="0.3 0.3" opacity="0.3"/><path d="M 3 20 C 7 4, 17 4, 21 20" fill="none" stroke="var(--fg)" stroke-width="0.5" stroke-linecap="round"/><circle cx="3" cy="20" r="0.6" fill="var(--fg)"/><circle cx="7" cy="4" r="0.5" fill="none" stroke="var(--fg)" stroke-width="0.25"/><circle cx="17" cy="4" r="0.5" fill="none" stroke="var(--fg)" stroke-width="0.25"/><circle cx="21" cy="20" r="0.6" fill="var(--fg)"/><text x="1" y="22.5" font-size="1.1" fill="var(--fg)" font-family="monospace" opacity="0.6">P0</text><text x="5.2" y="3.2" font-size="1.1" fill="var(--fg)" font-family="monospace" opacity="0.6">CP1</text><text x="17.8" y="3.2" font-size="1.1" fill="var(--fg)" font-family="monospace" opacity="0.6">CP2</text><text x="20" y="22.5" font-size="1.1" fill="var(--fg)" font-family="monospace" opacity="0.6">P1</text><text x="3" y="24.5" font-size="0.8" fill="var(--fg)" font-family="monospace" opacity="0.35">C 7 4, 17 4, 21 20</text></svg></div>

### teaching the machine

it is suprisingly difficult to generate usable svgs, given how incredible these models are at creating images. but generating a PNG is art — the model imagines pixels. generating an SVG is math — it has to write precise coordinates, calculate curves, and produce code that actually parses.

I created about 1,000 svgs for Block libraries - they have consistent stroke weights, standardized corner radii, precise visual centers. the goal is to generate new icons that belong next to those.

early outputs are valid SVG but look wrong. strokes too thick, rounded end caps, paths 1 pixel outside the grid, overlapping shapes, etc.

<!-- [placeholder: the horse head attempts] -->

<div class="video-crop" style="max-width: 362px;"><video src="/media/svg maker/icon gen.mp4" autoplay muted loop playsinline data-playback-rate="2"></video></div>

most of the work is in the system prompt — teaching the model what good looks like. stroke-width: 2, stroke-linecap: butt, stroke-linejoin: round. stay on the 24x24 grid. 1px padding, unless the path is a bezier. round coordinates to the nearest .5. use cubic béziers for organic curves, arcs for perfect circles.

labeling paths helps a lot. every `<path>` gets a comment: `<!-- handle -->`, `<!-- blade -->`, `<!-- arrow-head -->`. once the model understands the anatomy of an icon it reasons about structure instead of just coordinates.

it uses dual-mode embeddings for similarity matching — cohere v4 multimodal embeddings. when a prompt comes in, the system searches both by description _and_ by visual similarity (rendering SVGs to PNGs and comparing them). results merge by keeping the highest score per icon. the top 3 matches get fed into the prompt as reference SVGs, so the model isn't starting from scratch — it's riffing on proven geometry.

<!-- [placeholder: embedding architecture diagram] -->

<!-- [placeholder: search & merge pipeline diagram] -->

<!-- [placeholder: prompt composition diagram] -->

there's also a feedback loop. users can rate outputs as good or bad, and those get injected into the next generation as examples to follow or avoid. it's iterative refinement without retraining.

post-generation, an auto-centering step calculates the bounding box of all path coordinates and shifts the icon to center on the 12,12 midpoint — but only if the offset is more than 0.5px, to avoid over-correction.

to measure progress I built an eval pipeline. each run generates a batch of icons from the same set of prompts, scored on validity (does it parse), grid alignment, stroke consistency, path efficiency, and visual similarity to the reference. it makes prompt changes measurable instead of vibes-based.

### tuning

a valid SVG renders. a production SVG _belongs_ — it matches stroke weights across a library, aligns to the pixel grid so it doesn't blur at small sizes, and uses the minimum path commands to describe the shape.

I run generations against existing libraries, compare stroke weights, measure corner radii, overlay outputs on originals. batch after batch — refining the prompt, adjusting constraints, tightening instructions.

<video src="/media/svg maker/snowhat-trimmed.mp4" autoplay muted loop playsinline></video>

things I've learned:

**path simplification matters.** the model sometimes outputs dozens of segments where four would do. a circle doesn't need 12 cubic béziers — it needs two arcs. `H` and `V` for straight horizontal/vertical lines instead of `L`. `S` for smooth curves that mirror the previous control point.

**the viewBox is sacred.** icons that bleed outside it break layouts. icons that don't fill it look shrunken. key features should occupy 80-90% of the box.

**naming creates understanding.** labeling paths — `<!-- left-wing -->`, `<!-- envelope-flap -->` — makes edits smarter. the model can "find the handle and make it longer" instead of guessing which segment to modify.

<!-- [placeholder: before/after comparison — early generation vs refined output, same prompt] -->

### what's next

the system prompt gets you far, but there's a ceiling — the model is interpreting instructions about drawing, not learning from the drawings themselves.

the next step is supervised fine-tuning. take the thousands of hand-drawn SVGs from existing libraries, pair each with a natural language description, and train the model on that mapping directly. not "here are rules about how to draw" but "here are ten thousand examples of what good looks like."

that means renting GPU time — an A100 or H100 cluster — and running an SFT pipeline on a base model. the training data is the icon libraries: SVG source as target output, icon name and metadata as input. the model learns stroke style, grid alignment, and visual consistency from exposure instead of rules.

SFT won't replace the system prompt. it'll replace the need for the prompt to carry so much weight. the prompt focuses on _what_ to draw, the model already knows _how._
