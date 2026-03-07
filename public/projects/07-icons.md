# iconography
_the quiet infrastructure behind 1,000 things you never notice_

design systems people get a reputation. grid nerds. pixel police. the ones who show up with a 40-page spacing spec and a strong opinion about border radius

the truth is closer to the opposite. systems designers need deep product understanding — not to control things, but to stay out of the way. you build connective tissue. you make the thing that lets other people move fast without thinking about whether their icon is 2px too heavy or their tap target is 4px too small

the best part of the job is the red team angle. you come in fresh. you see the inconsistencies that people who've been staring at the same screen for six months have stopped noticing. a stroke weight that drifts across a nav bar. an icon that visually shrinks next to its neighbors. spacing that works in a mockup but falls apart in a transaction list with real data

### icons don't exist alone

an icon never ships by itself. it lives inside a cell — a transaction row, a nav bar, a settings list. the icon is one actor in an ensemble. its size, weight, and spacing affect readability, tap targets, and visual rhythm

consider a transaction row. the icon sits at 24px, pinned left, vertically centered against a title and subtitle. if the icon is visually heavier than the text, it pulls the eye. too light, and it disappears. the spacing between icon and text — 12px — has to account for the icon's optical weight, not just its bounding box

<div class="cell-specimen" data-variant="transaction">
  <div class="cell-row">
    <div class="cell-icon"><img src="/media/icons-refresh/icon-svgs/categoryCafe.svg" alt=""/></div>
    <div class="cell-text">
      <div class="cell-title">Blue Bottle Coffee</div>
      <div class="cell-subtitle">Mar 4</div>
    </div>
    <div class="cell-amount">- $5.50</div>
  </div>
  <div class="cell-row">
    <div class="cell-icon"><img src="/media/icons-refresh/icon-svgs/categoryGrocery.svg" alt=""/></div>
    <div class="cell-text">
      <div class="cell-title">Trader Joe's</div>
      <div class="cell-subtitle">Mar 3</div>
    </div>
    <div class="cell-amount">- $47.23</div>
  </div>
  <div class="cell-row">
    <div class="cell-icon"><img src="/media/icons-refresh/icon-svgs/categoryTransportation.svg" alt=""/></div>
    <div class="cell-text">
      <div class="cell-title">MTA</div>
      <div class="cell-subtitle">Mar 3</div>
    </div>
    <div class="cell-amount">- $2.90</div>
  </div>
</div>

a nav bar is a different problem. icons sit at 24px in a horizontal row with labels below. here the challenge is that five different icon shapes — home, search, card, activity, profile — need to feel like they have equal visual weight despite having wildly different geometries. a filled house is denser than a line-drawn magnifying glass

<div class="cell-specimen" data-variant="nav">
  <div class="cell-nav">
    <div class="cell-nav-item"><img src="/media/icons-refresh/icon-svgs/categoryHome.svg" alt=""/><span>Home</span></div>
    <div class="cell-nav-item"><img src="/media/icons-refresh/icon-svgs/qr.svg" alt=""/><span>Scan</span></div>
    <div class="cell-nav-item"><img src="/media/icons-refresh/icon-svgs/cardActive.svg" alt=""/><span>Card</span></div>
    <div class="cell-nav-item"><img src="/media/icons-refresh/icon-svgs/notifications.svg" alt=""/><span>Activity</span></div>
    <div class="cell-nav-item"><img src="/media/icons-refresh/icon-svgs/avatar.svg" alt=""/><span>Profile</span></div>
  </div>
</div>

### the typeface was the answer

cash app uses söhne — a typeface by kris sowersby at klim. söhne is a geometric sans-serif, but not a cold one. it descends from akzidenz-grotesk, the late-19th-century typeface that predated helvetica by decades. where helvetica pursued perfection, akzidenz kept its irregularities. söhne inherits that tension: precise construction, human warmth

that tension became the design principle for the icon set

### the rules

I spent time pulling söhne apart. measuring its stroke contrast (low but present). cataloging its terminals (most are perpendicular cuts, not rounds). noting its corner treatments (tight radii, not sharp, not circular). examining its counter shapes — the enclosed negative spaces inside letters like 'e', 'a', 'g'

these became the rules:

+ stroke weight: 2px on the 24px grid — matches söhne's stroke-to-height ratio at body sizes
+ terminals: perpendicular cuts, consistent with söhne's character endings
+ corners: 2px radius — tight but not sharp, matching the subtle rounding in söhne's joints
+ optical weight: larger icons get proportionally thinner strokes so density stays even at any size
+ counter shapes: open where possible, letting the icon breathe the way söhne's counters do

### the grid

every icon lives on a 24×24 unit grid with a 2px live area boundary. content sits within a 20×20 optical frame, with allowances for elements that need visual overshoot — circles extend to the edge because a 20px circle looks smaller than a 20px square

the grid isn't a cage. it's a metronome. it sets the rhythm so the hand can play freely within it

<div class="icon-intro-row"><img src="/media/icons-refresh/icon-svgs/categoryTravel.svg" alt=""/><img src="/media/icons-refresh/icon-svgs/biometricsFace.svg" alt=""/><img src="/media/icons-refresh/icon-svgs/categoryHome.svg" alt=""/><img src="/media/icons-refresh/icon-svgs/cardActive.svg" alt=""/><img src="/media/icons-refresh/icon-svgs/fpoShrimp.svg" alt=""/><img src="/media/icons-refresh/icon-svgs/qr.svg" alt=""/></div>

### icons in context

changing an icon changes the component. an icon refresh isn't just a design systems task — it's a product-wide spacing audit. when you redraw an icon with different optical weight, you might need to adjust the padding around it. when you change a terminal from round to square, the icon's visual center shifts

<div class="cell-specimen" data-variant="titlebar">
  <div class="cell-titlebar">
    <div class="cell-icon"><img src="/media/icons-refresh/icon-svgs/next.svg" alt="" style="transform:rotate(180deg)"/></div>
    <div class="cell-titlebar-title">Activity</div>
    <div class="cell-icon"><img src="/media/icons-refresh/icon-svgs/notifications.svg" alt=""/></div>
  </div>
</div>

this is why systems designers need to understand the product. you're not just drawing icons in isolation — you're changing every screen they appear on. a 1px stroke weight change in an icon ripples through hundreds of components

### the full set

~1,000 icons redrawn. click any icon below to inspect it on the grid

<div class="icon-inspector" id="icon-inspector">
  <div class="inspector-grid">
    <div class="inspector-icon" data-icon="categoryCafe"><img src="/media/icons-refresh/icon-svgs/categoryCafe.svg" alt="categoryCafe"/><span>cafe</span></div>
    <div class="inspector-icon" data-icon="categoryTravel"><img src="/media/icons-refresh/icon-svgs/categoryTravel.svg" alt="categoryTravel"/><span>travel</span></div>
    <div class="inspector-icon" data-icon="categoryHome"><img src="/media/icons-refresh/icon-svgs/categoryHome.svg" alt="categoryHome"/><span>home</span></div>
    <div class="inspector-icon" data-icon="cardActive"><img src="/media/icons-refresh/icon-svgs/cardActive.svg" alt="cardActive"/><span>card</span></div>
    <div class="inspector-icon" data-icon="biometricsFace"><img src="/media/icons-refresh/icon-svgs/biometricsFace.svg" alt="biometricsFace"/><span>face id</span></div>
    <div class="inspector-icon" data-icon="qr"><img src="/media/icons-refresh/icon-svgs/qr.svg" alt="qr"/><span>qr</span></div>
    <div class="inspector-icon" data-icon="fpoShrimp"><img src="/media/icons-refresh/icon-svgs/fpoShrimp.svg" alt="fpoShrimp"/><span>shrimp</span></div>
    <div class="inspector-icon" data-icon="notifications"><img src="/media/icons-refresh/icon-svgs/notifications.svg" alt="notifications"/><span>notifications</span></div>
    <div class="inspector-icon" data-icon="location"><img src="/media/icons-refresh/icon-svgs/location.svg" alt="location"/><span>location</span></div>
    <div class="inspector-icon" data-icon="avatar"><img src="/media/icons-refresh/icon-svgs/avatar.svg" alt="avatar"/><span>avatar</span></div>
    <div class="inspector-icon" data-icon="categoryGrocery"><img src="/media/icons-refresh/icon-svgs/categoryGrocery.svg" alt="categoryGrocery"/><span>grocery</span></div>
    <div class="inspector-icon" data-icon="categoryEntertainment"><img src="/media/icons-refresh/icon-svgs/categoryEntertainment.svg" alt="categoryEntertainment"/><span>entertainment</span></div>
    <div class="inspector-icon" data-icon="categorySports"><img src="/media/icons-refresh/icon-svgs/categorySports.svg" alt="categorySports"/><span>sports</span></div>
    <div class="inspector-icon" data-icon="categoryFashion"><img src="/media/icons-refresh/icon-svgs/categoryFashion.svg" alt="categoryFashion"/><span>fashion</span></div>
    <div class="inspector-icon" data-icon="categoryTech"><img src="/media/icons-refresh/icon-svgs/categoryTech.svg" alt="categoryTech"/><span>tech</span></div>
    <div class="inspector-icon" data-icon="categoryAuto"><img src="/media/icons-refresh/icon-svgs/categoryAuto.svg" alt="categoryAuto"/><span>auto</span></div>
    <div class="inspector-icon" data-icon="categoryKids"><img src="/media/icons-refresh/icon-svgs/categoryKids.svg" alt="categoryKids"/><span>kids</span></div>
    <div class="inspector-icon" data-icon="categoryFurniture"><img src="/media/icons-refresh/icon-svgs/categoryFurniture.svg" alt="categoryFurniture"/><span>furniture</span></div>
    <div class="inspector-icon" data-icon="categoryBar"><img src="/media/icons-refresh/icon-svgs/categoryBar.svg" alt="categoryBar"/><span>bar</span></div>
    <div class="inspector-icon" data-icon="categoryDiy"><img src="/media/icons-refresh/icon-svgs/categoryDiy.svg" alt="categoryDiy"/><span>diy</span></div>
    <div class="inspector-icon" data-icon="bankAccount"><img src="/media/icons-refresh/icon-svgs/bankAccount.svg" alt="bankAccount"/><span>bank</span></div>
    <div class="inspector-icon" data-icon="deposit"><img src="/media/icons-refresh/icon-svgs/deposit.svg" alt="deposit"/><span>deposit</span></div>
    <div class="inspector-icon" data-icon="fast"><img src="/media/icons-refresh/icon-svgs/fast.svg" alt="fast"/><span>fast</span></div>
    <div class="inspector-icon" data-icon="idea"><img src="/media/icons-refresh/icon-svgs/idea.svg" alt="idea"/><span>idea</span></div>
    <div class="inspector-icon" data-icon="music"><img src="/media/icons-refresh/icon-svgs/music.svg" alt="music"/><span>music</span></div>
    <div class="inspector-icon" data-icon="photo"><img src="/media/icons-refresh/icon-svgs/photo.svg" alt="photo"/><span>photo</span></div>
    <div class="inspector-icon" data-icon="instant"><img src="/media/icons-refresh/icon-svgs/instant.svg" alt="instant"/><span>instant</span></div>
    <div class="inspector-icon" data-icon="governmentFlag"><img src="/media/icons-refresh/icon-svgs/governmentFlag.svg" alt="governmentFlag"/><span>flag</span></div>
    <div class="inspector-icon" data-icon="hyperlink"><img src="/media/icons-refresh/icon-svgs/hyperlink.svg" alt="hyperlink"/><span>link</span></div>
    <div class="inspector-icon" data-icon="traffic"><img src="/media/icons-refresh/icon-svgs/traffic.svg" alt="traffic"/><span>traffic</span></div>
  </div>
</div>

### outcome

~1,000 icons. one language. every icon derives its character from the typeface it sits beside — the same stroke logic, the same corner math, the same tension between geometric precision and human warmth that makes söhne what it is

the work is invisible when it's working. nobody notices that the cafe icon and the sports icon have the same stroke weight, or that the corner radius on the card icon matches the letter joints in the nav label next to it. that's the point. systems work is successful when nobody thinks about it
