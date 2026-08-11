# SteppeQuest vNext 2.2

## Visual/game upgrades
- Mounted archery now uses a cinematic realistic rider/horse course image as the live gameplay backdrop.
- Relay courier now uses a cinematic third-person horse-riding road as the gameplay backdrop.
- Existing dynamic targets, collectibles, collisions, score, stamina, lane changes and game logic remain interactive on top.
- Relay canvas startup fix remains included.
- Both games keep fallback canvas-drawn environments if cinematic assets fail to load.

## New assets
- public/images/games/archery-cinematic.jpg
- public/images/games/relay-cinematic.jpg

## Changed
- src/components/ArcheryGame.tsx
- src/components/RelayGame.tsx
