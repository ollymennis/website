# asset cabinet
_semantic search for a cross-brand icon library_

designers and engineers at block search for icons the same way: type a word, scroll through bad results, give up, slack the systems team. fuzzy string matching hasn't meaningfully improved in years, and with thousands of icons across cash app, square, goose, tidal, and proto, the problem only gets worse

<div class="cabinet-demo cabinet-demo-loop" id="cabinet-demo">
  <svg style="position:absolute;width:0;height:0"><defs>
    <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"/>
    </filter>
  </defs></svg>
  <div class="cabinet-title">block icons</div>
  <div class="cabinet-search"><img class="cabinet-search-icon" src="/media/cabinet/search.svg" alt="search" /><span class="cabinet-search-text">|</span></div>
  <div class="cabinet-pills" style="filter:url(#goo)">
    <span class="cabinet-pill active">all</span>
    <span class="cabinet-pill">cash app</span>
    <span class="cabinet-pill">square</span>
    <span class="cabinet-pill">goose</span>
    <span class="cabinet-pill">proto</span>
    <span class="cabinet-pill">tidal</span>
  </div>
  <div class="cabinet-results">
    <div class="cabinet-result-card"><div class="cabinet-result-name">jewelry</div><div class="cabinet-result-brand">cash app</div><img src="/media/icons-refresh/icon-svgs/categoryJewelry24.svg" alt="jewelry" /></div>
    <div class="cabinet-result-card"><div class="cabinet-result-name">shoes</div><div class="cabinet-result-brand">cash app</div><img src="/media/icons-refresh/icon-svgs/categoryShoes24.svg" alt="shoes" /></div>
    <div class="cabinet-result-card"><div class="cabinet-result-name">fitness</div><div class="cabinet-result-brand">cash app</div><img src="/media/icons-refresh/icon-svgs/categoryFitness24.svg" alt="fitness" /></div>
    <div class="cabinet-result-card"><div class="cabinet-result-name">media</div><div class="cabinet-result-brand">cash app</div><img src="/media/icons-refresh/icon-svgs/categoryMedia24.svg" alt="media" /></div>
  </div>
</div>

<hr />

### the goal

build a search that understands intent, not just keywords. if someone searches "send money to a friend," surface the peer-to-peer transfer icon - even if no tag says "friend"

<div class="video-crop"><video src="/media/cabinet/blockicons.mp4" autoplay loop muted playsinline onloadedmetadata="this.playbackRate=1.5"></video></div>

### why embeddings

keyword search fails when people describe what an icon *does* rather than what it's *called*. I used multimodal embeddings to encode every icon's visual form and text metadata into a shared vector space — so search works by meaning, not string matching

<!-- [placeholder: diagram showing keyword search vs. semantic search — same query, different results] -->

### choosing the model

not all embeddings are equal. I benchmarked several models against real search queries ( + a few fascinating queries I picked up along the way), running structured evals to compare precision and recall across edge cases

<img src="/media/icons-mcp/evals1.png" alt="evals" />

<img src="/media/cabinet/evals-3.png" alt="evals" />

the eval framework measured three things: did the right icon appear in the top 3? did related icons rank higher than unrelated ones? and how did cross-brand queries perform - searching for a cash app concept and getting the right square equivalent?

### debug mode

tuning search quality without visibility is guessing. I built a debug overlay to inspect similarity scores, vector distances, and ranking breakdowns in real time

<img src="/media/cabinet/debug.png" alt="debug" />

this became the primary tool for iterating on the embedding pipeline — adjusting weights, testing tag strategies, and catching regressions

### exploring the edges

with semantic search working, I pushed into more experimental territory:

<video src="/media/cabinet/wild-1.mp4" autoplay loop muted playsinline></video>

<img src="/media/cabinet/wild-2.png" alt="wild" />

<!-- [placeholder: before/after comparison — old search results vs. new for the same 3-4 queries] -->

### outcome

asset cabinet went from a basic keyword lookup to the internal search tool for icons across block. it also became the foundation for <a href="#icons-mcp">icons-mcp</a> — extending the same search to AI agents
