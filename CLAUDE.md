# Kestrel Deep

A top-down survival roguelike that runs in the browser. Survey station Kestrel went quiet 41 days ago; the player rides a lift down through its decks, scavenging, crafting and fighting, to find out why. One life per run.

Current version: **v0.78**. The game was built iteratively in claude.ai chats up to this point and moved to this repository at v0.78.

## Current state of the code

- **Source lives in `src/`** and is built into **one self-contained HTML file**, `dist/index.html` (about 640 KB). No dependencies, no external assets. All art is drawn procedurally on a canvas; all sound is synthesised with the Web Audio API. The only network request is the optional Silkscreen font from Google Fonts in `src/boot.js` (the game falls back to a built-in font if it fails).
  - `src/index.html` is the page template; the build fills in `{{styles}}` (`src/styles.css`), `{{boot}}` (`src/boot.js`: font loader and the red error overlay) and `{{game}}`.
  - `src/game/NN-name.js` are 29 game files, split by system. `README.md` lists what each one holds.
  - `scripts/build.mjs` is the build (plain Node 20+, no npm install needed).
- **Play or test:** `npm run dev` serves http://localhost:5173 and rebuilds on every save (refresh the page). `npm run build` writes `dist/index.html`, which can also be opened straight from disk in Chrome or Edge.
- **Playable link:** https://claudemarcassistant-art.github.io/KestralDeep/ . Every push to `main` is built and deployed by `.github/workflows/pages.yml`; other branches and pull requests are built only, which catches syntax errors.
- The version history lives in two places and both must be updated with every change:
  - the `VERSIONS` array (newest first) in `src/game/27-menus.js`, shown in the in-game Version history screen. `GAME_VERSION`, shown on the title screen, is read from its first entry.
  - the plain-text changelog comment at the bottom of `src/index.html` (lines starting `v0.xx`)

## How the split works (design decision, v0.78)

- **The game files are not ES modules.** The build joins `src/game/*.js` in filename order inside one `'use strict'` closure, exactly as the original single `<script>` was. Every file shares one scope: any file can call any function, and any file can read and reassign the ~250 top-level `let` variables (`player`, `enemies`, `state`, `depth`, ...).
- Why: real ES modules cannot reassign another module's variables, so converting would have meant rewriting thousands of call sites with no tests to catch mistakes. The shared-scope split keeps behaviour identical: at the split, the build output was **byte-identical** to the original `kestrel-deep-v0.78.html`.
- Files were cut at the original `// ---------- section ----------` comments, so a file's contents follow the old file's order rather than a clean system boundary (for example `drawActWorld()` sits in `03-data.js`, and food and cooking tables are in `05-levelgen.js`). See "Where things live" below.
- **Load order matters only for top-level code** (declarations and statements that run immediately). Function bodies can refer to anything. A new file needs a number placing it after everything its top-level code uses; renumbering is fine.
- The build syntax-checks the joined code and reports errors as `src/game/<file>:<line>`.
- Output is `dist/index.html`, not `dist/kestrel-deep.html`, because GitHub Pages serves `index.html` at the site root.

## Next tasks (in order)

1. ~~Enable GitHub Pages~~ Done: deployed from `main`, link above.
2. ~~Split the code into files with a build step~~ Done, by section (see above). Play-tested after the split: title screen, new run, saving and continuing, route map to depth 2, test range, arcade; no errors.
   - Not done yet from the original plan: gathering the big tables into a `src/data/` area. They are still spread across files (see "Where things live"). Moving a table is safe as long as its new file loads before any top-level code that uses it.
3. **Balance pass** (the owner will play test runs and report findings). Keeping tunable numbers together in data files makes this much easier, so consider doing the `src/data/` move first.

## Working conventions

- **Keep this file current.** Update it whenever files are split, moved or renamed, and whenever the owner makes a design decision worth remembering. Keep the per-file list in `README.md` in step too.
- **Test in a browser before committing.** Run `npm run build` (it must pass), then play `dist/index.html` or `npm run dev`. The game has an on-screen error overlay; any red error box is a bug. Check the title screen, a new run, the test range and the arcade at minimum.
- **Update the version history** (both places) for every user-facing change, in plain player-facing language.
- **Update the Codex** when adding content: the title-screen Codex is built from the data tables, and the `Systems` category has hand-written entries explaining mechanics. New mechanics need a Systems entry; new creatures need a `BEASTINFO` entry with `move`, `attack` and `lore`.
- **New creatures** also need: an `ET` entry, a place in `BEASTS` (bestiary order), `KILLPTS`, a `THREAT` cost (used by the per-deck threat budget), a spawn weight in `pickType()`, an AI branch in the enemy update loop and a draw branch in the enemy renderer.
- **Keep the save format working.** Runs are saved between decks to `localStorage`; adding fields to the player is fine, but anything holding object references (enemies, sets) must be cleared or converted in `saveRun()`.
- In-game messages and UI text are lowercase, short, and written in a plain, slightly dry voice ("the lift doors grind open").
- The owner prefers the game never to pause the world while menus are open (this is the default, with an option to change it).

## Architecture overview (as of v0.78)

**Game states** (`state`): `title`, `play`, `route` (sector map), `node` (between-deck event or stop), `report` (deck results), `dead`. Flags: `testMode`, `testDeck`, `arcadeMode`, `stopMode`.

**Main loop:** `frame()` runs `updatePlay(dt)` when in play and not paused, then renders. Rendering draws the cached tile layer, items, enemies and the player, then a raycast light polygon and fog, then `drawActWorld()` overlays (clouds, flashlight cones, webs, mines, lamps, effects) and the HUD.

**World:** a 64x64 tile grid, 12 px tiles. Parallel typed arrays per tile: `map` (0 floor, 1 wall, others for doors and vents), `kind` (floor style), `liq` (water depth), `hz` (fire, toxic and other hazards), `oil`, `slime`, `ice`, `chasm`, `molten`, `webs`, `furn` (solid furniture), `seen`. `resetHidden()` resets per-deck arrays; `genLevel()` and `genArena()` build decks; `populate()` places creatures and loot.

**Run structure:** each biome is a sector map of 12-15 junctions (`route.nodes`) with the exit 3-4 jumps away. Shafts are hidden until ridden or revealed by intel (`route.lk`). A biome hunter boss can roam the sector (`route.chaser`). Each sector has 1-2 arena decks. The player arrives on each deck sealed in a lift cab and opens the doors with R.

**Player systems:** health with injuries (lost max health shown greyed out) and ghost health from food levels; stamina; status meters (`player.st`); armament sets (`player.arms`, main and off hand, two-handed weapons fill both); hotbar of quick items; crew files and clearance training substats and the Body/Spirit/Mind cores; abilities on E and F; switchable movement skills; skill sets (Psychic and Sling) that swap the item slots for an action bar; melee combos; crits; charged attacks with a perfect-release window; gun magazines and reloads.

**Key data tables:** `ET`, `BEASTS`, `BEASTINFO`, `KILLPTS`, `THREAT`, `ARM` (armaments), `WPN` (gun stats), `MAGS`, `WCRIT`, `GEAR`, `QUICK` (quick items), `IT` (pickups), `RECIPES` (Workbench), `COOK`, `FOOD`, `RAW`, `FILES` (crew files, tiers built with `FT()`), `FILESUB`, `SKILLS`, `MOVES`, `ACTS` (psychic actions), `SLING`, `INJ`, `ACH`, `AP_TRADES`, `NPCS`, `MODS` (room modules), `BOSSES`, `SECTORS`, `BNAMES`, `COND_HAZ`, `HAZDESC`, `TEXTEV` (between-deck events), `MODS_RUN` (challenge modifiers).

**Menus:** the pack menu (TAB) has tabs in this order: Pack, Equip, Craft, Food, Stats, Files, Progress (`menuTab` 0-6). Files has sub-views Crew files, Upgrades & perks, Skills. Progress has Bestiary, Run stats, Achievements.

**Persistence (`localStorage`):** `kd_opts` (options), `kd_meta` (meta-progression: deepest sector reached, achievements earned, hunters killed, creatures seen, run setup), `kd_save` (the run in progress, written on the route map and cleared on death or a new game), plus the best score.

**Special areas:** the test range (title screen) has every crew file, NPC, a creature console and a deck builder for testing; the arcade has six original mini-games (`ARC`).

## Where things live (`src/game/`)

| What | File |
|---|---|
| `ET`, `ARM`, `WPN`, `GEAR`, `QUICK`, `IT`, `FILES`/`FT()`, `SKILLS`, `MOVES`, `ACTS`, `SLING`, `BOSSES`, `SECTORS`, `BNAMES`, `drawActWorld()` | `03-data.js` |
| `KILLPTS`, `COND_HAZ`, scoring, collision | `04-state.js` |
| `genLevel()`, `genArena()`, `resetHidden()`, `MODS`, `FOOD`, `RAW`, `COOK` | `05-levelgen.js` |
| `ARC` (arcade games) | `06-arcade.js` |
| `THREAT`, `pickType()`, `populate()` | `09-population.js` |
| `FILESUB`, `INJ`, injuries | `10-player.js` |
| `RECIPES`, upgrades | `11-recipes.js` |
| `MODS_RUN`, `newGame()`, `saveRun()`, `loadRun()`, `enterLevel()` | `12-flow.js` |
| route map, `route`, hunter boss | `14-route-map.js` |
| `TEXTEV`, `say()`, `float()` | `15-transit.js` |
| `NPCS` | `17-devices-npcs.js` |
| `OPTS` (options) | `18-dice-options.js` |
| key handling (`onPress`, `menuKey`) | `19-input.js` |
| `BEASTS`, `BEASTINFO`, `ACH`, `AP_TRADES` | `20-progress-screens.js` |
| `WCRIT` | `21-mechanics.js` |
| `MAGS`, `hurtPlayer()`, attacks | `22-actions.js` |
| `updatePlay()` and the enemy update loop | `24-update.js` |
| `drawEnemy()`, `drawPlayer()`, `txt()`, `ui()` | `25-render-helpers.js` |
| `VERSIONS`, `HAZDESC`, Codex (incl. `Systems` entries), title and pack menus | `27-menus.js` |
| `render()` | `28-render-world.js` |
| `frame()` | `29-loop.js` |

To find anything else: `grep -n "function name(" src/game/*.js`.

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

## Ideas on the list (not yet started)

- A short tutorial deck or contextual first-run tips.
- A sound pass: ambient deck hum per biome, better hit and reload sounds, maybe light music.
- A bug-hunting session focused on combinations of systems (skill sets with astral projection, injuries during stops, mines and chasms, two-handed weapons with the liquid tank).
- A difficulty setting in Options that scales the threat budget, injury chance and supplies together.
