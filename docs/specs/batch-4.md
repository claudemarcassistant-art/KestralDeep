# Kestrel Deep - Batch 4 change requests

Status: OPEN (collecting and refining; Batch 3 not yet sent)

Save this file in the repository as `docs/specs/batch-4.md` when the batch is sent.

**Start this batch only after Batch 3 is complete.** It builds on damage ranges and glancing hits (Request 17), riot guards and riot drones (Request 18), and scenarios (Request 16).

## Design principle for this batch: "what it carries is what it does"

(Request 23, a small Stats tab improvement, is unrelated to this principle; it sits here because it came up while this batch was open.)

Traditional roguelikes build enemies from the same parts as the player, so the world is readable (what an enemy can do is what you can see it carrying) and loot feels earned. Kestrel Deep is real-time, so this batch applies the principle at three levels instead of giving every creature a full stat sheet:

1. **Humans are built like the player.** Armed humans use real armaments, gear and quick items from the player's tables, follow the same rules for ammo and reloads, and drop what they carry (Request 21).
2. **Creatures get readable traits.** Beasts can roll traits that work like player perks, each with a visible mark and a V-look line (Request 22).
3. **Simple creatures stay simple.** Small, fast vermin (crawlers, wasps, drones, plants, ghosts, the dummy) never get traits or loadouts. They work because they are quick to read in a fight. Mark them in `ET` (for example `simple:true`) so later systems can skip them too.

## How to work through this batch

Do **one session at a time**:

1. Read CLAUDE.md and this file, then do only the current session's requests.
2. Test in a browser before committing: `npm run build` must pass, then no errors on the title screen, a new run, the test range and the arcade, plus the session's own "Done when" checks.
3. Update both version histories (the `VERSIONS` array in `src/data/versions.js` and the changelog comment at the bottom of `src/index.html`), the Codex, `README.md`'s file list and CLAUDE.md where the change affects conventions or architecture.
4. Add anything new to the test range so it can be checked quickly.
5. Commit with a clear message, then **stop**. Post a short summary: what changed, how to test it in-game, anything you had to decide that wasn't specified, and anything left unfinished.
6. Wait for the owner to playtest and say "continue" before starting the next session.

If something in a request conflicts with how the code actually works, choose the option closest to the request's goal, note it in the summary, and carry on.

**Conventions from CLAUDE.md that apply throughout this batch:** new numbers and text go in tables in `src/data/`; new systems get their own numbered file in `src/game/`; anything rolled at generation (loadouts, traits) runs inside the deck's seeded scope, so the same seed gives the same armed guards and the same traits; creature sight goes through `seesPlayer(e)`; V-look (`inspectAt()`) describes anything new; keep the save format working; player-facing text says "work orders", not achievements.

| Session | Requests | Size |
|---|---|---|
| 1 | Request 21: Armed humans (loadouts) | Large |
| 2 | Request 22: Creature traits | Medium-large |
| 3 | Request 23: Stats tab links and tooltips | Small |

---

# Session 1

## Request 21: Armed humans (loadouts)

**Goal:** Human enemies carry real equipment from the player's own tables. What they wield sets how they fight, they follow the same ammo and reload rules as the player, and they drop what they carry.

**Who this applies to**
- **Security guards and riot guards** (Request 18): always carry a loadout.
- **Husks** (former crew): about 25% still hold a tool or makeshift weapon. It changes their attack and drops when they go down. The rest fight bare-handed as now.
- Any future human enemies (scavengers, crew holdouts) should use the same system.

**Loadouts**
- A `LOADOUTS` table (new `src/data/loadouts.js`) lists weighted kits per enemy type and depth band. A kit names:
  - a **main weapon**, taken from `ARM` (for example sidearm, SMG, nailer, crowbar, bat, box cutter; a riot guard's kit always includes its canister launcher)
  - optional **armour gear** from `GEAR` (a vest or plating), which gives the creature an armour value. Armour feeds glancing hits (Request 17) the same way it does for the player.
  - optional **head gear** (a gas mask: immune to tear gas, halves nerve gas, as for the player; riot guards always have one)
  - optional **one quick item** from `QUICK` that the AI knows how to use: a medkit (used once below 35% health, after backing off), a smoke grenade (thrown to break line of sight when it is losing a fight), or a flare (lit on a dark deck when it is hunting you)
- Example kits (tune freely):

| Enemy | Depth 1-4 | Depth 5-8 | Depth 9+ |
|---|---|---|---|
| Security guard | sidearm; sometimes vest | sidearm or SMG; vest; sometimes medkit | SMG or nailer; vest; medkit or smoke grenade |
| Riot guard | (from depth 6) | canister launcher + crowbar; plating; gas mask | canister launcher + SMG; plating; gas mask; smoke grenade |
| Husk (25%) | wrench, box cutter or bat | crowbar, box cutter or nailer | crowbar, chainsaw (rare) or nailer |

**Fighting with real equipment**
- The weapon's own stats set the attack: damage range, fire rate, reach and spread come from `ARM`/`WPN`. A guard with an SMG sprays, a guard with a sidearm fires deliberate shots, and a husk with a crowbar hits harder and slower than a bare-handed one. Creature accuracy is lower than the player's (a spread multiplier in `LOADOUT_CFG`).
- **Magazines and reloads:** gun-armed humans carry a magazine from `MAGS` and a small reserve. When the magazine runs dry they **reload in plain view** (a "reloading" callout, the gun lowered, the weapon's own reload time x1.2). That is a window for the player to push in. With no reserve left they switch to melee (pistol-whip or fists).
- **Balance at launch:** keep each guard's average damage per second close to today's guard (an `LOADOUT_CFG.dmgMul` on human weapon damage is fine), so the change is about *how* they fight rather than how hard. The balance pass can tune it afterwards.
- Light gear affects them as it would the player: vests slow them slightly, plating more.

**Drops**
- When an armed human goes down, it **drops its weapon** (guns with whatever is left in the magazine, `it.mag`), and each other piece of its kit drops with a chance (`LOADOUT_CFG.dropP`: armour 40%, gas mask 50%, an unused quick item 100%).
- Dropped items are ordinary items: they slide, have weight on trap plates and can be scrapped at the grinder.
- Drops from loadouts count toward existing loot budgets, so total loot per deck stays about the same (reduce the generic guard drop to compensate).

**Readable at a glance**
- The weapon is drawn in the creature's hands (reuse the player's weapon drawing, `GUNLEN` and friends, scaled down). Armour shows as darker shoulders; a gas mask is visible.
- **V-look** lists the kit: "security guard - smg (12 rounds), vest, medkit".
- The bestiary entry for guards notes that they carry real equipment and drop it.

**Where it plugs in:** the new `LOADOUTS` and `LOADOUT_CFG` tables, `mkEnemy()` (rolls the kit inside generation), the guard, riot guard and husk AI branches (attacks, reloads, quick item use), `drawEnemy()` (held weapon, armour, mask), creature hits on the player (damage from the weapon), glancing hits (armour), gas effects (masks), drops on death, `inspectAt()`, `BEASTINFO` and the Codex (a Systems entry, "Armed humans"), `saveRun()` if any enemy state is ever saved, and the test range creature console (spawn a guard with a chosen kit).

**Out of scope:** no new creature types. Non-human creatures do not get loadouts.

**Done when:** guards, riot guards and some husks spawn with kits that match the table for their depth (and repeat on the same seed); each fights according to its weapon; gun-armed humans run dry, reload visibly and fall back to melee with no reserve; medkit, smoke and flare use happens in the stated situations; kits drop as stated; V-look and drawing show the kit; and average guard damage per second stays close to the old value.

---

# Session 2

## Request 22: Creature traits

**Goal:** Beasts can roll **traits** that work like player perks, so two creatures of the same type can play differently, and the player can read the difference before the fight starts.

**Traits** (in a `TRAITS` table in `src/data/creatures.js`)

| Trait | Effect | Visual mark |
|---|---|---|
| **Armoured** | Takes 20% less damage; +8% chance to be glanced (Request 17); knockback x0.7 | dull plates on the back |
| **Frenzied** | Attacks 40% faster and moves 15% faster; hunt memory lasts 20 s instead of 8 s (`trackTick()` `huntT`), so it chases much longer but still gives up | red tint and a twitching outline |
| **Regenerating** | Recovers 0.5 health per second after 3 s without being hit; burning stops it | faint green pulse |
| **Volatile** | Bursts into a small cloud when it dies (poison on most decks, cryo on cold decks, smoke otherwise) | swollen, glowing sacs |
| **Hulking** | 20% larger, 50% more health, 15% slower, heavy on trap plates (weight 6) | drawn bigger |
| **Venomous** | Its hits add poison | dripping green at the mouth |
| **Keen** | Sees 30% further and through thin smoke (half the `SMOKE_BLIND` effect); hears noise from 30% further | bright eyes |

**Rolling traits**
- Rolled when a creature is generated (seeded, so they repeat on the same seed). Ambient and disturbance-wave spawns roll too.
- Never on creatures marked `simple` (crawlers, wasps, drones, plants, ghosts, the dummy), and never on bosses, hunters or wardens (they have their own designs). Armed humans (Request 21) can roll Armoured, Frenzied or Keen only.
- Chance (in `TRAIT_CFG`): none before depth 3; then about 10% for one trait, rising to about 30% by depth 10. From sector 3, a creature with a trait has a 20% chance of a second, different one.
- **Frenzied stays uncommon** (owner's decision): no cap per deck, but its trait weight is about half the others' (`TRAIT_CFG`), so frenzied creatures never show up in large numbers.
- Some traits suit some creatures: weights per creature type (for example snails and brutes lean to Armoured and Hulking, slugs to Venomous and Volatile, spiders to Keen). Unsuitable pairs can be weighted 0.
- **Threat cost:** each trait adds to the creature's `THREAT` cost (about +40% per trait), so decks with traited creatures have fewer creatures overall. Kill points (`KILLPTS`) rise by the same share.
- **Hooks into existing systems:** the vault "elite" danger (`eliteHeavy()`) gives every eligible creature on the deck at least one trait instead of (or as well as) what it does now; scenarios (Request 16) can weight traits (Lab outbreak: Volatile and Venomous; Security crackdown: Armoured and Keen on guards; Cold snap: Volatile makes cryo bursts).

**Readable at a glance**
- Each trait has its visual mark (table above), drawn by the creature renderer on top of the normal sprite.
- **V-look** names traits first: "armoured, frenzied bog frog - ...".
- **Bestiary:** each entry records which traits you have seen on that creature (`META` keeps them across runs), and the Codex gets a Traits category explaining each one.
- **Work order (one-off):** "Specimen collector" for seeing every trait at least once.

**Where it plugs in:** `TRAITS` and `TRAIT_CFG`, `mkEnemy()` and the threat budget in `populate()`, `damageEnemy()` (Armoured), the enemy loop (Frenzied, Regenerating, Keen via `seesPlayer()`/`noiseReach()`), death handling (Volatile clouds), creature hits (Venomous), `weightAt()` (Hulking), `drawEnemy()`, `inspectAt()`, `eliteHeavy()`, `SCENARIOS`, `KILLPTS`, the bestiary and `META`, `ACH`, the Codex, and the test range creature console (spawn a creature with chosen traits).

**Out of scope:** no new creature types; bosses, hunters and wardens unchanged.

**Done when:** traits appear at the stated depths and rates (and never on simple creatures, bosses or wardens); each trait's effect works and its mark is visible; V-look and the bestiary show them; traited creatures cost more threat so creature counts drop to match; the vault elite danger and scenarios use them; and the same seed gives the same traits.

---

# Session 3

## Request 23: Stats tab links and tooltips

**Goal:** Make the Stats tab show *why* each number is what it is: hovering a stat on the right highlights the core stats and substats on the left that feed it, and every stat has a tooltip explaining what it does.

**Hover links (right to left)**
- Hovering a row in the Stats list (right side) **highlights the cores and substats that influence it** in the Core list (left side): the linked rows are drawn inverted (filled with the core's colour, text in the dark background colour), so the connection reads at a glance. The hovered stat row gets a subtle highlight too.
- Only rows that actually change the stat light up. If nothing on the left affects a stat (for example Armor, which comes from gear), nothing lights up, and the tooltip says what does affect it.
- **Also the other way (left to right):** hovering a substat or core on the left highlights, in amber outline, the stats on the right that it feeds. This is cheap once the links exist; drop it if it looks busy.
- Keyboard and controller selection (`stSel`) behave the same as hovering.

**Tooltips**
- Hovering a stat row shows a tooltip box (same style as the HUD hover tips from v0.98, `drawHudTip()`), placed so it never runs off the menu. It contains:
  - one or two plain lines on what the stat does in play ("how much stamina you have for sprinting, dashing, shoving and swinging")
  - **what affects it**, by source: substats and cores (with the per-point amount), gear, crew file perks, food and draught buffs, injuries, run modifiers. Only sources that are active right now show their current contribution ("vitality 3: +12"); the rest are listed by name.
- Stats that do not have a tooltip yet all get one. Text in a table, for example `STAT_TIPS` in `src/data/character.js`, keyed by stat row, written in the game's short, dry voice.

**The links table**
- A `STAT_LINKS` table in `src/data/character.js` lists, for each stat row, the cores and substats that feed it. **Build it from the actual formulas** (`refreshStats()`, `maxHp()`, `maxStam()`, `critChance()`, the light radius code, `hackRounds()`, `melee()` and so on), not from this spec. A starting point, read from the substat descriptions:

| Stat row | Substats | Core |
|---|---|---|
| Health | Vitality | Body |
| Damage taken | Grit | |
| Move speed | Agility | Body |
| Acceleration | Agility | |
| Stamina | Wind | Spirit |
| Stamina recovery | Wind | |
| Fire rate | Dexterity | Mind |
| Critical chance | (check `critChance()`) | |
| Glancing chance (Batch 3) | Dexterity, Perception | |
| Enemy drop chance | Perception | |
| Regeneration | Vitality | |
| Light radius | Perception | Mind |
| Hack window | Memory | |
| Shove, Shove knockback | Might | |
| Armor, Backpedal slow, Ammo per pickup, Gunfire noise | (none: gear and perks) | |

- **Every substat should feed at least one visible row.** Today the status resistance from Resolve and Spirit, Memory's skill recharge, Dexterity's aim and Grit's stun resistance have no row of their own. Add rows for them: **Status build-up** (Resolve, Spirit), **Skill recharge** (Memory, Mind), **Aim spread** (Dexterity, Mind) and **Stun resistance** (Grit). Check the Stats list still fits the smallest menu size (`MENU_CFG`, 368x200); if it doesn't, let the list scroll with the wheel like the Work orders list.

**Where it plugs in:** the Stats tab drawing (`drawStats()`), `STAT_LINKS` and `STAT_TIPS` in `src/data/character.js`, the tip box from `38-inspect.js`, `stSel` and mouse hover handling.

**Out of scope:** no changes to how any stat is calculated.

**Done when:** hovering each stat highlights exactly the cores and substats that change it (checked by adding a point to a substat in the test range and seeing the stat move), every stat row has a tooltip that lists its sources with current contributions, every substat feeds at least one row, and the list fits or scrolls at the smallest menu size.
