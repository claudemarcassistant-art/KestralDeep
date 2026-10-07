# Kestrel Deep - Batch 1 change requests

Save this file in the repository as `docs/specs/batch-1.md`.

## How to work through this batch

The batch is split into **four sessions**. Do **one session at a time**:

1. Read CLAUDE.md and this file, then do only the current session's requests.
2. Test in a browser before committing: no errors on the title screen, a new run, the test range and the arcade, plus the session's own "Done when" checks.
3. Update both version histories (the VERSIONS array and the changelog block), the Codex, and CLAUDE.md where the change affects conventions or architecture.
4. Add anything new to the test range (creature console, deck builder or a test fixture) so it can be checked quickly.
5. Commit with a clear message, then **stop**. Post a short summary: what changed, how to test it in-game, anything you had to decide that wasn't specified, and anything left unfinished.
6. Wait for the owner to playtest and say "continue" before starting the next session.

If something in a request conflicts with how the code actually works, choose the option closest to the request's goal, note it in the summary, and carry on.

Request numbers are kept from the original planning list (they cross-reference each other), so they appear out of numerical order below.

| Session | Requests | Size |
|---|---|---|
| 1 | Request 5: Deck sizes | Large |
| 2 | Request 6: Run seeds | Large |
| 3 | Request 1: Pressure plate traps + Request 2: Trap control panels | Medium |
| 4 | Request 3: Weight plates, plate doors and crates + Request 4: Spacebar styles | Medium-large |

---

# Session 1

## Request 5: Deck sizes (small, medium, large)

**Goal:** Vary deck size by type for variety, without making runs longer overall or hurting performance.

**Sizes**

| Size | Tiles | Area vs today | Role |
|---|---|---|---|
| **Small** | 48 x 48 | about 0.56x | tight, dense decks: fewer rooms, closer quarters |
| **Medium** | 64 x 64 | 1x (current) | the standard deck |
| **Large** | 96 x 80 | about 1.9x | occasional sprawling decks |

**Which decks get which size**
- Most decks are Medium. Roughly: 25% Small, 60% Medium, 15% Large on ordinary junctions.
- The **last deck before a sector's exit** and **arena decks** lean Large (about 50% chance each).
- Lift-ride landings, the test range and the arcade keep their current fixed layouts.
- The size is decided with the junction's other conditions, so it can be shown on the sector map once the junction is known (for example "large deck" alongside light and hazard), and in the test range deck builder as "Size: random / small / medium / large".

**Make the map size variable**
- Replace every hard-coded 64 with the deck's width and height (`MW` and `MH` set per deck). The per-tile arrays, pre-drawn layers, fog and visibility layers, camera bounds and saved route data must all follow the current deck's size.
- The station map screen (M) must scale to fit any size.

**Scale gameplay with area** (use area relative to Medium as the multiplier, about 0.56 / 1 / 1.9)
- Room count, modules, hazards, secrets, loot and NPC closets scale with area. (Traps and plate doors from later sessions will scale the same way.)
- **Threat budget** scales with area, so Large decks aren't empty and Small decks aren't overcrowded.
- **Disturbance from exploration** is divided by the area multiplier, so exploring a whole Large deck builds about as much disturbance as exploring a whole Medium one.
- Deck score expectations (par time, potential points) scale with area so grades stay fair.

**Performance** (needed for Large)
- The creature pathfinding field should cover only the region around the player (about 40 tiles in each direction) or be recalculated in slices over several frames, rather than the whole map at once.
- Whole-map scans that run on timers (such as slag checking for water) should only check tiles that can change, or spread the work over frames.
- Target: a busy Large deck runs as smoothly as a busy Medium deck does now.

**Out of scope:** no changes to how rooms or modules look, and no changes to lift landings, the test range or the arcade.

**Done when:** all three sizes generate correctly at several depths; the station map, saving and continuing, and the test range deck builder work with each size; a Large deck with a hunter, an alarm and a gas grenade going off stays smooth; and the version history and the Codex Systems entry on decks are updated.

---

# Session 2

## Request 6: Run seeds (repeatable runs)

**Goal:** A seed that reliably recreates the same station for a run: for reproducing bugs, fair balance testing, sharing runs and daily challenges.

**What the seed controls (the station)**
- Every sector map: junction positions, hidden shafts, junction types and conditions, arena placement, the hunter's starting junction.
- Every deck: size (Request 5), layout, rooms and modules, conditions, hazards, creature placement, loot and chest contents, NPC closets and which NPC. (Traps and plate doors from later sessions must use it too.)
- Lift-ride events between decks and what they offer.

**What stays unpredictable (the player's influence)**
- Combat and moment-to-moment randomness: hit and crit rolls, damage spread, creature decisions, particles and other effects keep using the ordinary random generator.
- Things that by design depend on the player's state (for example crew file drops that skip files already found) may differ between attempts. That's acceptable.

**How it should work**
- Add a small, fast seeded random generator (for example mulberry32 or sfc32) and a helper that derives a sub-seed from text keys.
- **Each deck gets its own seed derived from the run seed plus its place in the run** (sector number and junction id), and each lift ride from the run seed plus its from/to junctions. Never draw generation randomness from one shared stream that gameplay also consumes: fighting an extra creature on one deck must not change the next deck.
- Route all generation randomness through the seeded generator: sector maps, deck generation and population, loot rolls at generation time, lift events. Runtime randomness stays on Math.random.
- Seeds are shown as a short, readable code (for example "KESTREL-4471" or a few words), and typed seeds are normalised (case and spaces ignored).

**Where it shows up**
- **Run setup:** a seed field. Blank = random seed (still recorded), a typed seed, or a **Daily** option that derives the seed from today's date.
- **During a run:** the seed shown in the pack menu (Progress > Run stats) and on the death screen, so it can always be noted down.
- **Saving:** the run save stores the seed, and Continue resumes on the same seed.
- **Scores:** runs on a typed or daily seed are marked as seeded on the death screen and in the best score.
- **Test range:** the deck builder gets an optional seed field so a specific deck can be regenerated for debugging.

**Where it plugs in:** newGame and run setup, sector and deck generation, populate, lift ride events, saveRun and loadRun, the death screen and Run stats, the test range deck builder. **Add a rule to CLAUDE.md: all new generation code must use the seeded generator.**

**Out of scope:** no change to combat randomness and no online leaderboards.

**Done when:** starting two runs with the same seed produces identical sector maps and identical decks at several depths (compare a fingerprint of each deck's tiles, fixtures and spawns); playing differently on deck 1 doesn't change deck 2; Continue keeps the seed; Daily gives the same seed all day; and the version history and Codex Systems entry are updated.

---

# Session 3

## Request 1: Pressure plate traps (spike, flame, dart, falling debris)

**Goal:** Floor traps that punish careless movement and reward caution, and that creatures can also set off, so players can lure enemies into them.

**Shared behaviour**
- A pressure plate sits flush with the floor and is hard to spot: a slightly lighter tile with four small rivets. With 3 or more Perception, plates within about 30 px give a faint glint. Sonar pulse and the signal scanner reveal plates nearby.
- Stepping on a plate gives a 0.4 s mechanical click (with a sound), then the trap fires. The plate re-arms after 6 s.
- Triggered by: the player and walking creatures. Not triggered by flying creatures, ghosts, or a floating player. (Session 4 adds item and crate weight; design the plate so weight can be added later.)
- Generation: 2-5 plates per Medium deck from depth 2, scaled by deck area (Request 5), placed with the seeded generator (Request 6). Mostly in corridors and doorways, never in the arrival lift cab, on lift tiles, or in the test range unless placed deliberately.

**Trap types**
- **Spike trap:** spikes burst from the plate tile. 8 damage and a short stun build-up to anything on the plate.
- **Flame trap:** a wall nozzle beside the plate sprays a 3-tile line of fire across the corridor for 1.5 s. Sets anything it touches burning and ignites oil. Leaves smoke, like other fires.
- **Dart trap:** a wall launcher fires 3 darts across the plate's tile and its neighbours. 3 damage each plus a little poison. Darts can hit creatures too.
- **Falling debris:** a shadow grows on the ceiling over a 2x2 area for 0.8 s, then rubble falls. 14 damage and a brief daze to anything underneath. Leaves a rubble pile on those tiles that slows movement like a web and crumbles away after 30 s (it never permanently blocks a path).

**Where it plugs in:** world generation, a new hazard update and draw pass, Codex Hazards entries for each trap, test range deck builder option "Traps: off / on".

**Out of scope:** no changes to existing hazards or the threat budget.

**Done when:** each trap type can be triggered by the player and by a creature in a test deck, re-arms correctly, scales with deck size, repeats on the same seed, and has a Codex entry.

## Request 2: Hackable trap control panels

**Goal:** Let players switch traps off with skill instead of just avoiding them.

**Behaviour**
- About 40% of traps are wired to a **trap control panel** on a nearby wall (within about 6 tiles). A thin dashed line on the floor between panel and plate becomes visible once either is spotted.
- Hacking the panel uses the existing hack mini-game. Success disables every trap wired to it (their plates darken). Failure makes the traps fire once and adds disturbance, like other failed hacks.
- **The breaker panel** (cut deck power) also disables powered traps (flame and dart), but not mechanical ones (spike and debris).

**Where it plugs in:** existing hack panel system, breaker panel, Request 1 traps.

**Done when:** a panel can disable its linked traps, a failed hack fires them, and cutting the power stops flame and dart traps only.

---

# Session 4

## Request 3: Weight plates, plate doors and pushable crates

**Goal:** Small physical puzzles: hold a pressure plate down to open a door to a reward.

**Behaviour**
- **Plate doors:** a door that stays open only while its linked plate (in the same room or just outside) is held down with enough weight. When the weight comes off, the door closes again after a 1 s warning grind.
- **Weight** needed to hold a plate: 3.
  - Player or a walking creature on the plate: full weight (but the player then can't walk through the door, which is the puzzle).
  - **Dropped items have weight:** most quick items and resources 1, gear and weapons 2, a full liquid tank 2. Several dropped items can add up on one plate.
  - **New pushable crates:** heavy, non-explosive versions of barrels (weight 3). Same physics as barrels: shoves, kicks, telekinetic push, fans and gravity wells move them; they don't burn or explode. Wooden crates can be broken with the sledgehammer or a heavy charged hit, dropping a little scrap.
  - Ideas that should also work: an immobilized creature left on the plate, a crate pushed on by a fan gust.
- **Placement:** about 40% of decks from depth 2 have one plate door (scaled by deck area, placed with the seeded generator), guarding a small loot room, a shortcut, or a vault-style chest. At least one valid way to hold the plate (a crate in the room, or enough loose items nearby) must always be available.
- **Trap plates** from Session 3 also respond to item and crate weight, so dropping junk on a trap plate sets it off safely.

**Where it plugs in:** item dropping, barrel physics (shared with crates), door system, Session 3 plates.

**Done when:** a plate door opens with a crate, with stacked items, and with the player; closes when the weight is removed; crates move with shoves, telekinesis and fans without exploding; and dropping an item on a trap plate sets it off.

## Request 4: Spacebar styles (shove, kick, repulse)

**Goal:** Like movement skills change SHIFT, let skills change what SPACE does.

**Behaviour**
- In Files > Skills, a new **Spacebar** section lists the styles you own. Exactly one is active at a time; click one to make it active. Default: Shove.
- **Shove (existing):** unchanged.
- **Kick** (martial arts):
  - Narrow arc (about 0.5 rad, roughly half of shove's) but deeper reach (about 26 px).
  - 3 damage plus melee bonuses, double shove's knockback, 12 stamina, about 20% longer recovery than shove.
  - Counts as a melee hit for combos and crits. Sprinting into a kick becomes a **flying kick**: a longer lunge, like the tackle.
  - Unlocked by a new **Brawler** file tier (2 clearance).
- **Repulse** (advanced psychic):
  - A 360-degree burst around you (radius about 40 px) that pushes everything away: creatures, barrels, crates, loose items, gas clouds.
  - Knockback about 70% of Telekinetic push, 1 damage, 15 stamina with the usual health fallback, 4 s recharge (Focus upgrade reduces it).
  - Wall slams from it deal impact damage as normal.
  - Unlocked by a new **Kinetic** file tier 9 (3 clearance).

**Where it plugs in:** the shove function, Files > Skills panel, Brawler and Kinetic files, Codex Systems entry for spacebar styles.

**Done when:** each style works from the Skills panel selection, kick and repulse move crates and barrels, kick and repulse are unlocked by their file tiers, and the active style persists through a save and continue.
