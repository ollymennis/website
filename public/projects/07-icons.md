# icons
_redesigning 1,000+ icons to speak the same language as söhne_

cash app's icon library grew the way most do — organically. different designers, different years, different briefs. some icons had rounded caps, others were sharp. stroke weights varied. optical sizing was inconsistent. individually they were fine. together they argued

the brief was to unify them. but unify to what?

### the typeface was the answer

cash app uses söhne — a typeface by kris sowersby at klim. söhne is a geometric sans-serif, but not a cold one. it descends from akzidenz-grotesk, the late-19th-century typeface that predated helvetica by decades. where helvetica pursued perfection, akzidenz kept its irregularities. söhne inherits that tension: precise construction, human warmth

that tension became the design principle for the icon set

### a brief history

icons and type have always evolved together. the earliest pictographic writing systems — sumerian cuneiform, egyptian hieroglyphs — were icons. the alphabet itself is a set of icons abstracted beyond recognition. the letter A is an upside-down ox head

in the digital era, susan kare drew the original macintosh icons on a pixel grid, the same way type designers drew bitmap fonts. she understood that icons are letterforms for concepts — they need the same optical corrections, the same attention to weight and rhythm

the best icon systems have always derived their character from the typeface they sit beside. material icons echo roboto. sf symbols echo san francisco. the icon set should feel like it was drawn by the same hand that drew the type

### studying söhne

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

<div class="icon-intro-row"><img src="/media/icons-refresh/categoryTravel.svg" alt=""/><img src="/media/icons-refresh/biometricsFace.svg" alt=""/><img src="/media/icons-refresh/categoryHome.svg" alt=""/><img src="/media/icons-refresh/cardActive.svg" alt=""/><img src="/media/icons-refresh/fpoShrimp.svg" alt=""/><img src="/media/icons-refresh/qr.svg" alt=""/></div>

### spending categories

the biggest single group: 25 icons representing every spending category in cash app. food, travel, entertainment, fashion, tech. each one needs to be instantly recognizable at 16px in a transaction list and still hold up at 48px in a detail view

the challenge isn't drawing a coffee cup. it's drawing a coffee cup that looks like it belongs next to a shoe, a car, a house, and a basketball — at three different sizes, in two themes, across every screen in the app

### drawing process

I draw in figma, export to SVG, and hand-edit the paths. figma's SVG export is verbose — unnecessary transforms, decimal precision to six places, redundant groups. cleaning this up isn't vanity. every icon ships to every user on every screen. byte savings compound

a typical icon goes through 8–15 iterations. the first draft captures the concept. the next five fix optical issues — a stem that looks too thin, a counter that closes up at small sizes, a curve that doesn't quite match the rhythm of its neighbors. the last few are precision work: aligning to the pixel grid, simplifying paths, testing in context

### outcome

~1,000 icons redrawn. one design language. every icon derives its character from the typeface it sits beside — the same stroke logic, the same corner math, the same tension between geometric precision and human warmth that makes söhne what it is
