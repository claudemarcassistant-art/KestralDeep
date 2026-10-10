# Kestrel Deep

A top-down survival roguelike that runs in the browser. Survey station Kestrel went quiet 41 days ago; the player rides a lift down through its decks, scavenging, crafting and fighting, to find out why. One life per run.

Current version: **v0.89**. The game was built iteratively in claude.ai chats up to v0.78 and moved to this repository then.

## Current state of the code

- **Source lives in `src/`** and is built into **one self-contained HTML file**, `dist/index.html` (about 640 KB). No dependencies, no external assets. All art is drawn procedurally on a canvas; all sound is synthesised with the Web Audio API. The only network request is the optional Silkscreen font from Google Fonts in `src/boot.js` (the game falls back to a built-in font if it fails).
  - `src/index.html` is the page template; the build fills in `{{styles}}` (`src/styles.css`), `{{boot}}` (`src/boot.js`: font loader and the red error overlay) and `{{game}}`.
  - `src/data/*.js` are the content and tuning tables (creatures, weapons, items, recipes, food, crew files, achievements, NPCs, world, events, versions). Balance changes usually only touch these.
  - `src/game/NN-name.js` are 37 game files, split by system. `README.md` lists what each file holds.
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
3. **Batch 1** (`docs/specs/batch-1.md`): four sessions, done one at a time; the owner playtests and says "continue" between them. All four sessions are done: 1 (deck sizes, v0.79), 2 (run seeds, v0.80), 3 (traps and trap panels, v0.81), 4 (plate doors, crates, item weight, spacebar styles, v0.82).
4. **Batch 2** (`docs/specs/batch-2.md`): four sessions, same workflow. All four sessions are done: 1 (frozen status, cryo grenade, active reload, v0.83), 2 (herbs and herbalism, v0.84), 3 (express shafts and vault junctions, v0.85), 4 (poison gas traps, toxic vents, deck secured walk-back, ceiling crawlways, v0.86).
5. **Balance pass** (the owner plays test runs and reports findings). First round done in v0.87: creature memory, muffled noise, fewer creatures on Large decks, arena waves (see "Pacing" below). Tunable numbers are in `src/data/`; a few engine constants are still in game files (`BASE_R`, `LASER_LEN`, `FLARE_R` in `01-core.js`, `PR` in `24-update.js`), and spawn weights are inside `pickType()` in `09-population.js`.

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

## Architecture overview (as of v0.89)

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

**Traps (v0.81):** code in `src/game/30-traps.js`, numbers in `src/data/traps.js` (`TRAP_TYPES`, `TRAP_WEIGHTS`, `TRAP_CFG`, `TRAP_PANEL_DESC`).
- **Generation:** `genTraps(start, exitR)` runs at the end of `genLevel()` and `genArena()`, inside the deck's seeded scope: `aN(2-5)` plates from depth 2 (`levelMods.traps` from the test lift: `'off'`, or `'on'` for any depth with every type and a panel), about 75% in corridors (floor outside every room rect), never in or near the start room, near the exit, or in vaults, secrets, crawlspaces, below-deck rooms or modules. A trap is `{tx,ty,type,state,t,found,off,panel,dir,area}`; flame and dart traps need a wall beside the plate (`dir`), debris covers a 2x2 `area`.
- **Running:** `updateTraps(dt)` (called in `updatePlay()`): a plate in state `armed` with `weightAt(tx,ty) >= TRAP_CFG.weight` goes `click` (0.4 s), then `fireTrap()` and `cool` (6 s re-arm). `weightAt()` counts the player (3, not when floating) and walking creatures (3; `walker()` excludes flying, ghosts, plants, dummies, caged), dropped items (`itemWeight()`: 1, gear and weapons 2) and crates (3). `trapLive()` is false when a panel locked the trap (`off`) or it is powered (flame, dart) and `powerOff`.
- **Effects:** spikes hit whatever is on the plate; flame traps spray the flamethrower's own `flames` particles (marked `trap`, with a `jet` that limits player hits to one per 0.3 s in `updateFlames()`); darts (`darts`) hit the player and creatures; debris (`falls`) lands after 0.8 s and leaves `rubble` (a per-tile array, slows the player in `updatePlay()` and creatures in `move()`; timers in `rubbleL`).
- **Spotting:** plates are drawn as a faint lighter tile with rivets (`drawTraps()`, called in `render()` before the panels, so under the fog); `found` plates get an outline and show on the station map. Perception >= 3 within 30 px, the sonar pulse and the signal scanner (`revealTraps()`) set `found`.
- **Trap control panels:** an ordinary hack panel `{reward:'traps', traps:[...]}` pushed into `panels` (`wireTrap()`), within 6 tiles with line of sight to its plates, up to 3 plates each. `HACKR.traps` locks them down (`trapsLockDown()`); a failed hack (2 misses in `hackTry()`) calls `trapsSetOff()`. The dashed floor line shows once the panel is seen or the plate found.
- **Gas trap (v0.86):** a fifth type, `TRAP_TYPES.gas` (powered, re-arms after its own `rearm` of 20 s; other types use `TRAP_CFG.rearm`). `fireGas()` picks up to 4 nozzle points within 2 tiles (wall-side tiles first) and `updateGasJets()` (`gasJets`, reset in `resetHidden()`) feeds a toxic cloud at each for 5 s, each capped at `cloudR` 32 px so together they cover about a room (~85x95 px measured); the clouds then fade at the normal poison rate. Green rivets, and Perception spots it from 1.4x further. `trapWeightsAt(x,y)` raises its weight x4 on toxic-spill decks and x4 within 8 tiles of a lab or custodial closet (`GAS_TRAP_BIAS`).
- **Toxic floor vents (v0.86):** `genToxicVents()` (right before `genTraps()` in `genLevel()` and `genArena()`) marks `v.toxic` on 50% of floor vents on toxic-spill decks and 10% elsewhere (`TOXIC_VENT_CFG`). A toxic eruption feeds a `'toxic'` cloud from the vent (growing like steam) and its jet poisons heavily; `drawToxicVents()` tints the grille green. The coolant hack turns them back to cold vents.
- **Test range:** the arena room south of the main hall has the four older traps, three wired to a panel on its north wall; the hazards area has a gas trap plate (26,24) and a toxic vent (21,19).

**Plate doors and crates (v0.82):** code in `src/game/31-plate-doors.js`, numbers in `src/data/traps.js` (`PLATE_DOOR_CFG`, `CRATE_CFG`, `ITEM_WEIGHT`, `PLATE_DOOR_DESC`).
- **Plate doors:** `{tx,ty,px,py,dir,kind,room,state,t,hinted,junk}` in `plateDoors` (reset in `resetHidden()`). The door tile is a wall (`map` 1) while closed; `setPlateDoor()` flips it to floor, repaints it and sets `flowT=0`. States `closed` -> `open` (plate weight >= 3) -> `closing` (1 s grind) -> `closed`; it stays jammed while the doorway is occupied, and pushes items on the door tile out when it shuts.
- **Generation:** `genPlateDoors(start)` runs in `genLevel()` just before `genPanels()` (seeded): `aN(0.4)` doors from depth 2 (`levelMods.pdoor` from the test lift: `'off'`, or `'on'` for at least one at any depth). Kinds: `loot` (small room via `attach()`), `vault` (room with a chest) and `shortcut` (a one-tile wall between floor that is at least 24 tiles apart on foot). The plate goes 3 (or 2) tiles out from the door on the open side. **A way to hold the plate always exists:** a crate within 2-6 walking tiles of the plate (`crateSpotNear()`, open on all four sides so it can be pushed), or, if there is no room, 3 scrap left nearby (`pd.junk`, placed by `fillPlateRooms()` because `populate()` clears `items`). `fillPlateRooms()` (end of `populate()`) stocks the rooms. Measured: ~47% of mixed-size depth-4 decks get one; every plate is reachable from the start.
- **Crates** are barrels with `crate:true` (`mkCrate()`; `wood` 75% at generation), so every barrel push (shove, kick, tackle, telekinesis, fans, wells, explosions, repulse) moves them. They never heat, burn or explode (`hitBarrel()`, `boomBarrel()`, `updateBarrels()` and the oil spill skip them). `breakCrate()` breaks wooden ones (sledge, a charged hit at 2x or more, explosions) and drops 1-3 scrap. **Any new code that loops over `barrels` must decide what to do with crates.**
- Loose items slide when thrown (`it.kvx`/`it.kvy`, `updateLoose()`).
- **Test range:** a vault-style plate door south of the trap room (plate at 8,41, door at 8,43) with a wooden and a metal crate and some scrap; the test lift has a Plate door option (normal/off/on).

**Spacebar styles (v0.82):** code in `src/game/32-spacebar.js`, numbers in `SPACE_STYLES` (`src/data/character.js`). SPACE calls `spaceAct()`, which runs `activeSpace()`: `player.space` (saved with the player; missing means shove), falling back to shove if no longer owned. A style is owned when an attuned file tier has `space:'kick'` (Brawler tier 8, 2 clearance) or `space:'repulse'` (Kinetic tier 9, 3 clearance). Files > Skills lists them in a Spacebar section (`skillList()` rows with `t:'SPACE'`; `bindSkill()` sets `player.space`).
- `kick()`: 0.5 rad half-arc, reach 26, 3 damage plus melee bonuses, 2x shove knockback, 12 stamina, 1.2x shove recovery; ambush, combo damage, crits (`WCRIT.kick`), `comboAdd(1)`; sprinting makes a flying kick (`tackleT`, boost). Hits barrels, crates, plants, cores and weak walls.
- `repulse()`: radius 40 burst, 1 damage, 0.7x telekinetic push on creatures, barrels and crates, throws items and gas clouds, 15 stamina (half the shortfall from health), 4 s recharge (`player.repulseCd`, times `actCdMul()` for Focus).

**Frozen status (v0.83):** code in `src/game/33-cold.js`, numbers in `FREEZE_CFG` (`src/data/status.js`).
- **Player:** `addStatus('frz')` calls `freezePlayer()` when the meter reaches 100 (unless `frzImm`). `player.frozenT` (1.5 s) holds `dazeT` up every frame in `updatePlayerCold()` (called from `updateStatus()`), which is what blocks movement, attacks, items, dash and shove; `onPress()` also refuses E, F, SPACE and R and turns new movement presses into `frozenMash()` (0.1 s each, 0.4 s max). The first fire hit (`addStatus('brn')`) cracks 0.4 s off (`frozenFireHit()`); burn at 100 thaws at once. `thawPlayer()` sets cold to 60 and `frzImm` 3 s. `hurtPlayer()` multiplies by `frozenMeleeMul(src)`: x1.6 when `src` is a creature within reach (its radius + player radius + 12 px).
- **Creatures:** `e.frz` meter, filled only through `chillEnemy(e,a)` (cold risers and vents, `freezeAround()`, the Frost Matron's breath, cryo clouds; amounts in `FREEZE_CFG.chill`). At 100 `freezeEnemy()`: `e.frozenT` 2 s (wardens 1 s), then `thawEnemy()` (cold 60, `frzImm` 3 s, wardens 8 s). `enemyFrozen()` runs first in the enemy loop and `continue`s, so frozen creatures skip all AI and only slide from knockback. Ghosts, drones and closed cages never freeze; burning creatures lose burn instead of gaining cold. The wall-slam loop doubles impact damage on frozen creatures.
- **Melee bonus:** `damageEnemy()` multiplies by `frozenEnemyMul(e)`, x1.6 only while `meleeHit` is true. `primaryAttack()`, `shove()` and `kick()` are wrappers that run `primaryAttack0()`, `shove0()` and `kick0()` inside `asMelee()`, which sets `meleeHit`. New melee attacks should go through `asMelee()` too.
- **Cryo grenade** (`cryonade`, Workbench battery + pipe + cloth): lands as an emitter of kind `'cryo'` for 3 s, feeding a `'cryo'` cloud (`CLOUD.cryo`). `updateClouds()` adds cold to the player inside and calls `cryoCloudTick()` for creatures; the emitter runs `freezeAround()` every 0.75 s so water under it turns to ice.
- Drawn with `drawIceShell()` over the player and creatures; the HUD shows FROZEN.
- **Test range:** a cold riser on the west wall of the main hall (label COLD RISER) and 5 cryo grenades.

**Active reload (v0.83):** `startReload()` (22-actions.js) sets a marker `player.arPos` (random 0.40-0.75 of the bar) and width `arW` (12% + 1% per Dexterity point, max 20%; `ACTIVE_RELOAD` in `src/data/status.js`). In `onPress()`, R first calls `activeReloadPress()`: if a reload with a marker is running, the press is used (inside the marker: `finishReload()`, "quick reload"; outside: the remaining time x1.5, marker removed). Otherwise R goes to `interact()` as before, so the press that starts a reload never counts. Only guns with `MAGS` reload, so bows, knives and the sling never show a marker. The HUD reload bar (bottom right) is 4 px tall and draws the marker.

**Herbs and herbalism (v0.84):** code in `src/game/34-herbs.js`, data in `src/data/herbs.js` (`HERBS`, `HERB_WEIGHTS`, `HERB_CFG`, `HERBAL`, `DRAUGHTS`, `HERB_WHERE`).
- **Herbs** are items `{type:'tuft',tuft:id}` (the older `herb` item is still the instant-heal pickup; it is unrelated). Picked up into `player.herbs` (doubled by the Forager perk). Generated (seeded) by `genOvergrownHerbs()` at the end of the overgrowth block in `populate()` (`aN(4-8)`, half beside a bloom, the rest against a wall) and `genGreenhouseHerbs()` in `fillModule()` (2-4). Also a `tuft` weight in the locker roll, the galley cook's "bundle of 3 herbs" option and a 50% herb at camp landings.
- **Preparations** (`HERBAL`) are made in the Food tab's third view, Herbalism (`fdMode` 2, `drawHerbalism()`; A/D now cycles three views). Poultices and incense need cloth or nothing and go to `player.inv` as quick items: `34-herbs.js` adds their `QUICK` entries at load and `usePrep()` runs them. Draughts need flask water, are `FOOD` entries (`DRAUGHTS` merged into `FOOD` at load, `draught:true`) and are eaten from the Pouch; `eatFood()` hands them to `drinkDraught()`.
- **Timed effects:** `player.tbuffs` (`{id,t,m,buff}`, added to stats in `refreshStats()`, shown in the Pouch's Active buffs with seconds left) and `player.hots` (heal over time), both ticked in `updateHerbs()`. New stat keys: `coldImm` (`addStatus('frz')` returns), `steady` (multiplies `aimMul()`), `stamRegen` (stamina recovery).
- **Incense:** `incense` list (reset in `resetHidden()`), `{x,y,kind:'sage'|'ember',t}`, burning 30 s. It feeds a harmless `'incense'` cloud (`CLOUD.incense`, small `rmax`, light shroud, no air use) that fans blow like any cloud. Sage: +1 health/s within 48 px, and `sageCalm()` stops `alertAdd()` and `updateAlert()` anywhere on the deck. Ember: within 24 px (`inEmber()`), thaws the player and creatures, `addStatus('frz')` and `chillEnemy()` do nothing, and wet dries.
- Codex: a Herbalism category (herbs and preparations) and a Systems entry. **Test range:** a herb stash (4 of each herb) in the main hall's top-right corner, label HERBS.

**Express shafts (v0.85):** code in `src/game/35-vaults.js`, numbers in `EXPRESS_CFG` (`src/data/route.js`). `genExpress(N)` runs at the end of a successful `genSector()` (seeded): 2-4 pairs of junctions exactly two steps apart, at most 2 per junction, stored both ways in `node.xl`. Known through `route.lk` with keys `'x'+lkey(i,j)`; `learnLinks()` learns them, so they follow the normal fog rules. The route screen's options come from `routeOpts()` (shafts first, then known express shafts); input and clicks go through `pickRoute(k)`, which charges batteries (`expressCost()`: 1, or 2 into the exit) and calls `chooseRoute(j,true)`. An express ride raises depth, moves the hunter and skips the lift event roll entirely (`nextTransit` stays queued). Drawn as a double amber line with a lightning glyph.

**Vault junctions and archive vaults (v0.85):** also `35-vaults.js`, numbers in `VAULT_CFG`, `VAULT_DANGERS` (`src/data/route.js`).
- **Sector map:** `genVaultJunctions()` (end of `genSector()`) picks 1-2 station or flooded junctions that are not the start, the exit, an arena or on any shortest start-to-exit route, weighted toward distance from that route and dead ends. It sets `cond.vault={d:[dangers]}` and `cond.size='l'`; from sector 3 there is a 40% chance of a second danger. A faint gold diamond marks them from the start; `condText()` names the danger once the junction is known; `cond.vault.opened` is set when cracked.
- **Deck:** `genArchiveVault(start)` runs in `genLevel()` before `genPlateDoors()`. It `attach()`es a 5x4 room (4x3 if nothing fits) whose door stays a wall tile, at least 35% of the deck's width or height from the arrival lift by walking distance (relaxed if needed; 90 of 90 test decks got one). `archive` holds `{room,tx,ty,dir,panel,open,burnt,guard,wave2,unstT}` and is reset in `resetHidden()`. `fillArchive()` (end of `populate()`) pushes the lock panel (`reward:'vault'`, `hard:true`, so `newHackWindow()` narrows it to 60%), adds 1-2 unfound files (`subSeed()`; a `clearpack` item worth 2 clearance when none are left), a rare chest and a stash, and the guardian for `guarded` decks (an arena-style warden mini-boss, `e.vaultGuard`).
- **Opening:** `HACKR.vault` (hack success) or `archiveBlast()` from `explode()` (within the blast radius + 16 px of the door) call `openArchive()`: door tile to floor, `lvl.vault` (600 on the deck report and live score), `player.vaultSecs` (Vault breaker achievement: 3 sectors), and the danger trigger. Two misses burn the panel (`vaultFried()`); `vaultPanelBlocked()` refuses the hack while the guardian lives.
- **Dangers:** `guarded` (above), `elite` (threat budget x1.4 in `populate()`, plus `eliteHeavy()`), `lockdown` (`raiseAlarm(...,'vault')` now and again 12 s later; called guards cannot call more), `unstable` (disturbance to 75 at once, `setPower(false)` after 60 s, HUD countdown).
- Drawn by `drawArchive()` (in `render()`) and `drawArchiveMap()` (station map, gold outline once the door is seen). **Test lift:** a Vault deck option (off, on with a random danger, or a named danger).

**Deck secured and ceiling crawlways (v0.86):** code in `src/game/36-backtrack.js`, numbers and Codex text in `src/data/route.js` (`SECURE_CFG`, `CRAWL_CFG`, `SECURE_DESC`, `CRAWL_DESC`).
- **Secured:** `updateSecure()` re-runs `checkSecure()` every 0.5 s: the exit lift tile is seen; no `hostileCanReach()` creature (not dead, dummy, plant, friendly, caged, aquatic while you are out of the water, and its tile has a `flow` distance, so creatures sealed behind locked doors do not count; ghosts always count); no `secT`, `spawnQ`, `alertRumble`, arena lock, lift-defence alarm, unfinished `waves`, `bossPending` or live hunter. Never in the test range itself or at stops. `deckSecured` drives a "G walk back to the lift" button on the station map (`drawMap()`, and G while the map is open). `walkBack()` puts the player on the floor tile beside the exit lift nearest by `flow`, passes the walking time with `passTime()` (satiety, `updateHerbs()`, `updateStatus()`, a few cooldowns, the deck clock `lvl.t`), refills stamina and shows a fade (`fadeFx`).
- **Crawlways:** `genCrawls(start,exitR)` at the end of `genLevel()` (seeded; not on arenas or landings): 0 on small decks, 0-1 on medium, 1-2 on large, each a pair of floor tiles against a wall, at least a third of the deck's width apart, reachable from the start, outside the start room, vaults, hidden rooms, modules and plate-door rooms; with one crawlway, one end is near the exit lift when it can be (15 of 15 in tests). `crawls` is reset in `resetHidden()`. `findInteract()` offers `{k:'crawl'}` within 12 px; R asks (`crawlAsk`, drawn by `drawFadeAndAsk()`), and `onPress()` hands the next key to `crawlKey()`: R climbs through (time passes at 30 px/s along 1.25x the straight-line distance), anything else cancels. `crawlRefusal()` blocks it when hurt in the last 4 s (`player.lastHitT`, set in `hurtPlayer()` for non-quiet hits) or with an aware hostile within 120 px. Station map: hatches once seen, a dashed line once both are seen.
- **Test range and lift:** a crawlway between (36,4) and (4,24) in the main hall; the test lift's Secured option removes the creatures and reveals the exit lift so the deck counts as secured at once.

**Pacing (v0.87, balance pass):** code in `src/game/37-pacing.js`, numbers in `TRACK_CFG`, `THREAT_SIZE_MUL`, `ARENA_WAVES` (`src/data/creatures.js`). The owner found play felt like bombardment on crowded decks and in arenas; measured, at depth 6 a ten-room walk left ~8 creatures permanently hunting (they never dropped `alert`, and `flow` reaches the whole deck).
- **Memory:** `trackTick()` runs in the enemy loop right after the sight check. An alerted creature gets `huntT` (8 s; 5 s from a noise; 30 s for disturbance-wave spawns `e.drawn`; 20 s for alarm-called guards `e.called`), refreshed whenever it sees you within 180 px; out of sight it counts down (3x faster beyond 30 walking tiles or with no path), then `alert=false` and a grey "?". Wardens, arena creatures (`e.arena`) and guards during an alarm (`secT>0`) never give up. After the change the same walk leaves ~2.5 hunting.
- **Noise:** `noise()` uses `noiseReach()`: half range without line of sight.
- **Counts:** the threat budget in `populate()` is multiplied by `THREAT_SIZE_MUL[deckSize]` (Large 0.8, owner's choice).
- **Ghosts (owner's design, v0.88):** the ghost branch of the enemy loop calls `ghostMove()` (`37-pacing.js`, numbers in `GHOST_CFG`): velocity steering with low acceleration (`e.gvx`/`e.gvy`), states `e.gst` `float` (toward you within 230 px on a wandering heading `e.wob`, speed varying, about 22 px/s on average), `windup` (0.35 s shiver at ~60 px), `lunge` (210 px/s for 0.45 s, hits once), `drift` (coasts on along the lunge, slowing from 42 px/s, 2.6 s), then back to `float`, which curves it round in a loop. Looking straight at it still makes it flee. The enemy loop's `e.cd-=dt` times the 3.2 s lunge cooldown.
- **Arena waves (owner's design):** `enterLevel()` places only `arenaStart()`'s share of the arena creatures (40%, at least 2) and sets `arenaW`; `updateArenaWaves()` queues a wave every 15 s (first after 8 s) through `queueSpawn()` (`spawnQ` entries marked `arena`), size 2-3 plus depth/3 scaled by area, skipped while the arena already holds `cap` (8 x AREA). With a mini-boss (`arenaW.boss`) waves continue until it dies; without one there are 3. The lift unlocks only when `arenaW.done` and the arena is clear.

**Lifts use R (owner's decision, v0.89):** standing on `exitT` no longer does anything. `exitLiftAt()` (22-actions.js) returns `{k:'liftgo'|'liftshut'|'lift'|'testlift'|'arcexit'}` within 16 px of the exit tile, and `findInteract()` returns it before anything else, so the lift always wins R; `onPress()` also checks it before `activeReloadPress()`, so R at the lift never fumbles a reload. `liftgo` calls `finishLevel()`, `liftshut` says why (`liftShutMsg()`), `testlift` opens the test lift's deck builder, `arcexit` leaves the arcade. The freight lift event still drops on contact. To keep that safe, `clearLiftArea()` (36-backtrack.js) runs at the end of `enterLevel()` and moves hack panels, vending machines, chests, fixtures, levers and hatches off the exit tile and the 8 tiles around it, to the nearest valid spot (a panel with nowhere to go is dropped). Before this ~9% of decks (mostly arenas) had a panel, chest or breaker beside the lift; after, 0 of 150, and everything stays usable from a spot more than 16 px from the lift.

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
| `character.js` | `SKILLS`, `ACTS`, `SLING`, `FT()`, `FILES`, `MOVES`, `CORES`, `SUBS`, `FILESUB`, `INJ`, `SPACE_STYLES` |
| `crafting.js` | `RECIPES` (with `upgRecipe()`, `ROMAN`), `UPGS`, grinder yields `GEARY`, `ARMY`, `CONY`, `AMMOY` |
| `creatures.js` | `ET`, `BOSSES`, `KILLPTS`, `THREAT`, `BEASTS`, `BEASTINFO`, `TRACK_CFG`, `THREAT_SIZE_MUL`, `ARENA_WAVES`, `GHOST_CFG` |
| `events.js` | `TEXTEV`, `ROOMDESC` |
| `food.js` | `FOOD`, `RAW`, `COOK` |
| `items.js` | `IT`, `QUICK`, `FLASKCOL`, `TANKMAX`, `GEAR`, `VEND_POOL`, `TOOLS`, `RESDESC`, `CXRES` |
| `npcs.js` | `NPCS`, `NPC_IDS` |
| `progress.js` | `GRADES`, `MODS_RUN`, `LVLSTAT`, `ACH`, `AP_TRADES` |
| `versions.js` | `VERSIONS`, `GAME_VERSION` |
| `weapons.js` | `WORDER`, `ARM`, `FIST`, `IMPLEMENTS`, `WPN`, `WCRIT`, `MAGS`, `CHARGE`, `COMBO_T` |
| `herbs.js` | `HERBS`, `HERB_WHERE`, `HERB_WEIGHTS`, `HERB_CFG`, `HERBAL`, `DRAUGHTS` |
| `route.js` | `EXPRESS_CFG`, `EXPRESS_DESC`, `VAULT_CFG`, `VAULT_DANGERS`, `VAULT_DESC`, `SECURE_CFG`, `CRAWL_CFG`, `SECURE_DESC`, `CRAWL_DESC` |
| `status.js` | `FREEZE_CFG`, `ACTIVE_RELOAD` |
| `traps.js` | `TRAP_TYPES`, `TRAP_WEIGHTS`, `TRAP_CFG`, `TRAP_PANEL_DESC`, `PLATE_DOOR_CFG`, `CRATE_CFG`, `ITEM_WEIGHT`, `PLATE_DOOR_DESC`, `GAS_TRAP_BIAS`, `TOXIC_VENT_CFG` |
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
| traps: `genTraps()`, `updateTraps()`, `fireTrap()`, `weightAt()`, `drawTraps()`, trap panels | `30-traps.js` |
| plate doors and crates: `genPlateDoors()`, `fillPlateRooms()`, `updatePlateDoors()`, `mkCrate()`, `breakCrate()`, `itemWeight()` | `31-plate-doors.js` |
| spacebar styles: `spaceAct()`, `activeSpace()`, `kick()`, `repulse()` (`shove()` stays in `22-actions.js`) | `32-spacebar.js` |
| cold and frozen: `freezePlayer()`, `chillEnemy()`, `freezeEnemy()`, `enemyFrozen()`, `asMelee()`, `drawIceShell()`, cryo cloud ticks | `33-cold.js` |
| herbs: `genOvergrownHerbs()`, `genGreenhouseHerbs()`, `makePrep()`, `usePrep()`, `drinkDraught()`, `updateHerbs()`, incense, `drawHerbalism()` (in `20-progress-screens.js`) | `34-herbs.js` |
| express shafts and vaults: `genExpress()`, `genVaultJunctions()`, `routeOpts()`, `pickRoute()`, `genArchiveVault()`, `fillArchive()`, `openArchive()`, `archiveBlast()` | `35-vaults.js` |
| deck secured and crawlways: `checkSecure()`, `walkBack()`, `passTime()`, `genCrawls()`, `crawlKey()`, `drawFadeAndAsk()`, `clearLiftArea()` | `36-backtrack.js` |
| pacing: `trackTick()`, `noiseReach()`, arena waves (`arenaStart()`, `updateArenaWaves()`), ghost movement (`ghostMove()`) | `37-pacing.js` |
| reloads: `startReload()`, `updateReload()`, `finishReload()`, `activeReloadPress()` | `22-actions.js` |

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
- `30-traps.js` to `37-pacing.js` load after `29-loop.js`. `35-vaults.js` also adds `HACKR.vault` at load. `34-herbs.js` does run code at load (it merges `DRAUGHTS` into `FOOD` and adds `QUICK` entries), which is fine because it only touches data tables. `29-loop.js` is no longer the end of the game code: test hooks should be injected before the closing `})();`, not after `requestAnimationFrame(frame);`.
- `newTest()`, `newGame()` and `loadRun()` replace the `player` object (`initPlayer()`), so tests must re-read `player` after calling them.
- Before v0.81, `genArena()` did not reset `panels` or `vendors`, so arena decks kept the previous deck's hack panels and vending machines at stale positions. Every generator that builds a full deck must reset every per-deck list (`resetHidden()` covers most; panels and vendors are reset by `genPanels()`/`genVending()` or by hand).
- `populate()` starts with `items=[]`, so items placed earlier in `genLevel()` are lost; anything generation wants on the floor goes in during or after `populate()` (see `fillPlateRooms()`).
- The test scripts save screenshots into whatever folder they run from, so run them from the scratch folder: in v0.85 eight stray screenshots were found committed to the repository root and removed (`/*.png` is now ignored).
- `player.floating` is recalculated every frame from the movement keys, so setting it in a test does nothing; test `weightAt()` directly.

## Ideas on the list (not yet started)

- A short tutorial deck or contextual first-run tips.
- A sound pass: ambient deck hum per biome, better hit and reload sounds, maybe light music.
- A bug-hunting session focused on combinations of systems (skill sets with astral projection, injuries during stops, mines and chasms, two-handed weapons with the liquid tank).
- A difficulty setting in Options that scales the threat budget, injury chance and supplies together.
