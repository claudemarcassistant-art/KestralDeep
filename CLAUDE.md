# Kestrel Deep

A top-down survival roguelike that runs in the browser. Survey station Kestrel went quiet 41 days ago; the player rides a lift down through its decks, scavenging, crafting and fighting, to find out why. One life per run.

Current version: **v0.80**. The game was built iteratively in claude.ai chats up to v0.78 and moved to this repository then.

## Current state of the code

- **Source lives in `src/`** and is built into **one self-contained HTML file**, `dist/index.html` (about 640 KB). No dependencies, no external assets. All art is drawn procedurally on a canvas; all sound is synthesised with the Web Audio API. The only network request is the optional Silkscreen font from Google Fonts in `src/boot.js` (the game falls back to a built-in font if it fails).
  - `src/index.html` is the page template; the build fills in `{{styles}}` (`src/styles.css`), `{{boot}}` (`src/boot.js`: font loader and the red error overlay) and `{{game}}`.
  - `src/data/*.js` are the content and tuning tables (creatures, weapons, items, recipes, food, crew files, achievements, NPCs, world, events, versions). Balance changes usually only touch these.
  - `src/game/NN-name.js` are 29 game files, split by system. `README.md` lists what each file holds.
  - `scripts/build.mjs` is the build (plain Node 20+, no npm install needed).
- **Play or test:** `npm run dev` serves http://localhost:5173 and rebuilds on every save (refresh the page). `npm run build` writes `dist/index.html`, which can also be opened straight from disk in Chrome or Edge.
- **Playable link:** https://claudemarcassistant-art.github.io/KestralDeep/ . Every push to `main` is built and deployed by `.github/workflows/pages.yml`; other branches and pull requests are built only, which catches syntax errors.
- The version history lives in two places and both must be updated with every change:
  - the `VERSIONS` array (newest first) in `src/data/versions.js`, shown in the in-game Version history screen. `GAME_VERSION`, shown on the title screen, is read from its first entry.
  - the plain-text changelog comment at the bottom of `src/index.html` (lines starting `v0.xx`)

## How the split works (design decision, v0.78)

- **The source files are not ES modules.** The build joins `src/data/*.js` and then `src/game/*.js`, each folder in filename order, inside one `'use strict'` closure, exactly as the original single `<script>` was. Every file shares one scope: any file can call any function, and any file can read and reassign the ~250 top-level `let` variables (`player`, `enemies`, `state`, `depth`, ...).
- Why: real ES modules cannot reassign another module's variables, so converting would have meant rewriting thousands of call sites with no tests to catch mistakes. The shared-scope split keeps behaviour identical: at the split, the build output was **byte-identical** to the original `kestrel-deep-v0.78.html`.
- The game files were cut at the original `// ---------- section ----------` comments, so a file's contents follow the old file's order rather than a clean system boundary (for example `drawActWorld()` sits in `03-equipment.js`). See "Where things live" below.
- **Data tables live in `src/data/` and load before all game code** (design decision, v0.78, done right after the split). 68 top-level tables were moved there unchanged; the build then had the same 736 top-level statements as the original, only reordered, and the play-test passed.
  - A table may hold callbacks (`ok:()=>...`, `make:()=>...`) that use game functions and state: those run later, so that is fine. What a table must not do is *use* game code or `let` state while it is being built (at load time), because the game files have not run yet. Calling a function declaration is allowed (they are hoisted), but only if that function does not touch state at load time.
  - Data files load alphabetically. Today no data file uses another file's tables at load time; if one ever must, put the table it needs in an earlier file or give the files number prefixes.
  - Derived indexes stay next to the code that uses them (for example `FILEBY` in `03-equipment.js` and `MODKD` in `05-levelgen.js`, built from `FILES` and `MODS`).
  - Left in `src/game/` on purpose: drawing and UI constants (`SLOTCOL`, `VSTYLE`, `GUNLEN`, `TITLE_OPTS`), test-range settings (`DECKOPT`), and tables that are mostly game logic (`ARC` arcade games, `HACKR` hack options).
- **Load order matters only for top-level code** (declarations and statements that run immediately). Function bodies can refer to anything. A new file needs a number placing it after everything its top-level code uses; renumbering is fine.
- The build syntax-checks the joined code and reports errors as `src/game/<file>:<line>`.
- Output is `dist/index.html`, not `dist/kestrel-deep.html`, because GitHub Pages serves `index.html` at the site root.

## Next tasks (in order)

1. ~~Enable GitHub Pages~~ Done: deployed from `main`, link above.
2. ~~Split the code into files with a build step~~ Done, by section (see above), and the data tables gathered into `src/data/`. Play-tested after each step: title screen, new run, saving and continuing, route map to the next deck or stop, test range, arcade, Codex, Version history, pack menu; no errors.
3. **Batch 1** (`docs/specs/batch-1.md`): four sessions, done one at a time; the owner playtests and says "continue" between them. Session 1 (deck sizes, v0.79) and Session 2 (run seeds, v0.80) are done. Next: Session 3 (pressure plate traps and trap panels), then 4 (weight plates, crates, spacebar styles).
4. **Balance pass** (the owner will play test runs and report findings). Tunable numbers are in `src/data/`; a few engine constants are still in game files (`BASE_R`, `LASER_LEN`, `FLARE_R` in `01-core.js`, `PR` in `24-update.js`), and spawn weights are inside `pickType()` in `09-population.js`.

## Working conventions

- **Keep this file current.** Update it whenever files are split, moved or renamed, and whenever the owner makes a design decision worth remembering. Keep the per-file list in `README.md` in step too.
- **Test in a browser before committing.** Run `npm run build` (it must pass), then play `dist/index.html` or `npm run dev`. The game has an on-screen error overlay; any red error box is a bug. Check the title screen, a new run, the test range and the arcade at minimum.
- **Update the version history** (both places) for every user-facing change, in plain player-facing language.
- **Update the Codex** when adding content: the title-screen Codex is built from the data tables, and the `Systems` category has hand-written entries explaining mechanics. New mechanics need a Systems entry; new creatures need a `BEASTINFO` entry with `move`, `attack` and `lore`.
- **New creatures** also need: an `ET` entry, a place in `BEASTS` (bestiary order), `KILLPTS`, a `THREAT` cost (used by the per-deck threat budget), a spawn weight in `pickType()`, an AI branch in the enemy update loop and a draw branch in the enemy renderer.
- **Deck size is per deck.** `MW`/`MH` change for every deck (see "Deck sizes" below). Never hard-code 64 or a tile count: use `MW`, `MH` and `MW*MH`. A new per-tile array must also be reallocated in `setDeckSize()`. A new generated feature whose count should grow with the deck (rooms, loot, hazards, traps...) takes its count through `aN(n)`.
- **All generation must be seeded (owner's rule, v0.80).** Anything that builds the station (sector maps, decks, population, loot rolled at generation, lift events, landings) must run inside a `seeded(keys, fn)` scope, keyed by what it generates. New generation code called from inside the existing scopes (`newSector()`, `enterNode()`, `newGame()`'s first deck, lift rides, `startStop()`, `launchTestDeck()`) is already covered: just use `Math.random()`, `rnd()`, `rr()` and `wpick()` as usual. New generation that runs anywhere else needs its own scope with a new key. Never keep a generation stream around to draw from later, and never generate inside timers or async code. Loot rolled later (like chest contents when opened) takes a seed stored at generation time (`ls` on chests).
- **No whole-deck work in one frame on a timer.** Large decks are ~1.9x Medium. A timed scan over every tile must be spread over frames with a cursor (see `updateOil()` / `updateMolten()`), and creature pathfinding goes through `flowTick()` (see below).
- **Specs live in `docs/specs/`.** Work through a batch one session at a time, as its "How to work through this batch" section says.
- **Keep the save format working.** Runs are saved between decks to `localStorage`; adding fields to the player is fine, but anything holding object references (enemies, sets) must be cleared or converted in `saveRun()`.
- In-game messages and UI text are lowercase, short, and written in a plain, slightly dry voice ("the lift doors grind open").
- The owner prefers the game never to pause the world while menus are open (this is the default, with an option to change it).

## Architecture overview (as of v0.79)

**Game states** (`state`): `title`, `play`, `route` (sector map), `node` (between-deck event or stop), `report` (deck results), `dead`. Flags: `testMode`, `testDeck`, `arcadeMode`, `stopMode`.

**Main loop:** `frame()` runs `updatePlay(dt)` when in play and not paused, then renders. Rendering draws the cached tile layer, items, enemies and the player, then a raycast light polygon and fog, then `drawActWorld()` overlays (clouds, flashlight cones, webs, mines, lamps, effects) and the HUD.

**World:** a tile grid of `MW` x `MH` tiles (48x48, 64x64 or 96x80, see Deck sizes), 12 px tiles. Parallel typed arrays per tile: `map` (0 floor, 1 wall, others for doors and vents), `kind` (floor style), `liq` (water depth), `hz` (fire, toxic and other hazards), `oil`, `slime`, `ice`, `chasm`, `molten`, `webs`, `furn` (solid furniture), `seen`. `resetHidden()` resets per-deck arrays; `genLevel()` and `genArena()` build decks; `populate()` places creatures and loot.

**Deck sizes (v0.79):** each junction's `cond.size` is `'s'`, `'m'` or `'l'` (`DECK_SIZES`, odds in `DECK_SIZE_ODDS`, both in `src/data/world.js`): 25/60/15 on ordinary junctions, 15/35/50 on the sector's exit deck and arena decks. Rolled in `rollCond()`, adjusted in `genSector()`, saved with the route; a missing size (older saves) means medium. `enterLevel()` calls `setDeckSize(cond.size)` first, which sets `MW`, `MH`, `deckSize` and `AREA` (area relative to 64x64: 0.56 / 1 / 1.875), reallocates every per-tile array and the pre-drawn tile canvas `mcv`. The test range, arcade and lift landings call `setDeckSize('m')` and keep their fixed layouts.
- **Scaling with area:** `aN(n)` scales a count by `AREA` and rounds randomly so the average is exact. It is used for rooms, extra corridors, vaults, secrets, crawlspaces, modules, arena size and cover, slag, chasms, cables, barrels, risers, fans, oil, hazard spots, hack panels, vending machines, freezers, trip scanners, NPC chances, chests, overgrowth plants, haunting ghosts and arena creatures. The threat budget is multiplied by `AREA`. Exploration disturbance (`newSeen` in `updateAlert()`) is divided by `AREA`. Par time and potential score scale too (`startLevelScore()`).
- **Pathfinding:** `flow` holds each tile's walking distance to the player. `flowTick()` rebuilds it continuously in slices (about an eighth of the deck per frame) into `flowB` and swaps when done; set `flowT=0` to restart it at once after the map changes (doors, broken walls). `bfs()` is still used for one-off full searches (generation, level start).
- **Measured (headless Chromium):** a busy Large deck (hunter, alarm, gas grenades, ~30 creatures) holds 60 fps like a busy v0.78 Medium deck.

**Run seeds (v0.80):** `runSeed` is `{code, kind}` (`'random'`, `'typed'` or `'daily'`), set by `pickRunSeed()` in `newGame()` from `META.setup.seedMode`/`seedText`, saved with the run (old saves get a random one) and `null` in the test range and arcade. The numeric seed is `seedHash(seedKey(code))`; `seedKey()` drops case, spaces and punctuation. Random codes are 8-digit numbers (owner's choice, v0.80); daily codes are `DAILY-YYYYMMDD` (local date). Typed seeds can be any letters and numbers.
- **How generation is seeded:** `seeded(keys, fn)` runs `fn` with `Math.random` swapped for a `mulberry32` generator seeded by the run seed plus `keys`, then restores it (`withSeed()`). Every existing generation call (`rnd()`, `rr()`, `wpick()`, `Math.random()`) is covered without changes. Outside scopes, `Math.random` is the real one, so combat, AI and effects stay random; `realRandom` is the real one even inside a scope. Keys: `['sector',sec]` (map, junction types and conditions, arenas, hunter start), `['deck',sec,junction]` (`enterNode()` and the first deck in `newGame()`), `['lift',sec,from,to]` (`liftKey`, set in `chooseRoute()`: the lift event roll and `startTransit()`) and the same key plus `'stop'` (`startStop()` landings). Others: `['kit']`, `['hunted',sec]`.
- **Inside a deck:** rolls that depend on the player (crew file drops skip found files, the depth-1 barrel light) run in `subSeed()`, which takes exactly one draw from the deck's stream, so they cannot shift the rest of the deck. Each chest gets a loot seed `ls` when generated, and `openChest()` rolls its contents from it.
- **What still changes a deck on the same seed:** its depth (decks ridden so far, so the route taken), run setup modifiers, lift-event choices that set up the next deck (`nextMods`), and player-dependent loot (files already found, gear owned). Combat and moment-to-moment randomness are not seeded, by design.
- **Shown:** Run stats, death screen (with a "seeded run" marker), the station map header, and the title's best score (`bestSeed`, `kd_best_seed`). The test lift's Seed field (`deckCfg.seed`, `testSeed`) seeds `launchTestDeck()`; a blank seed gets a random code, shown on arrival so the deck can be rebuilt.
- **Verified:** same seed gives identical sector maps, deck fingerprints (tiles, fixtures, creatures, items, chests), chest loot, lift events and landings, across different play on every deck and across save, reload and Continue.

**Run structure:** each biome is a sector map of 12-15 junctions (`route.nodes`) with the exit 3-4 jumps away. Shafts are hidden until ridden or revealed by intel (`route.lk`). A biome hunter boss can roam the sector (`route.chaser`). Each sector has 1-2 arena decks. The player arrives on each deck sealed in a lift cab and opens the doors with R.

**Player systems:** health with injuries (lost max health shown greyed out) and ghost health from food levels; stamina; status meters (`player.st`); armament sets (`player.arms`, main and off hand, two-handed weapons fill both); hotbar of quick items; crew files and clearance training substats and the Body/Spirit/Mind cores; abilities on E and F; switchable movement skills; skill sets (Psychic and Sling) that swap the item slots for an action bar; melee combos; crits; charged attacks with a perfect-release window; gun magazines and reloads.

**Key data tables:** `ET`, `BEASTS`, `BEASTINFO`, `KILLPTS`, `THREAT`, `ARM` (armaments), `WPN` (gun stats), `MAGS`, `WCRIT`, `GEAR`, `QUICK` (quick items), `IT` (pickups), `RECIPES` (Workbench), `COOK`, `FOOD`, `RAW`, `FILES` (crew files, tiers built with `FT()`), `FILESUB`, `SKILLS`, `MOVES`, `ACTS` (psychic actions), `SLING`, `INJ`, `ACH`, `AP_TRADES`, `NPCS`, `MODS` (room modules), `BOSSES`, `SECTORS`, `BNAMES`, `COND_HAZ`, `HAZDESC`, `TEXTEV` (between-deck events), `MODS_RUN` (challenge modifiers).

**Menus:** the pack menu (TAB) has tabs in this order: Pack, Equip, Craft, Food, Stats, Files, Progress (`menuTab` 0-6). Files has sub-views Crew files, Upgrades & perks, Skills. Progress has Bestiary, Run stats, Achievements.

**Persistence (`localStorage`):** `kd_opts` (options), `kd_meta` (meta-progression: deepest sector reached, achievements earned, hunters killed, creatures seen, run setup), `kd_save` (the run in progress, written on the route map and cleared on death or a new game), plus the best score.

**Special areas:** the test range (title screen) has every crew file, NPC, a creature console and a deck builder (the test lift, with a Size option) for testing; the arcade has six original mini-games (`ARC`).

## Where things live

**Tables (`src/data/`):**

| File | Tables |
|---|---|
| `character.js` | `SKILLS`, `ACTS`, `SLING`, `FT()`, `FILES`, `MOVES`, `CORES`, `SUBS`, `FILESUB`, `INJ` |
| `crafting.js` | `RECIPES` (with `upgRecipe()`, `ROMAN`), `UPGS`, grinder yields `GEARY`, `ARMY`, `CONY`, `AMMOY` |
| `creatures.js` | `ET`, `BOSSES`, `KILLPTS`, `THREAT`, `BEASTS`, `BEASTINFO` |
| `events.js` | `TEXTEV`, `ROOMDESC` |
| `food.js` | `FOOD`, `RAW`, `COOK` |
| `items.js` | `IT`, `QUICK`, `FLASKCOL`, `TANKMAX`, `GEAR`, `VEND_POOL`, `TOOLS`, `RESDESC`, `CXRES` |
| `npcs.js` | `NPCS`, `NPC_IDS` |
| `progress.js` | `GRADES`, `MODS_RUN`, `LVLSTAT`, `ACH`, `AP_TRADES` |
| `versions.js` | `VERSIONS`, `GAME_VERSION` |
| `weapons.js` | `WORDER`, `ARM`, `FIST`, `IMPLEMENTS`, `WPN`, `WCRIT`, `MAGS`, `CHARGE`, `COMBO_T` |
| `world.js` | `SECTORS`, `BNAMES`, `PAL`, `COND_LIGHT`, `COND_HAZ`, `MODS`, `ROOMNAMES`, `HAZDESC`, `LIQ`/`LIQNAME`, `BIOME`, `NODE`, `HIDDEN_TYPES`, `DECK_SIZES`, `DECK_SIZE_ODDS` |

**Code (`src/game/`):**

| What | File |
|---|---|
| equipping armaments, quick items, flasks, tank, tools, sling, psychic powers, `drawActWorld()` | `03-equipment.js` |
| scoring, deck conditions, collision | `04-state.js` |
| `MW`, `MH`, `AREA`, `deckSize`, `aN()`, run seeds (`seeded()`, `withSeed()`, `subSeed()`, `seedHash()`, `runSeed`) | `01-core.js` |
| `setDeckSize()`, `genLevel()`, `genArena()`, `resetHidden()`, `bfs()`, `flowTick()`, cooking | `05-levelgen.js` |
| `ARC` (arcade games) | `06-arcade.js` |
| `pickType()` (spawn weights), `populate()` | `09-population.js` |
| injuries, cores and substats logic | `10-player.js` |
| Workbench crafting and upgrade screens | `11-recipes.js` |
| `newGame()`, `pickRunSeed()`, `saveRun()`, `loadRun()`, `enterLevel()` | `12-flow.js` |
| route map, `route`, hunter boss | `14-route-map.js` |
| `say()`, `float()`, transit stops | `15-transit.js` |
| grinder, devices, NPC behaviour | `17-devices-npcs.js` |
| `OPTS` (options), text entry (`editText()`, `textEdit`) | `18-dice-options.js` |
| key handling (`onPress`, `menuKey`) | `19-input.js` |
| bestiary, run stats and achievements screens | `20-progress-screens.js` |
| `hurtPlayer()`, attacks, reloads | `22-actions.js` |
| `updatePlay()` and the enemy update loop | `24-update.js` |
| `drawEnemy()`, `drawPlayer()`, `txt()`, `ui()` | `25-render-helpers.js` |
| Codex (incl. `Systems` entries), title and pack menus | `27-menus.js` |
| `render()` | `28-render-world.js` |
| `frame()` | `29-loop.js` |

To find anything else: `grep -n "function name(" src/game/*.js` or `grep -n "const NAME=" src/data/*.js`.

## Publishing

- `main` is the repository's default branch and the only branch allowed to deploy to the `github-pages` environment. The first push went to a `claude/...` branch, which made it the default, and the first deploy from `main` was rejected until the default branch and the environment's deployment-branch rule were switched to `main`. Keep both pointing at `main`.
- Work on feature branches and merge to `main` to publish.

## Gotchas learned so far

- The enemy update loop handles most creature types in their own branch that ends with `continue`; generic AI only runs for types without one. Plants, wall plants, guards, wasps, spiders and frogs all have custom branches.
- Creature attacks (globs, tongues, seeds, charges, stings) also hit other creatures. Touching does not.
- `alarmT` belongs to the lift-defence objective; the security alarm uses `secT`.
- `hurtPlayer(d, quiet, src)`: `quiet` is used for hazard ticks and self-inflicted costs; non-quiet hits break combos and astral projection.
- The pack menu runs live by default, so player input must be ignored while it is open (movement and mouse attacks are already gated on `menuOpen`).
- Large single-line functions are common; when editing, anchor changes on exact unique strings and re-test.
- A plain floor flood-fill from the start room does not always reach the exit: locked doors, module doors, weak walls and vents count as walls to `bfs()`. Treat any tile other than wall (`map` 1) as passable when checking that a deck is connected.
- The test deck builder's `DECKOPT` is indexed by position in one place (`DECKOPT[1]` is Biome), so add new options after it.
- `genSector()` builds the sector map by trial: only about 1 in 40 attempts puts the exit 3-4 jumps away with every junction connected. It allows 3000 attempts; at the old 200, about 1 sector in 250 fell back to a 4-junction straight line (fixed in v0.79.1). Changing the placement rules changes that success rate, so re-measure it.
- Several arcade cabinets in one place take their games from `arcPicks(n)` (distinct games), not independent random picks.
- Any new chest needs a loot seed `ls:(Math.random()*4294967296)>>>0` where it is created (inside generation), or its contents will not repeat on the same seed. `addChest()` does this for you.
- When checking that generation repeats, take the fingerprint in the same instant the deck is built: the game loop keeps running between test steps, and creatures move and fires spread.

## Ideas on the list (not yet started)

- A short tutorial deck or contextual first-run tips.
- A sound pass: ambient deck hum per biome, better hit and reload sounds, maybe light music.
- A bug-hunting session focused on combinations of systems (skill sets with astral projection, injuries during stops, mines and chasms, two-handed weapons with the liquid tank).
- A difficulty setting in Options that scales the threat budget, injury chance and supplies together.
