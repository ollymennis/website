# icons-mcp
_contextual mapping + semantic search + svg generation_

icons are a consistency tax. humans sift through libraries manually, fuzzy search is bad, the pipeline is inflexible, and we're all sick of clicking

icons-mcp is a pipeline-agnostic icon server that gives ai agents the power to search, match, and generate icons

<div class="video-placeholder"></div>


it combines two tools I've recently built:

*arcade cabinet (see project 01 for semantic multimodal embeddings project) + a custom svg generator*


<div class="video-placeholder"></div>


### semantic icon search
_describe what you need in plain language and auto-map icons based on context_

below is an example of the mcp being utilized by a linearbot I built to respond to tickets with suggestions

<video src="/media/icons-mcp/linearbot.mp4" autoplay loop muted playsinline></video>

vector search + full-text search finds the best match across all icon sets with confidence scoring. multimodal embeddings fuse image + text + figma tags via cohere. compound queries auto-decompose into facets. cross-brand resolution maps icons between sets automatically.

### svg generation

when no existing icon fits, generate a new one from a text prompt.

<video src="/media/icons-mcp/snowhat-trimmed.mp4" autoplay loop muted playsinline></video>

low confidence search triggers generation suggestion automatically.

### one server, many clients

mcp over stdio for ai coding tools. http for bots and services. same search, same results.

claude code, goose, linear bot, slack bot, managerbot — all connected.

### vibecoding with icons-mcp

single-prompt projects that use the mcp to auto-select icons.

<video src="/media/icons-mcp/pills-minute-trimmed.mp4" autoplay loop muted playsinline></video>

### under the hood

three tools. one server. cohere multimodal embeddings fuse image + text + tags into a single vector per icon.

query → cohere embed → lancedb → rrf merge → results

sync_icons → figma api → export pngs → embed + index
