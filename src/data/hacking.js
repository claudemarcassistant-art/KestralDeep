// Panel hacking (v0.97; progress bar since v1.14): the bar is barW px wide and the cursor bounces along it. A hack
// breaks in when its progress reaches goal: every lock inside the window adds hit points (x (1 + hack x hitHack)), and
// every time the cursor reaches either end of the bar and bounces, progress drops by bounce (never below 0). After each
// lock the window (px) comes from win[] by the number of locks so far (the last entry repeats) and the cursor speed is
// speed + locks x step (px/s). Hack expertise (the hack stat: splicer kit 0.4, Surveyor tier 1 0.25, Memory 0.05 a
// point) widens windows by (1 + hack), slows the cursor by (1 - hack x slow), shrinks the per-lock speed step by
// hack x stepCut (at most stepCutMax) and raises the points per lock. Two misses still short the panel out.
const HACK_CFG={barW:200,win:[42,34,27,22],minWin:12,speed:130,step:50,slow:0.3,stepCut:0.6,stepCutMax:0.6,goal:100,hit:40,hitHack:0.5,bounce:10};
