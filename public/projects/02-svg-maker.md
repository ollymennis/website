# svg maker
_teaching a machine to draw_

## svg maker is a tool that generates SVG icons from short, natural language prompts — matching existing library styles, shape conventions, and grid constraints

### learning the language

to build this I had to go back to the fundamentals. SVG is instructions, not pixels. every icon lives on a 24x24 unit grid:

```<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">```

<div class="svg-grid-demo" style="position:relative;width:100%;max-width:400px;aspect-ratio:1;margin:2.5rem auto;cursor:crosshair;user-select:none"><div style="font-family:var(--mono);font-size:0.7rem;opacity:0.3;margin-bottom:0.5rem">24x24 viewBox</div><svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block;background:var(--bg);border:1px solid var(--fg);border-radius:0"><defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="none" stroke="var(--fg)" stroke-width="0.03" opacity="0.12"/></pattern></defs><rect width="24" height="24" fill="url(#grid)"/><line x1="0" y1="12" x2="24" y2="12" stroke="var(--fg)" stroke-width="0.06" opacity="0.12"/><line x1="12" y1="0" x2="12" y2="24" stroke="var(--fg)" stroke-width="0.06" opacity="0.12"/></svg><div class="svg-grid-coord" style="position:absolute;top:8px;right:8px;font-family:var(--mono);font-size:0.75rem;font-weight:bold;color:#000;pointer-events:none;white-space:nowrap"></div><div class="svg-grid-dot" style="position:absolute;width:6px;height:6px;border-radius:50%;background:var(--fg);pointer-events:none;display:none;transform:translate(-50%,-50%)"></div></div>

paths are built from a handful of commands. `M` moves the pen. `L` draws a line. `Z` closes the path. `C` draws a cubic bézier with two control points. `Q` draws a quadratic with one. `A` draws an arc and takes seven parameters.

<div class="bezier-demo" style="position:relative;width:100%;max-width:400px;aspect-ratio:1;margin:2.5rem auto"><div style="font-family:var(--mono);font-size:0.7rem;opacity:0.3;margin-bottom:0.5rem">cubic bézier (drag the control points)</div><svg viewBox="0 0 25 25" width="100%" height="100%" style="display:block;background:var(--bg);border:1px solid var(--fg);border-radius:0"><defs><pattern id="grid2" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="none" stroke="var(--fg)" stroke-width="0.03" opacity="0.12"/></pattern></defs><rect width="25" height="25" fill="url(#grid2)"/><line class="bz-handle1" x1="4" y1="20" x2="4" y2="8" stroke="#009CFF" stroke-width="0.08" stroke-dasharray="0.3 0.3" opacity="0.5"/><line class="bz-handle2" x1="20" y1="4" x2="20" y2="16" stroke="#009CFF" stroke-width="0.08" stroke-dasharray="0.3 0.3" opacity="0.5"/><path class="bz-curve-fill" d="M 4 20 C 4 8, 20 16, 20 4" fill="none" stroke="#FF00FF" stroke-width="2" stroke-linecap="butt" opacity="0.5" style="mix-blend-mode:multiply"/><path class="bz-curve" d="M 4 20 C 4 8, 20 16, 20 4" fill="none" stroke="#009CFF" stroke-width="0.12" stroke-linecap="butt"/><circle cx="4" cy="20" r="0.3" fill="#009CFF" stroke="#fff" stroke-width="0.1"/><path class="bz-cp1" d="M 4 7.6 L 4.4 8 L 4 8.4 L 3.6 8 Z" fill="#fff" stroke="#009CFF" stroke-width="0.1" style="cursor:grab"/><path class="bz-cp2" d="M 20 15.6 L 20.4 16 L 20 16.4 L 19.6 16 Z" fill="#fff" stroke="#009CFF" stroke-width="0.1" style="cursor:grab"/><circle cx="20" cy="4" r="0.3" fill="#009CFF" stroke="#fff" stroke-width="0.1"/><text class="bz-label-p0" x="5" y="21" font-size="1.1" fill="#000" font-weight="bold" font-family="Commit Mono, monospace">P0</text><text class="bz-label-cp1" x="5" y="8.5" font-size="1.1" fill="#000" font-weight="bold" font-family="Commit Mono, monospace">CP1</text><text class="bz-label-cp2" x="21" y="16.5" font-size="1.1" fill="#000" font-weight="bold" font-family="Commit Mono, monospace">CP2</text><text class="bz-label-p1" x="21" y="4.5" font-size="1.1" fill="#000" font-weight="bold" font-family="Commit Mono, monospace">P1</text><text class="bz-cmd" x="3" y="24.5" font-size="0.8" fill="#000" font-weight="bold" font-family="Commit Mono, monospace">C 4 8, 20 16, 20 4</text></svg></div>

### teaching the machine

it is suprisingly difficult to generate usable svgs, given how incredible these models are at creating images. but generating a PNG is art — the model imagines pixels. generating an SVG is math — it has to write precise coordinates, calculate curves, and produce code that actually parses.

I've created about 1,000 finalized svgs for Block libraries. they have consistent stroke weights, standardized corner radii, precise visual centers. the goal is to generate new icons that belong next to those.

early outputs are valid SVG but look wrong. strokes too thick, rounded end caps, paths 1 pixel outside the grid, overlapping shapes, etc.

<!-- [placeholder: the horse head attempts] -->

most of the work is in the system prompt — teaching the model what good looks like. stroke-width: 2, stroke-linecap: butt, stroke-linejoin: round. stay on the 24x24 grid. 1px padding, unless the path is a bezier. round coordinates to the nearest .5. use cubic béziers for organic curves, arcs for perfect circles.

labeling paths helps a lot. every `<path>` gets a comment: `<!-- handle -->`, `<!-- blade -->`, `<!-- arrow-head -->`. once the model understands the anatomy of an icon it reasons about structure instead of just coordinates.

<div class="path-label-demo" style="position:relative;width:100%;max-width:400px;aspect-ratio:1;margin:2.5rem auto"><div style="font-family:var(--mono);font-size:0.7rem;opacity:0.3;margin-bottom:0.5rem">hover to see path labels</div><svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block;background:var(--bg);border:1px solid var(--fg);border-radius:0"><defs><pattern id="grid3" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="none" stroke="var(--fg)" stroke-width="0.03" opacity="0.12"/></pattern></defs><rect width="24" height="24" fill="url(#grid3)"/><g class="pl-path" data-label="cup"><path d="M5 6L7 21H17L19 6" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none" class="pl-magenta"/><path d="M5 6L7 21H17L19 6" stroke="#009CFF" stroke-width="0.12" stroke-linejoin="round" fill="none"/></g><g class="pl-path" data-label="lid"><path d="M21 6L3 6" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none" class="pl-magenta"/><path d="M21 6L3 6" stroke="#009CFF" stroke-width="0.12" stroke-linejoin="round" fill="none"/></g><g class="pl-path" data-label="liquid-line"><path d="M18.5 11C14 15.5 10.1863 11 5.5 11" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none" class="pl-magenta"/><path d="M18.5 11C14 15.5 10.1863 11 5.5 11" stroke="#009CFF" stroke-width="0.12" stroke-linejoin="round" fill="none"/></g><g class="pl-path" data-label="straw"><path d="M18 1L14 2L13 10" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none" class="pl-magenta"/><path d="M18 1L14 2L13 10" stroke="#009CFF" stroke-width="0.12" stroke-linejoin="round" fill="none"/></g></svg><div class="pl-label" style="position:absolute;bottom:8px;left:8px;font-family:var(--mono);font-size:0.75rem;font-weight:bold;color:#000;pointer-events:none;white-space:nowrap;opacity:0"></div></div>

it uses multimodal embeddings for similarity matching. when a prompt comes in, the system searches both by description _and_ by visual similarity. results merge by keeping the highest score per icon. the top 3 matches get fed into the prompt as reference SVGs, so the model can riff on proven geometry.

<!-- [placeholder: embedding architecture diagram] -->

<!-- [placeholder: search & merge pipeline diagram] -->

<!-- [placeholder: prompt composition diagram] -->

there's also a feedback loop. I rate outputs as good or bad, and those get injected into the next generation as examples to follow or avoid.

post-generation, an auto-centering step calculates the bounding box of all path coordinates and shifts the icon to center on the 12,12 midpoint — but only if the offset is more than 0.5px, to avoid over-correction.

<div class="gen-demo" style="position:relative;width:100%;max-width:800px;margin:2.5rem auto;cursor:pointer;user-select:none"><div style="font-family:var(--mono);font-size:0.7rem;opacity:0.3;margin-bottom:0.5rem">click to generate "palm tree"</div><div class="gen-demo-row" style="display:flex;gap:1rem"><div style="flex:0 0 50%;aspect-ratio:1"><svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block;background:var(--bg);border:1px solid var(--fg);border-radius:0"><defs><pattern id="grid-gen" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="none" stroke="var(--fg)" stroke-width="0.03" opacity="0.12"/></pattern></defs><rect width="24" height="24" fill="url(#grid-gen)"/><g class="gen-loading" style="display:none"></g><g class="gen-result" style="display:none"><path class="gen-trunk" d="M10 22C9.33334 18 9.66667 14.3333 11 11C11.6667 10.3333 12.3333 10.3333 13 11C14.3333 14.3333 14.6667 18 14 22H10Z" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none"/><path class="gen-frond" d="M12 8C9.33333 6 6.33333 5 3 5" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none"/><path class="gen-frond" d="M12 8C14.6667 6 17.6667 5 21 5" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none"/><path class="gen-frond" d="M12 8C10.6667 4.66667 8.66667 2.66667 6 2" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none"/><path class="gen-frond" d="M12 8C13.3333 4.66667 15.3333 2.66667 18 2" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none"/><path class="gen-frond" d="M12 8C10 8.66667 8 10 6 12" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none"/><path class="gen-frond" d="M12 8C14 8.66667 16 10 18 12" stroke="#FF00FF" stroke-width="2" stroke-linejoin="round" fill="none"/></g></svg></div><div style="flex:1;position:relative"><pre class="gen-code" style="position:absolute;inset:0;margin:0;overflow-y:hidden"><code class="gen-code-output"></code></pre></div></div></div>

### evals

evals deserve their own section. to measure progress and test various models, I added an eval pipeline. each run generates a batch of icons from the same set of prompts, scored on validity (does it parse), grid alignment, stroke consistency, path efficiency, and visual similarity to the reference. it makes prompt changes measurable and helps me keep my wits about me.

### tuning

a valid SVG renders. a production SVG _belongs_ — it matches stroke weights across a library, aligns to the pixel grid so it doesn't blur at small sizes, and uses the minimum path commands to describe the shape.

I run generations against existing libraries, compare stroke weights, measure corner radii, compare outputs on originals. batch after batch refining the system prompt.

<video src="/media/svg maker/snowhat-trimmed.mp4" autoplay muted loop playsinline></video>

things I've learned:

**path simplification matters.** the model sometimes outputs dozens of segments where four would be more resonable. a circle doesn't need 12 cubic béziers — it needs two arcs. `H` and `V` for straight horizontal/vertical lines instead of `L`. `S` for smooth curves that mirror the previous control point.

**the viewBox is sacred.** anything outside it gets clipped. anything too small inside it looks lost. key
  shapes should fill 80-90% of the grid.

**naming creates understanding.** labeling paths — `<!-- left-wing -->`, `<!-- envelope-flap -->` — makes edits smarter. the model can "find the handle and make it longer" instead of guessing which segment to modify.

<!-- [placeholder: before/after comparison — early generation vs refined output, same prompt] -->

### what's next

the system prompt has gotten me pretty far, but there's a ceiling. the model is interpreting instructions about drawing, not learning from the drawings themselves.

the next step is supervised fine-tuning. take the thousands of hand-drawn SVGs from existing libraries, pair each with a natural language description, and train the model on that mapping directly. not "here are rules about how to draw" but "here are ten thousand examples of what good looks like."

SFT won't replace the system prompt. it'll replace the need for the prompt to carry so much weight. the prompt focuses on _what_ to draw, the model already knows _how._

oh also I would like to make the ui less brutalist.
