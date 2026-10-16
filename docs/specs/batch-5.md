# Kestrel Deep - Batch 5: Art pass

Status: READY TO SEND (owner approved the sprite study, October 2026)

Save this file in the repository as `docs/specs/batch-5.md`, and save the sprite study next to it as `docs/art/sprite-study.html`.

**When to run it:** after Batch 3. It is best done **before Batch 4**, because Batch 4 (armed humans) draws held weapons and armour on guards and husks, and should build on the new person drawing from this batch. If Batch 4 has already started, finish its current session first.

## The reference: `docs/art/sprite-study.html`

The sprite study is a single HTML page made in the planning chat. Open it in a browser to see every proposed sprite next to today's, at game scale, with toggles for lighting, double detail and outlines. **Its `<script>` is the reference code:** every proposed sprite is drawn by a plain canvas function written the way the game draws (12 px tiles, `fillRect`, ellipses, no images). Port those functions into the game; do not load or embed the page.

- The "today" sprites on the page are simplified recreations of the v0.78 drawing. They are only there for comparison. The game's own drawing code is the truth for **what overlays and states must keep working** (hit flash, daze stars, frozen shell, burning, charge rings, swing arcs, muzzle flash, cloak, health bars, and so on).
- The page's **Rules for the style** section is the style guide for any sprite not drawn on the page (other creatures, bosses, Batch 3 and 4 additions, future content).
- The owner keeps the live copy of the study in the planning chat and will send updated copies of the file when the art changes. Do not edit it in the repository except to replace it with a newer copy.

## Owner's decisions

- **Player:** take A, the **survey tech** (orange survey suit, white helmet with a lamp, sample pack). Takes B (scavenger) and C (hardsuit) are not used now; they stay on the page as starting points for future starter archetypes or crew.
- **People** (player, crew, guards) are drawn from **one shared body** (`person()` on the page): head and shoulders from straight above, feet that step out while walking, arms that hold the weapon, headgear and props per person. People stay clean-edged with a two-tone bevel.
- **Armaments:** every armament has its own silhouette and colour, sits in the hand that holds it and shows how it works (kick, pump, draw, jab, lash, rev); each also has its own floor sprite as a pickup instead of one generic weapon icon. The industrial blower and stun gun (Batch 3) are designed on the page too.
- **Creatures** are painted: a cluster of small dabs in four tones of their own colour (`paint()` and `dabs()`), lit from one side, no black outline. Each has one signature movement.
- **Light side:** tones face the light. On lit decks the light is overhead from the top left; on dark decks it is the player's lamp (the direction from the sprite to the player).
- **Glow tells danger:** anything that gives off light (spitter sac, spider eyes, guard flashlights, screens, signs, status lights, chest locks) gets a soft halo and stays readable through darkness.
- **Crew NPCs** are redrawn top-down with their props and an idle activity (today they are drawn from the front, a different camera from the rest of the game).
- **Tiles and biome kits:** the proposed tiles (soft shading where floor meets wall, lit wall tops, rust streaks, slat highlights), organised into **biome kits**. Shared styles: 7 floor styles (plated panels, tread plate, poured concrete, perforated plate, ceramic tile, ribbed mats, duckboards), 3 corridor styles (slatted grates, mesh catwalks, cross grilles) and 6 wall styles (pipework, riveted bulkheads, concrete with conduit, white subway tile (five rows of thin tiles), corroded plate, equipment racks). Each biome mixes them in its own proportions (`KITS` in the study): each room picks one floor style by weight, corridors use the biome's corridor style, and each run of wall picks a wall style by weight.
- **Room lights:** each biome has its own kind of room light, with its own colour, pool shape and steadiness: Intake hanging sodium lamps (warm, round pools, steady), Pump Hall caged wall lamps (half-circle pools thrown down from the wall, a few flicker), Sorting Floor fluorescent strips (long pools, one occasionally buzzes out), Cold Store square ceiling panels (cold white, steady), Brine Works failing teal lamps (sparse, pulsing), Relay Core violet status strips along wall bases (small, slowly pulsing, plus blinking rack lights). Between pools, lit decks dim slightly. Ceiling lights hang above everything as a see-through layer you walk under; wall lights sit on the walls.
- **Liquids:** water becomes a smooth depth field (shores follow the depth, not the tile grid) with a wet shore line, light rippling in the shallows, slow swells in the deep and drifting glints, tinted per biome. Ice, oil, toxic spills, slime trails and molten slag get soft edges and their own surface and motion.
- **Anomalies:** two looks. **Unstable** (irregular hiccups) on all decks except electrical ones; **crackling** (bursts of forked arcs) on electrical decks.
- **Items** get a soft pool of their category's colour underneath and a sweeping shine. **Interactables** get top-left shading, lit top edges, floor shadows and halos on their lights.
- **Outlines option:** a setting in Options, off by default, that draws a one-pixel outline around every sprite in a brightened version of its own main colour (never black).
- **Not decided:** drawing the world at double resolution (the study's "double" toggle). Do not change the canvas resolution in this batch.

## How to work through this batch

Do **one session at a time**:

1. Read CLAUDE.md, this file and the sprite study (open it in a browser and read its script), then do only the current session.
2. Test in a browser before committing: `npm run build` must pass, then no errors on the title screen, a new run, the test range and the arcade, plus the session's own "Done when" checks.
3. **Performance check every session:** a busy Large deck must still hold 60 fps in headless Chromium, measured the way CLAUDE.md describes (hunter, alarm, gas grenades, ~30 creatures). Painted creatures cost more draw calls than circles; if a type is too expensive, reduce its dab count before anything else.
4. Update both version histories (the `VERSIONS` array in `src/data/versions.js` and the changelog comment at the bottom of `src/index.html`), `README.md`'s file list and CLAUDE.md (add an "Art style" section pointing to `docs/art/sprite-study.html` and its rules).
5. Commit with a clear message, then **stop**. Post a short summary: what changed, how to see it in-game, anything you had to decide, and anything left unfinished.
6. Wait for the owner to playtest and say "continue" before starting the next session.

If something on the page conflicts with how the game actually works, keep the game's behaviour, match the look as closely as possible, and note it in the summary.

**Conventions:** shared drawing helpers go in a new game file (for example `src/game/39-sprites.js`: `ell`, `line`, `dabs`, `paint`, `person`, `HATS`, `glow`, `vshade`); colour ramps, people configs, outline colours and item categories go in a new data file (for example `src/data/art.js`). Dab layouts are made once per creature type and reused (as `dabs()` does), never rebuilt per frame. Keep sprite sizes and footprints as they are now: collision radii and tile sizes do not change.

| Session | Work | Size |
|---|---|---|
| 1 | Drawing toolkit, the player and armaments | Medium-large |
| 2 | Creatures | Large |
| 3 | Crew, guards, tiles and biome kits, room lights, anomalies | Large |
| 4 | Liquids | Medium |
| 5 | Items, armament pickups, interactables and the outlines option | Medium |

---

# Session 1: Drawing toolkit, the player and armaments

- Port the shared helpers from the study into `39-sprites.js` and the data into `art.js`.
- Add `spriteLight(x,y)`: the direction toward the light for a sprite at x,y (top left on lit decks, toward the player on dark decks; use the same lighting condition the renderer already uses).
- Replace the body drawing in `drawPlayerBody()` with `person()` and the survey tech config (`PEOPLE.a`). Keep the gameplay overlays the current function draws: blocking arcs, charge ring and perfect-release flash, swing arcs, shove and tackle arcs, laser and beam dots, cloak transparency.
- **Armaments in hand:** replace the weapon lines and shapes with the armament drawings from the study (`WD` in the armaments section; each is drawn from its grip pointing forward) and the hand positions from `armPose()`. Drive each one from real game state, not from a timer as the page does: muzzle flash and recoil when a shot is fired (`flashT`), the bow's draw from `p.chg`, the spear from `jabT`, the whip from `lashT`, the chainsaw's rev and sparks while it is running, the soaker's stream while firing, the shield raised while blocking, the ray gun's glow from its charge. A main-hand armament and an off-hand gun are held at the same time: melee in the right hand at the side, the gun forward in the left (two-handed armaments use both hands). If the industrial blower and stun gun (Batch 3) exist by then, draw them from `WD.blower` and `WD.stun`.
- Map game state to the pose: holding a gun or aiming → arms `aim`; a melee swing in progress (`swingT`) → arms `swing`, timed to the real swing; otherwise `rest`. `walk` when the player is moving (feet speed from movement speed). Two-handed weapons use both hands.
- Keep the existing tints: hurt, adrenaline, NVG head colour. The helmet lamp pixel faces the aim.
- Test range: nothing new needed; the player is always on screen.

**Done when:** the player reads as a person seen from above in every pose (idle, walk, aim, swing), every armament is drawn in hand and animates from real use, all existing overlays still show, and the busy Large deck holds 60 fps.

---

# Session 2: Creatures

- Redraw the nine creatures on the page from their reference functions: husk, crawler, spitter, brute, bog frog, bloom wasp, ghost, slug, duct spider. (The security guard moves to Session 3 with the other people.)
- Redraw **every other creature** with the same rules, using the closest page creature as a model: sludge and blight slugs (from the slug), plated snail, snakes and arc snakes, charger, lurker, grasper, snare, pod and trip plants, drones, and any Batch 3 creatures that exist by then (riot drone). Wardens, bosses and hunters follow the rules with more dabs and their own signature movement; keep their health bars and attack tells.
- Each creature type gets a four-tone ramp in `art.js`. Keep every existing state overlay working on top of the new bodies: hit flash (draw the body in its lightest tone or pale for the flash), daze stars, frozen ice shell, burning, poison or slime marks, alert "!" and the grey "?" from hunt memory, guard and drone cones.
- Emissive parts (spitter sac, spider eyes, arc snake pulse, drone lights, ghost) also draw after the darkness pass so they read through the dark, as the study's dark deck does.
- The bestiary and creature console use the same drawing, so they update automatically; check they still frame each creature well.

**Done when:** every creature uses the painted style with its signature movement, all overlays still show, emissive parts read on dark decks, and the busy Large deck holds 60 fps.

---

# Session 3: Crew, guards, tiles and biome kits, room lights, anomalies

- **Crew:** replace the front-facing NPC drawing (the `npc` and `psychic` fixtures) with the top-down crew from the study: scrap trader, quartermaster, galley cook, Subject Nine, demolition tech, locksmith, KR-7 android, mech pilot, inspector and the bone gambler at gambler stops. Each faces down (toward the bottom of the screen) with its props and idle activity. NPCs added after v0.78 that are not on the page get a top-down version in the same style; list them in the summary so the owner can review them in the study later.
- **Security guards** use `person()` with the guard config: cap, sidearm, flashlight. The head turns with the guard's existing look direction and the existing cone follows it. Riot guards (Batch 3) use the same body with darker armour and a gas mask.
- **Tiles and biome kits:** replace `grateFloor()`, `roomFloor()` and `wallTile()` with the kit system from the study (`KITS`, `KIT_WORDS` and `tilesKit()`; put `KITS` in `src/data/art.js` or next to `BIOME` in `src/data/world.js`). Each room picks its floor style by weight inside the deck's seeded scope (so the same seed gives the same floors); module rooms (labs, greenhouses, washrooms and so on) keep their own floors. Keep every existing variant (vents, puddles, cracks, rust, warning stripes, cables, below-deck rooms) and every biome palette. Tiles draw into the cached tile canvas, so they cost nothing per frame. Blinking rack lights on Relay Core walls are the one animated part: draw them in a light per-frame pass (positions collected when the tiles are drawn, as `LEDS` does in the study), only for those on screen.
- **Room lights:** place each biome's lights at generation (seeded), following `placeLights()` in the study: per room, by the biome's light style, plus a few in corridors. Draw them as in `drawLights()` and `drawCeiling()`: a mild dimming layer with the light pools cut out of it and a faint coloured glow in each pool, drawn over the floor, creatures and player (so they are lit in the pools and dimmer between them). **Ceiling fixtures** (sodium lamps, fluorescent strips, ceiling panels, teal lamps) are drawn **last, above everything**, mostly see-through (about 40%, the lit part a little stronger) with a hanging cable and a slight parallax away from the screen centre, so the player and creatures walk under them. **Wall fixtures** (caged lamps, status strips) stay on the walls and draw with the walls. Clip each pool to its room (or stop it at walls) so light does not spill onto wall tops as it does on the study page. **They are visual only:** they do not change `cond.light`, the player's light radius, fog or creature sight. On **dark decks** the fixtures are dead (unlit housings), except about one in ten that flickers weakly. The **Blackout** scenario (Batch 3, Request 16), if it exists by then, uses the same dead fixtures. Pulsing and flicker come from `lightLevel()`; keep flicker irregular, never on a fixed beat.
- **Anomalies:** replace the anomaly drawing in the render loop with `anomNew()` (unstable) on all decks and `anomCrack()` (crackling) on decks whose hazard is electrical. Keep each anomaly's own state on the anomaly object (not a shared global as on the page), and keep its existing pull, damage and radiation untouched. The sideways "tear" in `anomNew()` reads back pixels from the canvas; if that is slow or awkward in the game's renderer, replace it with a cheaper effect (for example two thin colour-split lines) and say so.

**Done when:** crew and guards are top-down people with props, each biome shows its own mix of floors, walls and room lights (and the same seed gives the same mix), lights are dead on dark decks, unstable and crackling anomalies appear on the right decks, and the busy Large deck holds 60 fps.

---

# Session 4: Liquids

- **Water:** replace the stacked-square look of `waterLayer()` and `puddle()` with a smooth depth field baked into the cached tile canvas, as `bakeWater()` does in the study: depth blended between tile centres (puddles count as a little over half a step), a colour ramp from shallow to swimming depth, a slight damp darkening just outside the shore and a pale wet line at the shore. Colours come from the biome's water tint (`WATER_TINT` in the study, one per biome, in `art.js`). Whenever water changes during a deck (flooding, drains, freezing), re-bake only the tiles around the change. Gameplay depths (`LIQ`, `LIQNAME`) do not change.
- **Moving water:** a light per-frame layer over water that is on screen: caustic light in the shallows, slow darker swells in the deep, a few drifting glints (`liqNew()` water part). Existing ripples, splashes and the lurker's ripple stay as they are.
- **Ice:** frozen tiles draw as one soft-edged patch (`blobPath()`) with a white rim, frost, trapped bubbles, cracks and an occasional sparkle; the water under ice is not drawn.
- **Oil:** keep the existing slick shapes (`drawOil()` anchors and joins), darker, with thin-film colours sliding across them drawn on their own layer so the colours stay on the oil, and a faint sheen. Burning oil is unchanged.
- **Toxic spills:** soft-edged pools with a bright rim, a darker middle, bubbles that rise and pop, and a little fume.
- **Slime trails:** a glossy, see-through ribbon with a highlight that creeps along it and the odd droplet (keep `drawSlime()`'s path shapes and both slime kinds' colours).
- **Molten slag:** the hot core as one soft-edged pool with dark crust plates drifting on it, sparks and a heat glow on its surroundings; cooled slag as dark glass with cracks that glow and fade.
- Animated parts only run for tiles on screen.

**Done when:** water shows smooth depth and shores in every biome with its tint and gentle motion, ice, oil, toxic spills, slime and slag use the new look, flooding and freezing during a deck update the water correctly, and the busy Large deck holds 60 fps.

---

# Session 5: Items, armament pickups, interactables and the outlines option

- **Armament pickups:** weapons on the floor use their own armament drawing lying on its side (`armOnFloor()`) with the gear category pool, instead of the one generic weapon icon.
- **Items:** replace `drawItem()` cases with the proposed versions (`itemNew()`), including the category pool underneath (categories in `art.js`: ammo, materials, medical, food, keys and data, weapons and gear) and the sweeping shine. Items not on the page (quick items, tufts, tonics, sigils, newer items) follow the same rules: same size, lit from the top left, category pool.
- **Interactables:** redraw the barrel, crate, chest and rare chest, locker, hack panel, vending machine, lever, breaker, workbench, grinder, med station, freezer, ammo dispenser, arcade cabinet, lift camera, floor hatch and wall fan from `fixNew()`, keeping every state they show today (used, opened, dead, empty, spinning, fuse, power off). Other fixtures (furniture, trap plates, crawlway hatches, security cameras from Batch 3) follow the same rules.
- **Outlines option:** add "Sprite outlines" (off / on, default off) to Options (`OPTS`, saved in `kd_opts`). When on, every sprite (player, creatures, people, items, interactables) gets a one-pixel outline around its **outer edge only** in its outline colour (`OLC` in the study: a brightened version of its main colour; items use their category colour). Soft shadows, glows and gaps between paint dabs are not outlined. The study builds each outline from scratch every frame (`OL()`), which is too slow for the game: instead, draw the sprite to a small offscreen canvas, build the silhouette ring from its solid pixels, and cache it per sprite type and animation frame (or per frame for the few sprites that change shape continuously), so the option costs little.
- Codex: a short Systems entry or Options note explaining the outline setting.

**Done when:** items and interactables use the new look with every state intact, the outlines option works for every sprite and is saved, and the busy Large deck holds 60 fps with outlines both off and on.
