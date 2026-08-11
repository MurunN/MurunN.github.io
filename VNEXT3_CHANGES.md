# SteppeQuest vNext 3 — Live Gameplay

This package is based directly on the user's uploaded `steppequest_deploy` project.

## Mounted Archery
- Removed static cinematic-image dependence from live gameplay.
- Live procedural 2.5D steppe road with curve, mountains, clouds, gers, fences and flags.
- Animated articulated horse: body bob, four galloping legs, tail and mane movement.
- Animated rider on horseback with arms/bow aligned to the current aim direction.
- Hold pointer to draw the bow; release to fire an animated arrow.
- A/D or Left/Right changes the horse lane while riding.
- Shift spends Focus to reduce rider sway.
- Approaching targets, small targets, gold targets, hit particles, camera kick, combo, wind and score.
- Three timed rounds with increasing difficulty.

## Morin Urtuu Relay
- Removed static cinematic-image dependence from live gameplay.
- Live curved relay road with depth, moving fences, flags, gers, mountains, dawn/day/night stages and a river-valley section.
- Animated rear-perspective horse and courier: galloping legs, bob, rider lean, reins, mane and tail.
- A/D or Left/Right changes lanes, Space/Up jumps, Shift boosts speed.
- Functional obstacles, collisions, jumping, scroll/seal/water pickups, stamina, score and stage goals.
- Working station gate at the end of every stage; the gate spans all lanes so the route cannot become stuck.
- Dust, speed streaks and camera shake react to movement and collisions.

## Validation
- TypeScript validation (`tsc --noEmit`) passes in the build environment.
