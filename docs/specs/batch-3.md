# Kestrel Deep - Batch 3 change requests

Status: READY TO SEND (Batches 1 and 2 are complete; the game is at v0.98)

Save this file in the repository as `docs/specs/batch-3.md` when the batch is sent.

Scenarios (Request 16) adjust features added in Batches 1 and 2 (traps, gas vents, herbs, freezing, vaults), and Request 18 builds on the gas cloud system, gas traps and the v0.93 smoke sight rules.

## How to work through this batch

Do **one session at a time**:

1. Read CLAUDE.md and this file, then do only the current session's requests.
2. Test in a browser before committing: `npm run build` must pass, then no errors on the title screen, a new run, the test range and the arcade, plus the session's own "Done when" checks.
3. Update both version histories (the `VERSIONS` array in `src/data/versions.js` and the changelog comment at the bottom of `src/index.html`), the Codex, `README.md`'s file list and CLAUDE.md where the change affects conventions or architecture.
4. Add anything new to the test range so it can be checked quickly.
5. Commit with a clear message, then **stop**. Post a short summary: what changed, how to test it in-game, anything you had to decide that wasn't specified, and anything left unfinished.
6. Wait for the owner to playtest and say "continue" before starting the next session.

If something in a request conflicts with how the code actually works, choose the option closest to the request's goal, note it in the summary, and carry on.

**Conventions from CLAUDE.md that apply throughout this batch:**
- New numbers and text go in tables in `src/data/` (a new file where nothing fits, for example `src/data/scenarios.js`); new systems get their own numbered file in `src/game/` after `38-inspect.js`.
- All generation runs inside the existing seeded scopes (or its own `seeded()` key); counts that should grow with the deck use `aN()`; never hard-code deck size.
- Creature sight of the player goes through `seesPlayer(e)` (line of sight plus smoke). New melee attacks go through `asMelee()`.
- New creatures need the full checklist (`ET`, `BEASTS`, `BEASTINFO`, `KILLPTS`, `THREAT`, `pickType()`, an AI branch, a draw branch). Remember `trackTick()` hunt memory applies to them.
- New world objects need a line in `inspectAt()` (V-look) and must be kept clear of lift pads (`clearLiftArea()`). Code that loops over `barrels` must decide what to do with crates.
- Player-facing text says **work orders**, never "achievements" (the code keeps `ACH`, `checkAch()`, `drawAch()`).
- New test-lift options go after Biome in `DECKOPT`.
- Keep the save format working (`saveRun()` / `loadRun()`; older saves must still load).

| Session | Requests | Size |
|---|---|---|
| 1 | Request 17: Damage ranges and glancing hits + Request 14: Tiered work orders | Medium |
| 2 | Request 15: Security cameras | Medium |
| 3 | Request 16: Sector scenarios | Large |
| 4 | Request 18: Tear gas and nerve gas | Medium-large |
| 5 | Request 19: Industrial blower + Request 20: Stun gun | Medium-large |

---

# Session 1

## Request 17: Damage ranges and glancing hits

**Goal:** Give every weapon and attack a damage range instead of a fixed number, plus a "glancing hit" (the opposite of a crit), so weapons can be told apart by how predictable they are, not just by their average.

**Damage ranges**
- Each weapon and attack gets a **minimum and maximum** damage instead of one value. Damage is rolled within that range on every hit (a gentle bell-shaped roll, for example the average of two random numbers, so extremes are rarer than the middle).
- **Keep current balance on average:** set each range around the weapon's current damage, so average damage per hit (and per second) stays the same at launch. The roll applies to the base damage, before the existing multipliers (crits, charge, combo, ambush, frozen x1.6), so those keep working as they do now.
- Weapons get a clear **character** from the width of their range. Store it as a range width per armament in `src/data/weapons.js` (for example a `var` field on `ARM` entries, or a small table keyed by armament), not as hard-coded numbers in the damage code:

| Weapon or attack | Range around current damage | Character |
|---|---|---|
| Sidearm, bolt driver, chainsaw, flamethrower, ray gun | 90-110% | steady |
| SMG, nailer, box cutter, crowbar, spear, whip, kick | 80-120% | reliable |
| Bat, fists, throwing knives, bow (uncharged) | 70-130% | swingy |
| Scattergun pellets, sling debris (already variable), explosions | 50-150% | wild |

- Anything not listed defaults to reliable (80-120%).
- The trade-off this sets up for the balance pass: steady weapons are predictable, while swingy and wild weapons reach much higher peaks. At launch, keep averages unchanged so nothing shifts before playtesting.
- Creature attacks get a modest range too (85-115% of their current damage), so incoming hits feel less mechanical. Trap, hazard and status damage stay fixed.
- Show ranges to the player: weapon descriptions, the Workbench, the hover tips and the Stats tab list damage as a range ("damage 3-5") with the character word (steady / reliable / swingy / wild).

**Glancing hits**
- A **glancing hit** does **half damage**, little knockback and no stun build-up, with a dull "tink" sound and a small grey "glance" callout. It's the opposite of a crit, and the two never happen on the same hit (decide both in one roll).
- **Base glancing chance: 8%** for the player's attacks.
  - Lowered by **Dexterity** (-1% per point) and **Perception** (-0.5% per point), down to 2%.
  - Perfect charged releases and ambush attacks never glance.
  - **Armoured creatures** are glanced more often: brutes, plated snails, security guards, wardens and bosses add +8%.
- **Creature hits on the player can glance too:** base 5%, raised by armour gear (each point of current armor adds a little, up to +10%) and while blocking with a riot shield. A glancing hit on the player does half damage, adds only half the usual stun (`STUN_CFG`), and doesn't break combos.
- All glancing numbers go in a `GLANCE_CFG` table (`src/data/status.js` or `weapons.js`).
- The Stats tab shows current glancing chances next to critical chances.

**Where it plugs in:** `ARM`/`WPN`/`WCRIT` in `src/data/weapons.js`, damage rolls for melee (`primaryAttack0()`, `kick0()`), guns, thrown weapons, the sling, `explode()` and creature attacks, the crit roll, `damageEnemy()`, `hurtPlayer()`, combos, the Stats tab, weapon descriptions and hover tips, the Codex Systems entries "Critical hits" (rename to "Crits and glancing hits") and "Guns and ammo".

**Out of scope:** no change to average damage at launch; actual retuning belongs to the balance pass.

**Done when:** each weapon rolls damage within its range (check a few hundred test hits per weapon against a test range dummy: the average stays close to the old fixed value), glancing hits happen at roughly the stated rates against normal and armoured targets, crits and glances never stack, creature hits can glance off the player, and the Stats tab and descriptions show ranges and chances.

## Request 14: Tiered work orders

**Goal:** Let count-based work orders keep going instead of stopping after one completion, with higher levels at higher thresholds.

**Behaviour**
- Count-based work orders gain **levels** (I, II, III, IV), each with a higher threshold. Reaching a new level awards its points again (base points x level number) with the usual callout ("work order: exterminator II").

| Work order | Level I | II | III | IV |
|---|---|---|---|---|
| Exterminator (creatures taken out) | 50 | 100 | 200 | 400 |
| Lockpicker (hacks) | 8 | 16 | 32 | 64 |
| Treasure hunter (secret rooms) | 4 | 8 | 16 | 32 |
| Sharpshooter (critical hits) | 25 | 50 | 100 | 200 |
| Line cook (dishes cooked) | 5 | 10 | 20 | 40 |
| Deep diver (depth reached) | 6 | 10 | 14 | 18 |
| Arcade regular (arcade wins) | 3 | 6 | 12 | 24 |
| Untouched (decks finished without damage) | 1 | 3 | 6 | 10 |
| Ghost of the deck (deep decks with no wave drawn) | 1 | 3 | 6 | 10 |
| Vault breaker (vaults opened in different sectors) | 3 | 5 | 7 | 9 |

- If any of these names or counters differ in `ACH` today, match the closest existing work order and note it in the summary. Thresholds live in the `ACH` entries in `src/data/progress.js` (for example a `lv:[...]` array).
- One-off work orders (First blood, Frenzied, Well fed, Archivist, and the crew file work orders from v0.92) stay single-level.
- **Files > Work orders view:** each tiered work order shows its current level, a small progress bar toward the next level and the next threshold ("exterminator II  134 / 200"). The list already scrolls (`woScroll`); keep that working with the taller rows.
- **Meta-progression:** `META.ach` records the highest level of each work order ever reached (a number; an existing `true` from older profiles reads as level I). Challenge modifiers still unlock at level I. Point trades (`apTrade()`) keep working.

**Where it plugs in:** `ACH` and `checkAch()`, `drawAch()` in the Files tab, `META.ach` and `kd_meta`, `player.ach` in the save, the Codex.

**Done when:** tiered work orders level up at each threshold with points and a callout, the view shows progress to the next level, the profile keeps the best level (and an old profile still loads with its completed orders intact), and existing modifier unlocks still work.

---

# Session 2

## Request 15: Security cameras

**Goal:** Stationary security sensors that sweep an area like a guard's flashlight and raise the alarm if they see you, adding stealth routing to security-heavy decks.

**Note for implementation:** the game already has a "lift camera" terminal (shows the next lift ride). These are a different thing; name them security cameras in code and text (for example `secCams`, reset in `resetHidden()`).

**Behaviour**
- Wall-mounted cameras that **pan slowly back and forth** across about 90 degrees, with a faint **vision cone** drawn the same way as guard flashlights (about 140 px range, blocked by walls). Faint white while scanning.
- If the player is inside the cone and in sight, the camera **locks on**: the cone turns amber and a short warning chirp sounds. After **1.5 s** of continuous sight, the cone turns red and the camera raises the **security alarm** (`raiseAlarm()` / `secT`: klaxon, strobes, 2-3 called security guards, as for trip scanners).
- Sight uses the same rules as creatures: line of sight plus `smokeBlocks()` (a camera is not a creature, so share the logic rather than calling `seesPlayer(e)` on it). Breaking line of sight, cloaking, or being hidden by smoke before the 1.5 s is up resets it.
- **Counterplay:**
  - Cameras can be **shot or hit** (3 health). A destroyed camera sparks and goes dark.
  - Cutting deck power with the **breaker** (`powerOff`) disables all cameras.
  - Each camera can be wired to a nearby hack panel, the same way trap control panels are (`wireTrap()` style, a new `reward:'cams'`), that loops its feed and switches it off. A failed hack raises the alarm instead.
- Each camera can raise the alarm once; after that it keeps tracking (cone red) but doesn't call more guards.
- Cameras don't react to creatures.
- **Generation (seeded):** from depth 3, `aN(0-2)` per deck, placed on walls covering corridors, doorways and rooms with loot; never in the start room or on a lift pad. Numbers in a `CAM_CFG` table. More in the Security crackdown scenario (Request 16).
- V-look (`inspectAt()`) describes a camera and its state (scanning, locked on, alarm raised, off, broken). Found cameras show on the station map.
- **Test lift:** a Cameras option (normal / off / on) after Biome in `DECKOPT`.

**Where it plugs in:** a new game file for cameras, drawing (sharing the guard flashlight cone code), the security alarm, the breaker, hack panels (`HACKR`), smoke sight, damage to fixtures, `inspectAt()`, `clearLiftArea()`, the station map, the Codex (a Systems entry), the test range (a camera in the hazards area, wired to a panel).

**Done when:** a camera pans, locks on and raises the alarm after 1.5 s of sight, is reset by breaking sight, cloak or smoke, can be destroyed, hacked off or powered down, appears at the stated rates, and V-look describes it.

---

# Session 3

## Request 16: Sector scenarios

**Goal:** A scenario for each sector (zone) that shifts what the station throws at you there, so sectors feel distinct and some are notably more dangerous or more rewarding.

**How scenarios work**
- When a new sector starts, a **scenario** is rolled inside the sector's seeded scope (`['sector',sec]`), so it repeats on the same seed. The first sector of a run is always **Normal operations**; from the second sector, any scenario can appear.
- The scenario is announced when the sector begins ("scenario: security crackdown") and shown on the sector map header and in Progress > Run stats.
- A scenario is a set of **weight and count adjustments**, kept in one data table (`SCENARIOS` in a new `src/data/scenarios.js`) so new scenarios are easy to add. It can adjust:
  - deck conditions (light, hazard and objective weights) and deck size odds
  - creature spawn weights (`pickType()`) and the threat budget
  - module (room type) frequency
  - which NPCs appear and how often
  - lift-ride event availability and weights
  - disturbance build-up rate
  - counts of security features (guards, drones, cameras, trip scanners), traps (`TRAP_WEIGHTS`, gas trap odds) and vents (toxic vent odds)
  - mini-boss chance on arena and vault decks
- **Pacing (from the v0.87 balance pass):** scenarios should change *what* appears much more than *how much*. Keep any threat budget increase small (at most +10%), so a scenario never brings back the "bombardment" feel. Hunt memory (`trackTick()`) is unchanged.
- Dangerous scenarios add a **score multiplier** for that sector's decks, shown with the scenario and on the deck report.

**Scenarios**

| Scenario | What changes | Score |
|---|---|---|
| **Normal operations** | Nothing. | x1 |
| **Security crackdown** | Security guards on nearly every deck (from depth 2), extra drones, security cameras (Request 15) on most decks, double trip scanners, alarms call one extra guard. Disturbance builds 15% faster. More locksmiths and inspectors, fewer traders. Lockers hold more ammo and keys. | x1.3 |
| **Lab outbreak** | Overgrowth and toxic spill decks far more common. More plants, bloom wasps, duct spiders, slugs and bog frogs. Laboratories, greenhouses and medbays more common. Poison gas traps and toxic vents more common. Herbs more plentiful. Subject Nine and the KR-7 android appear more often. A biohazard-themed lift event ("quarantine checkpoint") becomes available. | x1.2 |
| **Flooded section** | Flooded decks and water much more common. More bog frogs, lurkers, graspers and brine snakes. Washrooms and bathhouses more common. Low gravity events rarer. | x1.15 |
| **Blackout** | Dark decks and dark rooms much more common, breaker panels already off on many decks. More ghosts and duct spiders. Lanterns, glowsticks and flares more common in loot. | x1.2 |
| **Cold snap** | Cold store conditions, cold vents and freezing water more common; Frozen status comes up more. More frost-related lift events. Emberleaf herbs more plentiful. | x1.15 |

If a named creature, module, NPC or event doesn't exist under that name, use the closest existing one and note it.

**Run setup:** challenge modifiers could later force a scenario (for example "always crackdown"); not needed now.

**Where it plugs in:** `genSector()` / `newSector()`, `rollCond()`, `populate()` and `pickType()`, module placement, NPC placement, lift-ride events (`TEXTEV`), disturbance (`updateAlert()`), security feature, camera, trap and vent generation, the arena and vault mini-boss chance, the deck report and live score, the sector map header, Run stats, saving (the scenario is part of the saved route; older saves without one mean Normal operations), the Codex (a Scenarios category), and the test lift (a Scenario option after Biome in `DECKOPT`: none / each scenario).

**Out of scope:** no new creature types or bosses.

**Done when:** each sector after the first rolls a scenario that is announced and shown on the map; the stated changes are clearly visible over a few decks of each scenario in the test range; the score multiplier applies; the scenario survives save and Continue and repeats on the same seed; creature counts stay close to Normal (within about 10%); and the Codex lists every scenario.

---

# Session 4

## Request 18: Tear gas and nerve gas

**Goal:** Two new gas cloud types built on the existing cloud system (`CLOUD`, `updateClouds()`, `puff()`): **tear gas**, a disabling crowd-control gas that upgraded security uses against the player, and **nerve gas**, a rare and genuinely deadly gas. Both also come as player throwables.

**Tear gas** (pale yellow-white clouds)
- **On the player**, inside the cloud:
  - vision shrouded heavily, like smoke (reuse the existing cloud shroud)
  - an **"irritated"** status that builds while inside: aim spread +60%, stamina recovery halved, and a short cough now and then that interrupts sprinting. It fades over about 6 s after leaving the cloud.
  - **no damage** and no air drain
  - a gas mask or filter gear halves the effects
- **Blocks creature sight like smoke:** add tear gas to `smokeBlocks()` (its own threshold in `SMOKE_BLIND`). The riot guard's mask lets it see through tear gas.
- **On creatures** without masks: they back away out of the cloud, attack less accurately and pause their pursuit while inside. Plants, drones and ghosts are unaffected.
- Dissipates like poison clouds, and fans, repulse and the blower (Request 19) push it.

**Nerve gas** (dark violet clouds, drifting low)
- **Deadly:** inside the cloud, about **3 damage per second** at its thickest (quiet hazard ticks, like poison), plus a **"seizing"** status that builds toward a full **stun (about 1.5 s)** at 100, then resets. It also drains air like smoke.
- A gas mask or filter gear **halves** it but doesn't make you immune.
- Affects every creature except drones and ghosts the same way, and is fatal to plants and slime creatures.
- Lingers about twice as long as poison clouds before dissipating. Fans push it.
- A clear warning: violet haze, a faint hiss, and the "seizing" status line on the HUD.

All numbers for both gases go in a `GAS_CFG` table (`src/data/status.js`). V-look on a cloud tile names the gas.

**Player throwables** (quick items, thrown like the gas grenade)
- **Tear gas grenade** (Workbench: pipe + powder + cloth + bitterwort herb): releases tear gas for about 5 s, filling a small room.
- **Nerve gas grenade:** needs a rare **nerve agent ampoule** (found only in laboratories, archive vaults, and Security crackdown lockers) plus pipe and powder. Releases nerve gas for about 4 s. Limit: carry at most 2.
- Both get Codex entries and appear in the test range armory.

**Enemies that use tear gas** (upgraded variants of existing creatures)
- **Riot guard** (security guard variant): darker armour with a gas mask (immune to tear gas and sees through it), slightly more health, armoured for glancing hits (Request 17). From depth 6, and much more often in the Security crackdown scenario. When it can see the player (`seesPlayer(e)`) at 60-140 px, it **lobs a tear gas canister** at them on a **12 s cooldown**, then advances through the cloud. Otherwise behaves like a security guard (flashlight cone, backup calls).
- **Riot drone** (drone variant): a heavier drone with a canister underneath. From depth 7, more often in Security crackdown. When it spots the player it **drops a tear gas canister** on them on a **15 s cooldown**, then hangs back and beeps to draw attention as normal drones do.
- Both go through the full new-creature checklist (threat: riot guard about 3.5, riot drone about 2) and appear in the test range creature console. Called guards during a Security crackdown alarm can be riot guards from depth 6.
- No enemy uses nerve gas.

**Where it plugs in:** `CLOUD` and `updateClouds()`, `smokeBlocks()`, status meters ("irritated" and "seizing", HUD lines), creature AI (avoiding tear gas, nerve gas damage), gas masks and filter gear, `QUICK` and `RECIPES`, loot tables (the nerve agent ampoule), the security guard and drone AI branches, the creature tables, `SCENARIOS` weights, `inspectAt()`, the Codex (Hazards, Items, Creatures), the test range.

**Out of scope:** no change to existing smoke, steam or poison clouds.

**Done when:** tear gas shrouds vision, blocks creature sight and irritates without damage, and makes unmasked creatures retreat; nerve gas damages, builds to a stun and drains air for player and creatures, halved by filter gear; both grenades work and the nerve agent ampoule only drops where stated; riot guards and riot drones appear at the stated depths, use tear gas on their cooldowns and are immune or masked as described; and the version history, bestiary and Codex are updated.

---

# Session 5

## Request 19: Industrial blower (air armament)

**Goal:** A weapon-tool that blows a continuous stream of air, like the broken wall fans but aimed by the player, so gases, fire, objects and creatures can be moved deliberately. It pairs with the new gases (Request 18) and the existing fans, clouds, barrels and crates.

**The armament**
- **Industrial blower**: an off-hand armament used like a gun. Hold right click to aim, hold left click to blow. Drawn as a chunky nozzle with a canister, with a visible stream of fast air streaks and dust while running.
- **Power:** runs on **power cells**, about 1 cell per 4 s of blowing. With no cells it does nothing ("the blower needs power cells").
- **Workbench:** 2 pipe + 2 batteries + 3 scrap (comes with 4 cells).
- **Noise:** a loud whine while running, which makes noise (`noise()`, so `noiseReach()` applies) and adds disturbance like other loud equipment.
- No damage of its own. It can cause damage indirectly (wall slams, pushing creatures into hazards or onto trap plates).
- Numbers in a `BLOWER_CFG` table in `src/data/weapons.js`.

**The air stream**
- A lane about **100 px long and 24 px wide** in the aim direction, stopped by walls, working like a fan's gust lane but continuous and stronger close to the nozzle.
- What it does inside the lane:
  - **Gas clouds** (steam, smoke, poison, cryo, tear gas, nerve gas, incense): pushed strongly along the stream and thinned a little, so you can clear a room, blow smoke between you and a creature, or blow a cloud onto enemies.
  - **Fire:** small fires within about 40 px are **blown out** after about 0.5 s of steady air; further away, the stream just pushes smoke. Flamethrower streams and fire from flame traps are bent away by it.
  - **Barrels and crates:** pushed along (light barrels slide far, crates less), like a strong fan gust.
  - **Creatures:** pushed back with continuous knockback, scaled by size: bloom wasps, drones and other light flyers are blown away hard, small creatures stagger back, brutes and bosses barely shift. Creatures pushed into walls take impact damage as normal (doubled if frozen). Ghosts are unaffected.
  - **Loose items** slide along the floor (`it.kvx`/`it.kvy`).
  - **Enemy projectiles** that travel slowly (spitter globs, web shots, seeds, trap darts) are slowed and deflected.
  - **Liquids:** no effect on pools.
- **Recoil:** the player is pushed back slightly while blowing, more while floating or in low gravity.

**Where it plugs in:** `ARM` (off-hand, gun-style controls), power cells, the fan gust code (shared lane and push logic), the gas cloud system, fires, barrel and crate physics, creature knockback and impact damage, enemy projectiles, noise and disturbance, `RECIPES`, hover tips, the Codex (Weapons and Systems entries), the test range armory.

**Out of scope:** no damage from the air itself, no effect on liquids.

**Done when:** the blower pushes and thins each gas type, blows out nearby fires, moves barrels, crates, items and creatures by size, slows and deflects slow projectiles, uses power cells at the stated rate, makes noise, and appears in the Workbench, test range and Codex.

## Request 20: Stun gun

**Goal:** A close-range electrical weapon that zaps rapidly for little damage but stuns quickly, giving a dependable way to lock down one dangerous creature at a time. It shares power cells with the blower (Request 19).

**The armament**
- **Stun gun**: a **main-hand** armament (so it pairs with an off-hand gun or the blower). Hold **left click** to zap continuously; no aiming needed.
- Drawn as a stubby prod with two prongs and a blue glow at the tip.
- **Rapid, very short range:** about **5 zaps per second**, each a jagged blue electrical arc from the tip to the nearest creature within about **28 px** in front of you (a narrow cone). With nothing in range, a short arc crackles into the air.
- Zaps are melee hits: run them through `asMelee()` (so the frozen x1.6 bonus applies).
- **Damage:** low, about **0.8 per zap**, with a steady damage range (Request 17).
- **High stun:** each zap adds about **25 to the creature's stun build-up** (the same meter the cable whip fills; brutes about 15). When it fills, the creature is **stunned for about 1.4 s** ("reeling"), then the meter resets. In practice, most creatures are stunned after under a second of steady zapping. A glancing zap adds no stun (Request 17).
- **Power:** uses **power cells**, about 1 cell per 2 s of zapping. With no cells, it's a weak prod (small damage, no stun).
- **Workbench:** 2 batteries + 1 pipe + 1 cloth + 2 scrap (comes with 6 cells).
- **Noise:** a sharp crackle, moderately loud.
- **Combos:** each zap that hits adds a little to the melee combo (like chainsaw ticks), and zaps can crit or glance like other hits.
- Numbers in a `STUNGUN_CFG` table in `src/data/weapons.js`.

**Electrical interactions**
- **Wet or in water:** zapping a creature that is soaked (for example by the super soaker) or standing in water **doubles the stun build-up**, and the arc **jumps to every other creature in the same water** within about 40 px for a smaller jolt.
- **You in water:** zapping while you stand in water gives you a small shock as well (adds to your shock meter).
- **Machines:** drones, riot drones and security cameras (Request 15) take triple damage from zaps and are disabled for longer when stunned.
- **Oil:** an arc into oil can ignite it, like a spark.
- **Ghosts** are unaffected.

**Where it plugs in:** `ARM` (main hand), `asMelee()`, power cells, the whip's stun build-up meter, the water and wet status, the shock status, combos, crits and glancing hits, oil ignition, drones and security cameras, `RECIPES`, hover tips, the Codex (Weapons, Systems entries), the test range armory.

**Out of scope:** no changes to the ray gun or other electrical hazards.

**Done when:** holding left click zaps the nearest creature in range about 5 times a second with low damage, most creatures are stunned in under a second, wet creatures stun twice as fast and pass the jolt through shared water, machines take extra damage, zapping in water shocks the player slightly, cells drain at the stated rate, and the stun gun appears in the Workbench, test range and Codex.
