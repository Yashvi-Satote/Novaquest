# NASA Headquarters — 3D Base

A reusable, medium-poly NASA Headquarters mission-control base for NovaQuest. The scene is
modelled procedurally with three.js, so it ships without any external model download.

## What is inside

| File | Purpose |
| --- | --- |
| `NasaHeadquartersModel.js` | Builds the complete 360° interior: circular command room, eight curved display bays, operator desks and chairs, central dais, Surveyor 5 hologram, ceiling light panels and floor inlays. Returns `{ root, update, dispose }`. |
| `Surveyor5Hologram.js` | Procedural medium-poly Surveyor 5 lander built from additive wireframe panels, glowing edges, a rotating camera turret, antenna motion, base rings, scan ring and drifting particles. Returns `{ root, update }`. |
| `NasaHeadquartersViewer.jsx` | Self-contained React viewport with OrbitControls, responsive resizing, WebGL fallback, visibility pausing and full resource disposal. |
| `NasaHeadquartersModal.jsx` | Full-screen interactive presentation of the base, opened from the Level 1: The Moon hub. |

## Using the base in a game scene

```js
import { createNasaHeadquarters } from './NasaHeadquartersModel';

const headquarters = createNasaHeadquarters();
scene.add(headquarters.root);

// In the render loop:
headquarters.update(delta, elapsed);

// On teardown:
headquarters.dispose();
```

All geometry and display artwork is generated at runtime, so the base needs no
external model or planet textures. The central hologram is the Surveyor 5 lander
from `Surveyor5Hologram.js`; the wall displays show its schematic, landing site
and descent telemetry.

## Using the viewer

```jsx
import NasaHeadquartersViewer from './NasaHeadquartersViewer';

<div className="h-[70vh]">
  <NasaHeadquartersViewer />
</div>;
```

The viewer expects a sized parent element and handles its own renderer lifecycle.

## Presentation

The `NASA HEADQUARTERS` button on the `/app` Level 1: The Moon page opens
`NasaHeadquartersModal`. It can also be triggered anywhere else by passing
`isOpen` / `onClose` props.
