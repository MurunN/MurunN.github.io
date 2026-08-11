# SteppeQuest vNext 6 — 3D gameplay rebuild

This version replaces the previous 2.5D/static-image game presentation with a WebGL/Three.js gameplay scene.

## Morin Urtuu
- Actual 3D horse + rider assembled from lit 3D geometry and animated every frame.
- Gallop cycle, leg joints, head motion, tail motion, rider lean, jump and camera follow.
- 3D road with repeating terrain, wheel/hoof ruts, roadside gers, flags, grass and mountains.
- No floating scroll/seal collectible loop.
- Mission loop: protect the dispatch -> clear lane checkpoints -> optionally use water stops -> reach relay station.
- Horse stamina drains during sprint and recovers at normal pace/water stops.
- Dispatch integrity falls after obstacle impacts.
- Obstacles, jump collision, checkpoint lane validation, stage progression, scoring, pause and touch controls.

## Mounted Archery
- Same live 3D horse/rider rig, with mounted archer pose, bow, string and quiver.
- Straight track inspired by real mounted-archery course flow.
- Mouse/touch aim, hold-to-draw, release-to-shoot.
- 3D roadside targets, projected hit detection, scoring rings, combo and wind/sway.
- Focus mechanic reduces rider sway at the cost of focus energy.
- Pace control, speed bonus, three rounds, pause and mobile focus/pace controls.

## Dependency
- `three` 0.185.1
- `@types/three` 0.185.1

Run `npm install` after copying this source into the deploy repo so package-lock.json is updated before `npm run build`.

## v6.1 hotfix
- Fixed Mounted Archery Start button on Safari/Chrome: the viewport no longer captures pointer events while the READY overlay is shown.
- Pointer capture is now used only while an archery round is running and releases cleanly on pointer up/cancel.
- Replaced deprecated `THREE.PCFSoftShadowMap` with `THREE.PCFShadowMap`.
- Added `data-scroll-behavior="smooth"` to the root `<html>` to silence the Next.js route-transition warning.
