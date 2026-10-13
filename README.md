# Kestrel Deep

A top-down survival roguelike that ships as a single HTML page.

## Develop

Needs Node 20+. There are no dependencies to install.

```sh
npm run dev     # build, serve http://localhost:5173, rebuild on every save (refresh to see changes)
npm run build   # write dist/index.html
```

`dist/index.html` is the whole game: open it straight from disk or host it anywhere.

## Layout

```
src/
  index.html      page template ({{styles}}, {{boot}}, {{game}} are filled in by the build)
  styles.css      page styles
  boot.js         font loader and the on-screen error reporter
  data/           content and tuning tables (loaded first)
    character.js            crew files, substats, cores, skills, movement skills, psychic actions, sling, injuries, spacebar styles
    crafting.js             Workbench recipes and upgrades, grinder salvage yields
    creatures.js            creature stats, bestiary order and text, kill points, threat costs, bosses, hunting memory, arena waves, traits
    events.js               between-deck events, transit stop text
    food.js                 food, raw ingredients, cooking
    hacking.js              hack panel rounds, windows and cursor speed
    inspect.js              V-look descriptions of fixtures and floor hazards
    items.js                gear, quick items, tools, pickups, flasks, liquid tank, vending stock, resource text
    npcs.js                 NPCs
    progress.js             deck grades, run stats, work orders (achievements, tiered levels), point trades, challenge modifiers
    herbs.js                herbs, herbal preparations (poultices, incense, draughts)
    loadouts.js             armed humans' kits by enemy type and depth, combat tuning, console presets, Codex text
    scenarios.js            sector scenarios: weights, counts and score multipliers, Codex text
    security.js             security camera tuning and Codex text
    route.js                express shafts, vault junctions and archive vaults, deck secured, crawlways
    status.js               frozen status and cryo grenade tuning, active reload, smoke blindness, player stun, glancing hits, tear gas and nerve gas
    traps.js                trap types, trap tuning, trap control panel text, toxic vents, plate doors, crates, item weight
    versions.js             in-game version history
    weapons.js              armaments, gun stats, magazines, crits, damage ranges, charge and combo timing, blower and stun gun tuning
    world.js                sectors, biome layouts, palettes, route nodes, water depths, room modules, deck conditions, hazard text, deck sizes
  game/           the game, split by system
    01-core.js              canvas, view sizes, deck size variables, run seeds, shared helpers
    02-audio.js             sound synthesis
    03-equipment.js         equipping armaments, quick items, flasks, liquid tank, tools, sling, psychic powers
    04-state.js             run and world state, scoring, deck conditions, movement and collision
    05-levelgen.js          deck sizing, deck generation, pathfinding, slime, oil, cooking, barrels, gas clouds, cables
    06-arcade.js            arcade cabinet games, ice
    07-world-fx.js          sprinklers, fans, plants, hazards, vending machines, panels, liquids
    08-tile-art.js          tile, fire and decoration painting
    09-population.js        placing creatures, items and chests
    10-player.js            gear slots, skills, perk cores, injuries
    11-recipes.js           crafting and upgrades
    12-flow.js              new game, save and continue, objectives, alarms, entering a deck
    13-test-range.js        test range and arcade hall
    14-route-map.js         sector maps, bosses, route choice
    15-transit.js           transit stops, message log
    16-node-screens.js      rest, merchant and signal stops
    17-devices-npcs.js      test-deck picker, grinder, freezers, cameras, breakers, stasis pods, NPCs
    18-dice-options.js      Hands and Bones dice game, options, spawn console
    19-input.js             browser events, key and menu dispatch
    20-progress-screens.js  food pouch, bestiary, run stats, work orders (shown in the Files tab)
    21-mechanics.js         skill binding, crits, webs, trip alarms, weapon switching
    22-actions.js           guns and reloading, melee, dash, psychic powers, combo
    23-vision.js            line of sight, shadows, astral projection
    24-update.js            per-frame simulation
    25-render-helpers.js    text, UI boxes, sprites
    26-hud.js               HUD
    27-menus.js             pack, workbench, perks, files, map, codex and title menus
    28-render-world.js      world rendering, lighting, fog
    29-loop.js              main loop
    30-traps.js             pressure plate traps (incl. gas), trap control panels, toxic floor vents
    31-plate-doors.js       plate doors, crates, item weight
    32-spacebar.js          spacebar styles: kick and repulse
    33-cold.js              creature cold meters, frozen player and creatures, cryo clouds
    34-herbs.js             herb generation, herbalism, poultices, incense, draughts, timed buffs
    35-vaults.js            express shafts, vault junctions, archive vaults and their dangers
    36-backtrack.js         deck secured walk-back to the lift, ceiling crawlways, time passing, keeping the lift area clear, the 3x3 lift pads
    37-pacing.js            how long creatures hunt you, muffled noise, arena waves, ghost movement, smoke blocking creature sight
    38-inspect.js           HUD ability icons, hover tips on icons and hotbar slots, V-look descriptions
    39-damage.js            damage ranges, the crit-or-glance roll, glancing hits on and off the player, damage text
    40-cameras.js           security cameras: generation, panning, lock-on and alarm, damage, control panels, drawing
    41-scenarios.js         sector scenarios: the roll, scen() and the generation hooks, announcement, map header line
    42-gas.js               tear gas and nerve gas: player and creature effects, riot guard and riot drone canisters, V-look
    45-traits.js            creature traits: rolling, effects hooks, volatile bursts, marks, bestiary memory, console presets
    44-loadouts.js          armed humans: kit rolling, kit guns (magazines, reloads), kit melee, quick items, drops, drawing, V-look text
    43-tools.js             industrial blower (air lane and its pushes) and stun gun (zaps, stun, water jolts), arcs drawing
scripts/build.mjs  the build
docs/specs/        change request batches
```

The source files are **not** ES modules. The build joins `src/data/*.js` and then
`src/game/*.js`, each folder in filename order, inside one `'use strict'` closure,
so they share a scope: a file can use anything declared in an earlier one, and
functions can be called from any file. Data loads first, so every game file can
use any table. To add a game file, give it a number that places it after
everything it needs at load time. The build checks syntax, and an error names the
source file and line.

## Publishing

`.github/workflows/pages.yml` builds every push and pull request, and deploys
pushes to `main` to GitHub Pages. One-time setup: **Settings → Pages → Build and
deployment → Source: GitHub Actions**.
