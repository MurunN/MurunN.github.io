# SteppeQuest vNext 6 — WebGL 3D rebuild

This build adds Three.js. After copying it into your deploy repo, run:

```bash
npm install
npm run dev
```

Test:
- http://localhost:3000/game/relay
- http://localhost:3000/game/archery

Then:

```bash
npm run build
```

Notes:
- `package-lock.json` is intentionally not bundled. `npm install` will update the lockfile in your deploy repo.
- `.env`, `.git`, `node_modules`, `.next`, and `out` are intentionally excluded.
- Horse/rider models in this package are procedural WebGL 3D geometry rendered live in Three.js; no static cinematic gameplay screenshot is used.
