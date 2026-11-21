/* Twin Harbours — screenshot staging table.
 * The maker's screenshots come from real renders of the game at ?shot=<name>:
 * each stage plays the level forward through the real click handler, marks a
 * few differences found, and freezes the animation clock, so the frame is
 * exactly what a player sees mid-hunt — two near-identical pictures, gold
 * rings on the differences found, several still unfound, and the counter
 * showing how many remain. The cover shows the first criterion at a glance. */

export const SHOT_STAGES = {
  // Cover: harbour 1, three of seven found, plenty of time left.
  cover: { level: 0, found: 3, timeLeft: 107 },
  // Mid-play: market, two of seven found.
  play: { level: 1, found: 2, timeLeft: 88 },
  // Deep hunt: reef, five of eight found, the clock in the red.
  deep: { level: 3, found: 5, timeLeft: 24 },
  // Win: harbour 1 cleared, the level-clear card with its stars.
  win: { level: 0, found: 7, timeLeft: 107 },
};

/** The ?shot= names the game understands, in screenshot order. */
export const SHOT_NAMES = ['cover', 'play', 'deep', 'win'];
