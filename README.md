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
    creatures.js            creature stats, bestiary order and text, kill points, threat costs, bosses
    events.js               between-deck events, transit stop text
    food.js                 food, raw ingredients, cooking
    items.js                gear, quick items, tools, pickups, flasks, liquid tank, vending stock, resource text
    npcs.js                 NPCs
    progress.js             deck grades, run stats, achievements, point trades, challenge modifiers
    herbs.js                herbs, herbal preparations (poultices, incense, draughts)
    route.js                express shafts, vault junctions and archive vaults
    status.js               frozen status and cryo grenade tuning, active reload
    traps.js                trap types, trap tuning, trap control panel text, plate doors, crates, item weight
    versions.js             in-game version history
    weapons.js              armaments, gun stats, magazines, crits, charge and combo timing
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
    20-progress-screens.js  food pouch, bestiary, run stats, achievements
    21-mechanics.js         skill binding, crits, webs, trip alarms, weapon switching
    22-actions.js           guns and reloading, melee, dash, psychic powers, combo
    23-vision.js            line of sight, shadows, astral projection
    24-update.js            per-frame simulation
    25-render-helpers.js    text, UI boxes, sprites
    26-hud.js               HUD
    27-menus.js             pack, workbench, perks, files, map, codex and title menus
    28-render-world.js      world rendering, lighting, fog
    29-loop.js              main loop
    30-traps.js             pressure plate traps and trap control panels
    31-plate-doors.js       plate doors, crates, item weight
    32-spacebar.js          spacebar styles: kick and repulse
    33-cold.js              creature cold meters, frozen player and creatures, cryo clouds
    34-herbs.js             herb generation, herbalism, poultices, incense, draughts, timed buffs
    35-vaults.js            express shafts, vault junctions, archive vaults and their dangers
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
