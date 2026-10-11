// Security cameras (v1.00, batch 3 request 15). Not the lift camera terminal: these are wall sensors that sweep a cone.
// minDepth: first depth they appear on. count: [min,max] rolled per deck, then scaled by deck area (aN). range: cone
// reach in px; half: the cone's half-width in radians; pan: how far the head swings either side of straight out (0.785
// rad = 90 degrees in all); panSpeed: radians per second of the sweep. lockT: seconds of continuous sight before the
// alarm; guards: [min,max] security guards the alarm calls. hp: hits to break it. wired: chance a camera gets a control
// panel on a nearby wall (within panelRange tiles, in sight of the camera); minApart: tiles between cameras.
const CAM_CFG={minDepth:3,count:[0,2],range:140,half:0.38,pan:0.785,panSpeed:0.45,lockT:1.5,guards:[2,3],hp:3,wired:0.6,panelRange:7,minApart:10,trackTurn:3};
const CAM_DESC='Wall-mounted security cameras sweep a cone back and forth. If you stay in sight for a second and a half the cone turns red and the alarm goes off, calling security guards; break sight, cloak or hide in smoke before then and it resets. Each camera raises the alarm only once. Shoot or hit one to break it (it takes three hits), cut the power at a breaker to shut them all down, or hack the panel some are wired to: a good hack loops the feed, a failed one sets off the alarm. They ignore creatures.';
