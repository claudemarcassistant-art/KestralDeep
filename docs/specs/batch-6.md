# Kestrel Deep - Batch 6 change requests

Status: READY TO SEND (written against v1.14.7)

Save this file in the repository as `docs/specs/batch-6.md`. It comes with:
- a newer `docs/art/sprite-study.html` (replace the repository copy with it; it is the reference for Sessions 1 and 2),
- a newer `docs/specs/batch-5.md` (for the record: it adds the art requests that arrived after the copy in the repository; Session 1 below is the work they describe),
- `docs/specs/batch-4.md` with a note that its Session 4 moved here,
- `docs/specs/img/hud-v1.14.7.png`, the owner's screenshot for Session 3.

**What this batch is.** A catch-up. After the Batch 5 spec in the repository was written, the owner asked for more art changes in the planning chat, and for two melee changes (a new chain and a new cable whip perfect release) that were planned as Batch 4 Session 4 but never reached the repository. The owner also found HUD overlaps at 512x288 in v1.14.7.

Request numbers carry on from Batch 4 (24 and 25 keep the numbers they were given in the planning chat; 26 and 27 are new). The sessions run in this order because the chain's sweeps use the alternating swings from Request 26.

## How to work through this batch

Do **one session at a time**:

1. Read CLAUDE.md and this file, then do only the current session's requests.
2. Test in a browser before committing: `npm run build` must pass, then no errors on the title screen, a new run, the test range and the arcade, plus the session's own "Done when" checks. Art changes keep the busy Large deck at 60 fps (p50 16.7 ms), as in Batch 5.
3. Update both version histories (the `VERSIONS` array in `src/data/versions.js` and the changelog comment at the bottom of `src/index.html`), the Codex, `README.md`'s file list and CLAUDE.md where the change affects conventions or architecture.
4. Add anything new to the test range so it can be checked quickly.
5. Commit with a clear message, then **stop**. Post a short summary: what changed, how to test it in-game, anything you had to decide that wasn't specified, and anything left unfinished.
6. Wait for the owner to playtest and say "continue" before starting the next session.

If something in a request conflicts with how the code actually works, choose the option closest to the request's goal, note it in the summary, and carry on.

**Conventions that apply throughout:** numbers in tables in `src/data/`; drawing never draws extra random numbers from generation streams; melee goes through `asMelee()` and `hitRoll()`; creature sight through `seesPlayer(e)`; V-look describes anything new; in-game text is lowercase and dry; the study is a reference to port, not a file to edit in the repository.

| Session | Requests | Size |
|---|---|---|
| 1 | Request 26: Art catch-up (swings, arms, guards, shadows, husks, slugs) | Medium |
| 2 | Request 24: Chain; Request 25: Cable whip perfect release becomes a wide swing | Medium |
| 3 | Request 27: HUD overlaps at 512x288 | Small |

---

# Session 1

## Request 26: Art catch-up

**Goal:** Bring the game in line with the newer sprite study. Each item below is drawn on the study page; port the look, drive it from real game state, and change no gameplay unless an item says so.

**First:** replace `docs/art/sprite-study.html` with the copy that comes with this batch.

**1. Combo swings alternate** (study: `comboSwing()`, `comboBar()`, `SWING`, the box cutter, crowbar and bat cards)
- A melee swing that starts while the combo bar still holds charge swings back the other way, starting where the previous swing ended, so a series reads as one continuous attack: left to right, right to left, left to right. When the combo runs out, the next swing starts again from the usual side.
- Keep a per-player swing direction (for example `player.swingDir`, 1 or -1): flip it in `primaryAttack0()` for a swung weapon when the combo is above 0 at the moment the swing starts; set it back to 1 when the combo empties. Not saved.
- The hand's sweep in `playerPose()`/`armHold()` (`swingT`), the held weapon and the swing arc overlay all follow the direction.
- Applies to the box cutter, crowbar, bat, kick if it uses the swing pose, and any future swung weapon (the chain in Session 2). Jabs, lashes and the chainsaw keep their own motions. The hit test is a symmetric arc, so gameplay does not change.

**2. Arm swing with a free hand** (study: `person()` with arms `rest` and `walk`)
- Whenever a person walks with a hand free, that arm swings against the steps: the right hand comes forward with the left foot. This lives in `person()`, so the player, crew and guards all get it. A hand holding something keeps holding it (a guard with a gun in one hand swings only the other).
- Crew are fixtures and do not walk today. If any crew member ever moves, they walk with `person()`: free hands swing, carried things come along (the trader's pack, Subject Nine's wires: `CARRY` and `crewWalk()` in the study), props on the floor stay put. Nothing to build now beyond keeping `drawCrew()` able to take a walk phase.

**3. Guards turn their whole body; the flashlight follows the body** (study: the guard card)
- Today the body turns toward movement and the head turns to `e.look` (clamped to plus or minus 1.3 rad), and the sight cone follows the head. The owner wants no separate head scan: the **whole body faces the guard's look direction**, the head stays square to the shoulders, and the flashlight cone and the flashlight dot point straight ahead from the body. The cone moves only when the guard turns.
- Keep the body's turn smoothed (`e._bd`) and draw the cone from the smoothed body angle, so the cone never leads the body. If the guard AI currently sweeps `e.look` back and forth while standing, that sweep now turns the whole body. The gameplay cone (what the guard can see) uses the same angle the drawing uses; if that changes guard behaviour noticeably (it should not: the cone already followed `e.look`), note it in the summary.
- Riot guards (no flashlight) turn the same way.

**4. Stronger shadows** (study: `shadow()`, `waterline()`, `shadowOnWater()`, `wade()`, `FLIES`, the creatures section with the shadow toggle)
- Every walking creature gets a soft-edged contact shadow, stronger than today's: in the study `shadow()` raises the alpha about 1.75x (capped near 0.78) and spreads a soft edge about 1.18x the size. Update `shadow()` in `47-sprites.js` to match; keep it a cached texture or a hex colour with `globalAlpha` (the speed rule from v1.08).
- Flying creatures (wasps, drones, riot drones, any flyer in `ET`) cast a lighter, smaller shadow further below them. Ghosts cast none.
- A creature in water of wading depth casts no floor shadow. Its own pixels below its waterline are tinted with the water colour (only the creature's pixels, never the floor around it; the study draws the creature to an offscreen canvas and tints it with `source-atop`) and rings spread from it. The game's `wade()` in `48-creature-art.js` should do exactly this; check it tints only the creature, not a rectangle. A flyer over water gets a faint shadow on the surface (`shadowOnWater()`).
- Fully submerged swimmers (the lurker while under) stay a dark blurred shape with a ripple, as now.
- The player and people follow the same rules.

**5. Husks shuffle** (study: `NEW.husk`)
- One foot steps, the other drags behind; the reaching arms swing stiffly against the steps, a beat late. Drive the step from distance moved (as the player does) so a standing husk is still. Armed husks (`drawKit()`) keep holding their weapon in the weapon hand.

**6. Slugs: fatter, segmented, no trail in the sprite** (study: `NEW.slug`)
- The body is three soft segments following a travelling wave, so it wiggles and bunches as it crawls, rounder and fatter than today's. The head and eyestalks follow the front segment.
- **Remove the trail drawn inside the sprite** (the fading ellipses and moving highlight dots behind the body in the `slug` branch of `CART`). The only trail behind a slug is the game's slime on the floor (`drawSlime()`).
- Toxic slugs and snails use the same body with their own colours (the snail keeps its shell on top).

**Where it plugs in:** `primaryAttack0()`, `playerPose()`, `armHold()`, the swing arc overlay; `person()` in `47-sprites.js`; `drawGuardBody()` and `guardBodyDir()` in `49-crew-art.js`, the guard cone drawing and the flashlight dot in `drawEmissives()`; `shadow()`, `wade()` and the flyer cases; `CART.husk` and `CART.slug` in `48-creature-art.js`; Sprite outlines (`olDraw()`) must still wrap everything.

**Out of scope:** no new creatures, no gameplay numbers.

**Done when:** combo swings alternate and reset when the combo empties; walking people swing free arms against their steps; guards turn as a whole with the cone fixed to the body; shadows follow the walking, flying, ghost, wading and submerged cases; husks shuffle; slugs are segmented with no trail of their own; outlines still work; and the busy Large deck holds 60 fps.

---

# Session 2

(These two requests were Batch 4 Session 4 in the planning chat. They are moved here unchanged except for the art note, since the art pass is in.)

## Request 24: Chain

**Goal:** A heavy chain on a taped grip: a cousin of the cable whip that sweeps a wide arc instead of lashing straight ahead, with a perfectly timed charged release that whips it out in a long straight strike.

**The armament**
- **Chain**: a **main-hand** melee armament (pairs with an off-hand gun). Add it to `ARM`, `WCRIT`, `CHARGE`, `IMPLEMENTS` (so it can be found) and `DMG_CHAR` with its numbers in `src/data/weapons.js`. Starting numbers, to tune in play:
  - **Plain attack, a wide sweep:** about 2.2 damage, reach about 22 px (longer than the bat, shorter than the whip), a wide arc (half-arc about 1.5 rad, wider than the bat's 1.1), knockback about 120, about 0.7 s between attacks. Hits everything in the arc, like the bat.
  - **Charged release (normal):** hold to charge as with other charged melee; a full charge that is **not** released in the perfect window gives a stronger, slightly wider sweep (the usual charge damage bonus).
  - **Perfect release, the long strike:** releasing inside the perfect window turns the attack into a long straight strike like the whip's lash: reach about 40 px (as the whip), but a **wider hit lane than the whip's** (about 1.6x the whip's width), hitting everything along it, with the perfect-release damage bonus and strong knockback at the tip. Use the whip's lash code (`lash`, `inLash()`) as the base, with a lane width parameter.
  - Like the whip, hits add a little to the creature's stun build-up (`addStunB()`; sweep small, strike more).
- Damage character "reliable", can crit and glance like other melee (`hitRoll()`), runs through `asMelee()`.
- **Combos:** each hit adds to the melee combo. Sweeps alternate direction by the rule from Request 26.
- **Noise:** a heavy rattle and clank; louder than the bat.
- **Where to get it:** found (weapon pickups and lockers, a little more often in Pump Hall and Sorting Floor) and made at the Workbench: 4 scrap + 1 cloth.
- **Look:** port `WD.chain` from the study (armaments section: `chainLive()`, `chainLinks()`, `chainCoil()`) into `ARM_ART` in `52-arm-art.js`, driven by real state rather than the study's timer: on the sweep, a curved length of chain drawn as a dashed line with thin gaps so it reads as links, bowing behind the direction of the swing, with a wave that rolls from the grip to the tip during the swing and settles once it ends; a twirl while charging (with the usual charge ring); on the perfect strike, a long straight chain with a single kink that travels out to the tip and sparks there; a coiled chain as its floor pickup and icon. The hands come from the study's `armPose('chain')`.

**Where it plugs in:** `ARM`, `WCRIT`, `CHARGE`, `IMPLEMENTS`, `DMG_CHAR`, the Workbench `RECIPES`, `releaseCharge()` and `primaryAttack0()` (sweep, and the lash path for the strike), stun build-up, combos, loot tables, `armState()`/`armHold()`/`ARM_ART`, `STAT_LINKS` if a stat row changes, the Codex (Weapons entry), the test range armory.

**Done when:** the chain sweeps a wide arc that hits several creatures, a full non-perfect charge gives a stronger sweep, a perfect release gives a long strike with a wider lane than the whip that hits everything along it, it combos (alternating), crits and glances like other melee, it is drawn as in the study, and it can be found and crafted.

## Request 25: Cable whip perfect release becomes a wide swing

**Goal:** Mirror the chain. The chain sweeps normally and strikes long on a perfect release; the cable whip lashes long normally and, on a perfect release, swings flat through a wide cone in front of you. Each armament's perfect release then gives it the shape it otherwise lacks.

**The change**
- **Plain lash and normal charge stay as they are:** a tap is the straight lash (`lash:true`, `inLash()`), and a full charge released outside the perfect window is a stronger straight lash as now.
- **Perfect release (whip only):** instead of a stronger lash, the whip swings through a **135 degree cone** in front of you (half-arc about 1.18 rad, centred on the aim). Reach about 30 px (a little shorter than the lash's 38, since the cable curls as it sweeps; tune in play). It hits everything in the cone, using the ordinary arc test in `primaryAttack0()` rather than `inLash()`. It keeps the perfect-release damage and knockback bonuses, the perfect stun (`e.stun` 0.9) and adds to stun build-up like any whip hit. It also hits barrels, crates and cameras in the cone like other swings.
- Put the numbers in `src/data/weapons.js` (for example `ARM.whip.perfect:{arc:1.18,range:30}`) and apply them in `releaseCharge()` when `k==='whip'&&perfect`: turn off `lash`, set `arc` and `range`, and mark the attack as a whip sweep for drawing.
- Update the whip's `desc` and the Codex line: "release right as it fills to swing it wide through everything in front of you."

**Look:** port `whipLive()` from the study's `WD.whip`: the cable coils low at the side while charging (with the usual charge ring), then on the perfect release swings flat across the cone, bowing behind the swing with a ripple running out to the tip and a brief pale wedge showing the cone. Drive it from `lashT` (or a new `sweepT`) in `52-arm-art.js`.

**Where it plugs in:** `ARM.whip` and its desc, `releaseCharge()`, `primaryAttack0()` (the arc test and the swing drawing values `swingR`, `swingA`), `52-arm-art.js`, the Codex, the test range armory.

**Done when:** a tap and a non-perfect full charge still lash straight; a perfect release swings through about 135 degrees in front, hitting several creatures across the cone with the perfect bonuses and stun; and it draws as a wide swing, not a lash.

---

# Session 3

## Request 27: HUD overlaps at 512x288

**Goal:** No HUD text overlaps at 512x288 in any state, including the short-lived banners, and none at 384x216 except where this request says so.

**What the owner saw** (`docs/specs/img/hud-v1.14.7.png`, a 1024x576 capture of the 512x288 view on arrival at depth 6, Hydroponics Ring, blackout and toxic spill, lift inbound alarm, wave 2 of 3, a boss on the deck):
1. **Arrival banner over the boss name and the ride-down line.** The boss name ("INTAKE MAW") is drawn on top of the "found something on the ride down" box.
2. **Arrival banner over the lift prompt.** The banner's conditions line ("blackout, toxic spill") sits on "R open the lift doors".
3. **Top centre into the top right.** The big "LIFT INBOUND 1:14" runs into "keys 0" in the top-right materials line.
4. **Combo meter.** In the left column, the combo bar is drawn across its own count ("COMBO 12"). There are also a few stray pixels just left of the "SHOCK" meter (x about 4-8); find what draws them.

**The fix**
- **Banners get rows, not the middle of the screen.** The arrival banner (DEPTH n, area, conditions), the boss name and the ride-down line join the top-centre stack from v1.14.4 (lift banner, breaches, wave line, messages) as rows, or go in one reserved banner block below that stack, sized from what is showing. They never share a row with each other or with a message.
- **Prompts stay clear.** The interaction prompt ("R open the lift doors", and every other `R ...` prompt) is drawn after the banners and moves below any banner that would touch it, or the banner moves up; the prompt must always be readable.
- **The top centre measures the corners.** The lift and lockdown banner (and any wide top-centre line) is measured against the widest top-left and top-right lines on its row; if they would touch, the banner drops to the row below the corner lines (or uses the smaller font). Same check for the breach and wave lines.
- **Meter labels.** Each left-column bar starts after its label and count (measured), or the count moves to the bar's right end. Check every meter with a two-digit value.
- At 384x216, only the banners may still overlap, and only with everything forced on at once (as v1.14.4 allowed); say in the summary which ones do.

**How to check:** a test-range or console state that forces everything on at once (the arrival banner, a boss name, the ride-down line, the lift alarm, breaches, waves, three messages, a long condition list, every status meter, every bottom state line, a full hotbar), at 512x288 and 384x216. Compare with the owner's screenshot.

**Where it plugs in:** `hud()` in `26-hud.js`, the arrival and boss banner drawing, the interaction prompt, `hotbarX()`, `drawHudTip()`.

**Done when:** the owner's scene shows no overlaps at 512x288, every meter's count is readable, the stray pixels are gone, and nothing else in the HUD moved by accident.
