# asset cabinet
_semantic search for a cross-brand icon library_

everyone at block searches for icons the same way: type a word, scroll through bad results, give up, ask a designer. fuzzy string matching hasn't meaningfully improved in years — and with thousands of icons across cash app, tidal, and block inc, the problem only gets worse

### the goal

build a search that understands intent, not just keywords. if someone searches "send money to a friend," surface the peer-to-peer transfer icon — even if no tag says "friend"

<video src="/media/cabinet/main.mp4" autoplay loop muted playsinline></video>

### why embeddings

keyword search fails when people describe what an icon *does* rather than what it's *called*. I used multimodal embeddings to encode every icon's visual form and text metadata into a shared vector space — so search works by meaning, not string matching

<!-- [placeholder: diagram showing keyword search vs. semantic search — same query, different results] -->

### choosing the model

not all embeddings are equal. I benchmarked several models against real search queries from the design team, running structured evals to compare precision and recall across edge cases

<img src="/media/icons-mcp/evals1.png" alt="evals" />

<img src="/media/cabinet/evals-3.png" alt="evals" />

the eval framework measured three things: did the right icon appear in the top 3? did related icons rank higher than unrelated ones? and how did cross-brand queries perform — searching for a cash app concept and getting the right tidal equivalent?

### debug mode

tuning search quality without visibility is guessing. I built a debug overlay to inspect similarity scores, vector distances, and ranking breakdowns in real time

<img src="/media/cabinet/debug.png" alt="debug" />

this became the primary tool for iterating on the embedding pipeline — adjusting weights, testing tag strategies, and catching regressions

### exploring the edges

with semantic search working, I pushed into more experimental territory: visual similarity browsing (click an icon, see what "looks like" it), auto-categorization, and cross-library deduplication

<video src="/media/cabinet/wild-1.mp4" autoplay loop muted playsinline></video>

<img src="/media/cabinet/wild-2.png" alt="wild" />

<!-- [placeholder: before/after comparison — old search results vs. new for the same 3-4 queries] -->

### outcome

asset cabinet went from a basic keyword lookup to the internal search tool for icons across block. it also became the foundation for <a href="#icons-mcp">icons-mcp</a> — extending the same search to AI agents
