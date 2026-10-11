// Panel hacking (v0.97): rounds, target windows and cursor speed. The bar is barW px wide; the cursor bounces along it.
// Each round's window (px) comes from win[] and its cursor speed is speed + round x step (px/s). Hack expertise (the
// hack stat: splicer kit 0.4, Surveyor tier 1 0.25, Memory 0.05 a point) still widens windows by (1 + hack) and slows the
// cursor by (1 - hack x slow); from cut[k] hack upward it also drops k of the last, fastest rounds, and it shrinks the
// per-round speed step by hack x stepCut (at most stepCutMax).
const HACK_CFG={barW:200,win:[42,34,27,22],minWin:12,speed:130,step:50,slow:0.3,cut:[0.4,0.8],stepCut:0.6,stepCutMax:0.6,minRounds:2};
