# quarto
_an embedding visualizer_

quarto maps shakespeare passages into a shared vector space using embeddings. passages that are semantically similar cluster together

<iframe src="/media/quarto/index.html" class="quarto-embed" style="width:100%;height:380px;border:none;border-radius:12px" loading="lazy"></iframe>
<hr />

### how it works

each passage is embedded into a 1,536-dimensional vector using cohere's embed-v4.0 model

the visualization renders ~1,900 particles across 106 passage clusters using three.js with custom shaders, bloom post-processing, and cursor-reactive physics

### categories

passages are tagged across seven themes: love & desire, wisdom & reflection, madness & despair, tragedy & death, comedy & wit, ambition & power, and magic & wonder. each category has a distinct color, but the spatial positioning comes entirely from the embeddings, not the labels

### the full version

the full version includes a semantic search input — type any phrase and an API call embeds your query, projects it into the same space, and highlights the three most similar passages with cosine similarity scores

<img src="/media/quarto/screenshot.png" alt="quarto" />
