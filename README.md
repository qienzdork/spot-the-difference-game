[![best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/qienzdork/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/qienzdork/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# ⚓ Twin Harbours — Spot the Difference

Two pictures of the same harbour — almost. Find every difference between them before the fog rolls in. Five hand-drawn harbours, 39 differences, one sharp eye.

## How to play

- **Click a difference** on either picture to ring it in gold. A wrong click costs 5 seconds.
- **Hints** (💡 or `H`): a green ring pulses around a difference you have not found yet. Three per harbour, −50 points each.
- **Timer**: each harbour has its own clock (90–120s). Beat it for a time bonus — 5 points per second left — and up to three stars.
- **Combo**: find differences in a row without a miss and each find pays +25 more.
- **Keys**: `H` hint · `M` mute · `Enter` start / continue.

## The harbours

1. **Dusk Harbour** — the lighthouse pier at sunset (7 differences, 120s)
2. **Night Market** — lanterns and fruit stalls (7 differences, 105s)
3. **Forest Camp** — tent, fire and fireflies (8 differences, 100s)
4. **Coral Reef** — under the waves (8 differences, 95s)
5. **Snow Station** — the northbound train (9 differences, 90s)

## Structure

- `game/index.html` — page shell, HUD and overlays
- `game/style.css` — the harbour-night look
- `game/main.js` — entry point
- `game/game.js` — rules: levels, timer, clicks, hints, scoring, screens
- `game/scenes.js` — the art: five canvas-drawn scenes and their differences
- `game/audio.js` — WebAudio synth sounds (no audio files)
- `game/shots.js` — deterministic `?shot=` staging for the screenshots
- `main.ts` — hand-in program: copies `game/` + `screenshots/` and writes `dossier.json`
- `serve.ts` — dev server (`node serve.ts`, then http://localhost:8080)

Everything is drawn in code and synthesised in code — no images, fonts or sounds are fetched, and the game makes no network requests.

## Screenshots

Real renders of the game's own code in a browser: the cover shows harbour 1 mid-hunt with three differences found and four still hiding, then the market, the reef against the clock, and a harbour cleared.

## License

MIT — see [LICENSE](LICENSE).
