# NASA Headquarters — 3D Base

A reusable, medium-poly NASA Headquarters mission-control base for NovaQuest. The scene is
modelled procedurally with three.js, so it ships without any external model download.

## What is inside

| File | Purpose |
| --- | --- |
| `NasaHeadquartersModel.js` | Builds the complete 360° interior: circular command room, eight curved display bays, operator desks and chairs, central dais, holographic Earth, ceiling light panels and floor inlays. Returns `{ root, update, dispose }`. |
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

The model uses the existing texture at `/textures/planets/earth_day.jpg` and
`/textures/planets/earth_clouds.jpg`.

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
