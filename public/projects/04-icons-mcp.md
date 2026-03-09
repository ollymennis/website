# icons-mcp
_an icon server for AI agents_

icons are a consistency tax. every time someone builds a feature, they manually sift through libraries, pick something close enough, and move on. multiply that across every engineer, every AI coding tool, every ticket — and you're spending real hours on what should be automatic

<hr />

### the idea

what if AI agents could search, match, and generate icons on their own? not by memorizing an icon list, but by understanding what the product needs in context

icons-mcp is a pipeline-agnostic server that gives any AI tool — chat interfaces, coding agents, CI bots — the ability to work with icons through natural language

<img src="/media/icons-mcp/vibecode-example2.png" alt="vibecode example" />

### architecture

the server combines two tools I built separately:
<a href="#asset-cabinet">asset cabinet</a> + <a href="#svg-maker">svg maker</a> 

semantic multimodal searches across all icon sets at Block, using vector + full-text search with confidence scoring. compound queries auto-decompose into facets. cross-brand resolution maps icons between cash app, square, goose, tidal, and proto automatically. when no existing icon fits, the LLM can decide whether generating a new one from a text prompt is the ideal next step. the generator produces SVGs that match the target library's style constraints*


<!-- [placeholder: simple architecture diagram showing the two systems feeding into the MCP server, with arrows to the various consumer tools] -->

### where it lives

the server plugs into any tool that speaks MCP. here are three real integrations:

### goose (internal chatbot)

builders describe what they need in conversation. the agent searches across libraries, returns matches with confidence scores, and can generate alternatives

<img src="/media/icons-mcp/goose.png" alt="goose" />

### linearbot

I built a linear integration that monitors incoming tickets and auto-suggests icon mappings. when a ticket mentions needing an icon for a new feature, the bot responds with the best matches from existing libraries

<div class="video-crop-sides"><video src="/media/icons-mcp/linearbot.mp4" autoplay muted playsinline data-start-at="5" data-loop-at="20"></video></div>

### claude code, single-prompt generation

a single prompt to claude code can generate an entire set of labeled phrases and auto-select matching icons for each — no manual browsing

<video src="/media/icons-mcp/pills-minute-trimmed.mp4" autoplay loop muted playsinline></video>

<!-- [placeholder: short screen recording of the MCP being invoked in a real coding session — Cursor or Claude Code — showing the agent selecting an icon mid-implementation] -->

### decisions along the way

**why MCP over a REST API?** MCP lets AI agents discover capabilities dynamically. the server describes what it can do, and the agent decides when to use it — no hardcoded integration per tool

**confidence thresholds.** when should the agent auto-select vs. present options? I tuned thresholds so high-confidence matches (>0.85) are applied directly, while lower scores surface a shortlist for human review

**generation as fallback, not default.** generating a new icon is always second choice. the system exhausts search first because consistency matters more than novelty — the best icon is usually one that already exists in the library

### outcome

icons-mcp turns icon selection from a manual task into an ambient capability. it's not a tool people open — it's infrastructure that other tools use. the same search that powers a designer in goose also powers a CI bot checking icon consistency across PRs
