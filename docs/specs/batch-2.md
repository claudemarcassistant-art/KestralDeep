# Kestrel Deep - Batch 2 change requests

Save this file in the repository as `docs/specs/batch-2.md`.

**Start this batch only after Batch 1 is complete.** Several requests build on Batch 1: deck sizes, run seeds, pressure plate traps and trap control panels.

## How to work through this batch

The batch is split into **four sessions**. Do **one session at a time**:

1. Read CLAUDE.md and this file, then do only the current session's requests.
2. Test in a browser before committing: no errors on the title screen, a new run, the test range and the arcade, plus the session's own "Done when" checks.
3. Update both version histories (the VERSIONS array and the changelog block), the Codex, and CLAUDE.md where the change affects conventions or architecture.
4. Add anything new to the test range (creature console, deck builder or a test fixture) so it can be checked quickly.
5. Any new generation (herb placement, express shafts, vault junctions, gas traps and vents, ceiling crawlways) uses the seeded generator from Batch 1.
6. Commit with a clear message, then **stop**. Post a short summary: what changed, how to test it in-game, anything you had to decide that wasn't specified, and anything left unfinished.
7. Wait for the owner to playtest and say "continue" before starting the next session.

If something in a request conflicts with how the code actually works, choose the option closest to the request's goal, note it in the summary, and carry on.

| Session | Requests | Size |
|---|---|---|
| 1 | Request 7: Frozen status + Request 8: Active reload | Medium |
| 2 | Request 9: Herbs and herbalism | Medium-large |
| 3 | Request 10: Express shafts + Request 11: Vault junctions | Large |
| 4 | Request 12: Poison gas traps and toxic vents + Request 13: Less backtracking | Medium-large |

---

# Session 1

## Request 7: Frozen status (player and creatures)

**Goal:** A full cold meter should freeze you solid for a moment, making cold a real threat and a real opportunity.

**Player**
- When the cold (frz) meter reaches 100, you become **Frozen** for 1.5 s: no moving, attacking, using items or skills. You can still look around and open the pack menu.
- Visual: a pale blue ice shell over the character, frost particles, a cracking sound as it ends. HUD status line reads "frozen".
- While frozen you take **+60% damage from melee hits**. Ranged and hazard damage are unchanged.
- When it ends, the cold meter drops to 60 and you're immune to freezing again for 3 s, so you can't be frozen back-to-back.
- Mashing movement keys or taking a fire hit breaks the ice 0.4 s sooner. Being on fire while frozen ends it at once.

**Creatures**
- Creatures get a cold meter, filled by the same sources that chill the player: cold vents and risers, freezing water, cold store hazards, the Frost Matron's attacks, and freeze effects.
- At 100 they're Frozen for 2 s (bosses 1 s, with a longer immunity afterwards): no movement or attacks, drawn with the same ice shell.
- Frozen creatures take **+60% melee damage**, and a frozen creature knocked into a wall takes double impact damage.
- Fire-weak and plant creatures freeze normally; ghosts and drones can't be frozen.

**Addition: cryo grenade (so the player can freeze things deliberately)**
- **Cryo grenade** (Workbench: battery + pipe + cloth): a thrown canister that bursts into a freezing cloud (works like the gas cloud system, white-blue) for 3 s, adding cold to everything inside. Water in the cloud freezes to ice.

**Where it plugs in:** status meters, enemy update loop (frozen creatures skip their AI), melee damage, impact damage, gas cloud system (cryo cloud), Codex Systems "Status effects" entry.

**Done when:** a cold riser can freeze the player and a creature in a test deck, melee does the extra damage to both, the immunity window works, and the cryo grenade freezes creatures in its cloud.

## Request 8: Active reload

**Goal:** Make reloading a small skill test: time a second press of R for a faster reload, mistime it for a slower one.

**Behaviour**
- When a reload starts, a small **marker** (a bright notch, about 12% of the bar wide) appears on the reload progress bar, placed randomly between 40% and 75% of the way along.
- Press **R** while the fill is inside the marker: the reload **completes instantly**, with a crisp click and a brief flash on the bar ("quick reload").
- Press R outside the marker: a **fumble**. The remaining reload time is increased by 50%, with a dull clank, and the marker disappears.
- Don't press R again: the reload finishes at normal speed, exactly as now.
- **Dexterity** widens the marker slightly (+1% of the bar per point, up to 20%). The Trigger work upgrade still shortens the overall time.
- Works for every gun with a magazine. Bows, throwing knives and the sling are unchanged.
- The first press of R that starts a reload must not count as the timing press.

**Where it plugs in:** the reload system (startReload, updateReload), the reload bar in the HUD, Codex Systems "Guns and ammo" entry.

**Done when:** quick reloads, fumbles and untouched reloads all behave as described with the sidearm, scattergun and bolt driver, and the marker never appears for weapons without magazines.

---

# Session 2

## Request 9: Herbs and herbalism (poultices, incense, draughts)

**Goal:** Collectible herbs that combine into healing and fortifying preparations, giving overgrown areas and greenhouses a reason to explore and a crafting path separate from medicine and cooking.

**Naming:** the game already has **tonics** (rare items that add a substat point). Herbal drinks are called **draughts** (confirmed by the owner).

**Herbs** (stored in the Food tab alongside raw ingredients)

| Herb | Look | Theme |
|---|---|---|
| Redroot | red stalks | healing |
| Bitterwort | grey-green leaves | cleansing poison and sickness |
| Emberleaf | orange curled leaf | warmth: resists cold, thaws freezing |
| Grey sage | silver-grey sprig | calm: steadies nerves, quiets the deck |
| Ironmoss | dark green moss | fortifying: toughens the body |

**Where herbs come from**
- Overgrown decks: 4-8 herb tufts growing near walls and blooms (picked up like items), scaled by deck size.
- Greenhouse modules: 2-4 herbs.
- Occasionally in lockers, the galley cook's stock, and camp landings.
- The Galley cook file's Forager perk doubles herb pickups like it does raw ingredients.

**Preparations** (made in a new **Herbalism** view of the Food tab, next to Pouch and Cook; A/D switches views)

*Poultices* (quick item, applied to yourself):
- **Redroot poultice** (2 redroot + 1 cloth): heals 35 over 5 s and stops burning.
- **Bitterwort poultice** (2 bitterwort + 1 cloth): clears poison and sickness, then 40% poison resistance for 60 s.
- **Mending poultice** (redroot + bitterwort + ironmoss + cloth): heals 50 over 6 s, clears poison and burning, and shortens your newest injury by 1 deck.

*Incense* (quick item, placed on the floor; burns for 30 s with a thin smoke plume and a soft glow):
- **Grey sage incense** (2 grey sage): within about 48 px you regenerate 1 health per second, and disturbance does not build while it burns.
- **Emberleaf incense** (2 emberleaf): a warm area about 48 px across that can't freeze, thaws frozen creatures and the player, and slowly dries you.
- Incense smoke counts as a light, harmless cloud (it doesn't use up air) and can be blown by fans.

*Draughts* (drink, take a satiety slot like food):
- **Ironmoss draught** (2 ironmoss + water from your flask): 20% less damage taken for 60 s.
- **Emberleaf draught** (2 emberleaf + flask water): immune to cold and freezing for 90 s.
- **Grey sage draught** (2 grey sage + flask water): 50% stun resistance and steadier aim for 60 s.
- **Restorative draught** (redroot + ironmoss + grey sage + flask water): heals 25 at once and +15% stamina recovery for 120 s.

**Where it plugs in:** item pickups and generation, the Food tab (new Herbalism view and storage), quick items, status effects and buffs, the gas cloud system (incense smoke), Codex entries for herbs and preparations, the test range (a herb stash).

**Out of scope:** no changes to existing cooking recipes or medical items.

**Done when:** herbs appear on overgrown decks and in greenhouses, each preparation can be made and used with the stated effect, incense works with fans and the disturbance meter, and the Codex lists every herb and preparation.

---

# Session 3

## Request 10: Express shafts on the sector map

**Goal:** Give route planning an optional cost-versus-speed choice: pay batteries to skip ahead, without adding a resource you can run out of. Normal rides stay free.

**Behaviour**
- Each sector map gets **2-4 express shafts**: extra links that connect two junctions **two steps apart**, skipping the junction in between. Generated with the seeded generator.
- Express shafts follow the same fog rules as normal shafts: hidden until you're at one end, or revealed by intel (schematics, route charts, the inspector, terminal route logs).
- Drawn on the sector map as a **double amber line** with a small lightning mark, clearly different from normal shafts.
- **Cost:** 1 battery to ride. An express shaft that arrives directly at the exit junction costs 2. The cost is shown when the shaft is selected ("express shaft: 1 battery, skips a junction"). Not enough batteries: the refusal sound and a message, and the normal shafts stay available.
- **Riding one:**
  - You arrive at the far junction and play that deck as normal. The skipped junction stays unvisited (you can still go back to it by normal shafts if they connect).
  - Depth goes up by 1, as for any ride, so difficulty is based on decks actually played, not distance covered.
  - **No lift-ride stop** happens on an express ride (it goes straight through).
  - The **hunter** moves one step as for any ride, so express shafts gain ground on it.
  - You miss the skipped deck's loot, clearance and score, which is the trade-off.
- Express shafts are never the only way forward: normal shafts must always connect start to exit as now.

**Where it plugs in:** sector generation (genSector), route map drawing and selection, chooseRoute, lift ride stops, the hunter's movement, saving (express shafts are part of the saved route), Codex Systems "Sector map and travel" entry.

**Out of scope:** no fuel or charge resource, and normal rides stay free.

**Done when:** express shafts appear on sector maps (2-4 per sector), are hidden and revealed like normal shafts, charge the right number of batteries, skip the middle junction with no lift stop, survive save and continue, and repeat on the same seed.

## Request 11: Vault junctions (high-risk, high-reward decks)

**Goal:** Give skilled players something worth going out of their way for: 1-2 junctions per sector that guarantee a high-level loot room with crew files, guarded by extra danger.

**On the sector map**
- Each sector has **1-2 vault junctions**, never the start or exit junction, and placed **off the most direct route** (at least one junction away from the shortest start-to-exit path, ideally on a side branch or dead end), so reaching one costs extra rides. Generated with the seeded generator.
- From the start of the sector, each vault junction shows a faint **gold signal mark** on the map, so you know roughly where it is, but not how to get there (its shafts stay hidden as normal) or what guards it.
- Once the junction is known through intel or by arriving next to it, its description names the danger (for example "vault deck: guarded" or "vault deck: unstable").
- Vault junctions are always **Large** decks.

**The reward: the archive vault**
- Somewhere on the deck, away from the arrival lift, is a sealed **archive vault** room behind a heavy armoured door.
- **Opening it:**
  - The door is opened by **hacking its lock panel** beside the door, using the existing hack mini-game. The vault lock is harder than an ordinary panel (a narrower timing window).
  - If the hack **fails**, the panel burns out and can't be hacked again. The door can then only be opened by **an explosion**: any blast close enough to the door (pipe charge, proximity mine, fuel barrel, or other explosion) blows it open. Show a short hint after the failed hack ("the lock is fried. it will take a blast to open now").
  - A blown door adds disturbance like any big explosion. The vault's contents are never damaged by the blast.
  - Ordinary R does not open the vault door.
- Guaranteed contents:
  - **1-2 crew files you haven't found** (from depth 4, one of them may be a classified file). If every file has been found, each missing file becomes 2 clearance instead.
  - **1 rare chest.**
  - A small stash of ammo, a medkit and scrap.
- The vault shows on the station map once you've seen its door.

**The danger** (each vault deck has one of these, chosen by the seeded generator; deeper sectors can have two)
- **Guarded:** a **mini-boss** (the sector's biome mini-boss, like on arena decks) waits inside or in front of the vault. The lock panel stays dead (can't be hacked) until it's killed, though a blast still works.
- **Elite garrison:** the deck's threat budget is 40% higher than normal and includes at least one heavy creature (brute, guard, ram or grasper) even at shallow depth.
- **Cautionary event: lockdown.** Opening the vault, by hack or by blast, triggers the security alarm: klaxon, red strobes and two waves of security guards (called guards can't call more backup).
- **Cautionary event: unstable deck.** Opening the vault starts a 60 s countdown before the deck's power fails and the lights go out (as if the breaker were thrown), with the disturbance meter jumping to 75%.

**Scoring and recognition**
- Opening a vault adds a large score bonus on the deck report ("vault cracked").
- A new achievement: **Vault breaker** (open a vault in 3 different sectors in one run). Its meta reward is to be decided later; for now it counts as an achievement and gives achievement points.

**Where it plugs in:** sector generation (genSector), the route map (gold signal mark, descriptions), deck generation (the vault room, its door and lock panel), the hack mini-game, explosions (blasting the door), populate (threat budget and heavy creature), the arena mini-boss spawn, the security alarm, the breaker/power-off system, the deck report, achievements, saving, the Codex ("Vault junctions" Systems entry), and the test range deck builder ("Vault deck: off / on").

**Out of scope:** no new creature types.

**Done when:** every sector has 1-2 vault junctions off the direct route with a gold mark; each vault deck has a reachable archive vault with 1-2 unfound files and a rare chest; the hack opens the door, a failed hack burns out the panel, and an explosion then opens it; each danger type works; the seed reproduces vault junctions and their dangers; and the version history and Codex are updated.

---

# Session 4

## Request 12: Poison gas traps and toxic floor vents

**Depends on:** Batch 1 Requests 1-2 (pressure plate traps and trap control panels).

**Goal:** Add poison gas as a trap and as a hazardous alternative to the existing steam and cold air floor vents, built on the existing gas cloud system.

**Poison gas trap (a fifth pressure plate trap)**
- Uses the same pressure plates as the Batch 1 traps: hard to spot, a 0.4 s click, triggered by the player, walking creatures and weight. Re-arms after **20 s** (longer than the other traps, since its cloud lingers).
- On triggering, hidden nozzles in the floor and nearby walls hiss and **pour out poison gas for about 5 s**, feeding the existing poison cloud system from several points around the plate.
- The cloud should grow large enough to **fill an average room** (roughly 8 x 6 tiles, about a 50 px radius) before it stops being fed. It then lingers and dissipates at the normal rate for poison clouds.
- Effects are the existing poison cloud effects: light poison build-up and vision shrouding for anyone inside, and slow damage to creatures. Fans blow it, and other cloud rules apply.
- A greenish tint on the plate rivets is the only visual hint (a little easier to spot than the other plates for players with 3+ Perception).
- Can be wired to a trap control panel and hacked off like other traps. It counts as a **powered** trap: cutting the deck's power with the breaker disables it.
- Generation: one of the trap types rolled for plates, more likely on toxic-spill decks and in laboratories and custodial closets.

**Toxic floor vents (alternative to steam and cold vents)**
- Some existing floor vents become **toxic vents**: a sickly green grille. Instead of steam or cold air, each eruption releases a poison cloud, building in size the longer it erupts, like steam vents build steam clouds today.
- The direct jet over the vent poisons heavily; the cloud it leaves poisons lightly.
- Generation: about 50% of floor vents on toxic-spill decks, and about 10% elsewhere (mirroring how wall risers already have noxious variants).
- Fans in the vent's path blow its cloud along as normal.

**Where it plugs in:** pressure plate traps and trap panels (Batch 1), floor vent generation and eruption code, the gas cloud system, the breaker panel, the Codex Hazards entries, and the test range (a toxic vent and a gas trap plate added to the hazards area).

**Out of scope:** no change to the strength of existing poison clouds.

**Done when:** stepping on a gas trap fills a typical room with a poison cloud that then dissipates normally; a creature can set it off; hacking its panel or cutting the power disables it; toxic vents appear at the stated rates and leave growing poison clouds; and the version history and Codex are updated.

## Request 13: Less backtracking (deck secured walk-back and ceiling crawlways)

**Goal:** Cut the tedious walk back to the exit lift after clearing a deck, without giving the player an escape from danger and without anything that breaks the station's fiction (no teleporting).

**Part A: "Deck secured" and the walk back**
- A deck becomes **secured** when all of these are true:
  - the exit lift room has been found (seen)
  - no **hostile creature that can reach the player** is alive. Rooted plants (snarevines, seedpod blooms, tripwire vines), creatures sealed behind closed or locked doors, creatures confined to water the player isn't in, and creatures turned friendly don't count.
  - no disturbance wave, security alarm or arena lock is pending or active
  - the sector hunter is not on this deck
- When it becomes secured, show a short message: "deck secured. the way back to the lift is quiet".
- While secured, the station map (M) shows a **"Walk back to the lift"** option (click it or press the key shown). Choosing it:
  - plays a short fade with "you make your way back to the lift"
  - places the player in the exit lift room, next to the lift
  - **passes time in proportion to the walking distance** (by path, at walking speed): satiety drains, timed buffs, incense and status effects tick down as if you had walked
  - does **not** pick up items left on the floor; anything not collected stays behind
- If the deck stops being secured (a new creature appears, an alarm goes off), the option disappears immediately.

**Part B: Ceiling crawlways (two-way shortcuts)**
- Some decks have **ceiling crawlways**: pairs of ceiling vent hatches connected by a crawlspace above the deck. Each hatch is a grille in the ceiling with a short ladder, drawn on the wall or floor tile below it.
- **Two-way:** either hatch leads to the other.
- **Confirmation required:** pressing R at a hatch asks "Climb into the ceiling crawlway? R to confirm, any other key to cancel" before moving the player.
- Climbing through plays a short fade (about 1 s) with crawling sounds, then the player drops out of the other hatch. Time passes in proportion to the crawl's length, like Part A.
- **Not an escape route:** a hatch can't be used if a hostile creature is aware of the player within about 120 px, or the player was damaged in the last 4 s ("too hot to climb now"). Creatures can't use or follow through crawlways.
- The station map shows a hatch once seen, and draws a dashed line between the two hatches once both ends have been seen.
- **Generation** (seeded): Small decks 0, Medium decks 0-1, Large decks 1-2 crawlways. Hatches are placed far apart (at least about a third of the deck's width), and on decks with one, one end is preferably near the exit lift room so it shortens the way back. Never in the arrival lift cab or inside vaults.

**Not included:** an on-screen arrow pointing to the exit (the station map and the existing map item cover this, per the owner).

**Where it plugs in:** enemy tracking (is anything hostile still able to reach the player), the disturbance, alarm and arena systems, the hunter, the station map screen, timed effects and satiety, deck generation (crawlway hatches), the interaction prompt and a confirmation step, the Codex Systems entries, and the test range (a crawlway pair and a way to force "deck secured").

**Out of scope:** no change to how the exit lift or deck objectives work.

**Done when:** clearing a test deck shows "deck secured" and the walk-back option, which moves the player to the lift and drains satiety by distance; the option never appears while a reachable hostile, wave, alarm or hunter remains; crawlway hatches ask for confirmation, work both ways, refuse when the player is in danger, and appear at the stated rates; and the version history and Codex are updated.
