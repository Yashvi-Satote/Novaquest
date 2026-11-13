# NASA Headquarters — 3D Base

A reusable, medium-poly NASA Headquarters mission-control base for NovaQuest, including an
exterior airlock built into the room wall. The scene is modelled procedurally with three.js,
so it ships without any external model download.

## What is inside

| File | Purpose |
| --- | --- |
| `NasaHeadquartersModel.js` | Builds the 360° interior, including a faceted titanium airlock with a maintenance console and segmented sliding panels, alongside the curved display bays, operator stations, central dais and Surveyor 5 hologram. Returns `{ root, update, dispose, door, doorHitTarget, character, corridor, interactionTargets }`. |
| `NasaHeadquartersAstronaut.js` | Lightweight medium-poly astronaut character used in the room and hidden while in first-person view. |
| `NasaHeadquartersCorridor.js` | Medium-poly exterior passage attached to the airlock, with repeating structural ribs, panelled bulkheads, ceiling lights, reflective floor and the connected firing room. |
| `NasaHeadquartersStorageRoom.js` | Side room midway along the corridor, with a matching sliding entrance, illuminated parts cupboards, independently hinged glass doors and central workbenches. |
| `NasaHeadquartersFiringRoom.js` | Medium-poly launch firing room at the corridor end, with an operable matching sliding airlock, launch display, telemetry stations, monitors and chairs. |
| `Surveyor5Hologram.js` | Procedural medium-poly Surveyor 5 lander built from additive wireframe panels, glowing edges, a rotating camera turret, antenna motion, base rings, scan ring and drifting particles. Returns `{ root, update }`. |
| `NasaHeadquartersViewer.jsx` | Self-contained React viewport with OrbitControls, responsive resizing, WebGL fallback, visibility pausing, first-person full-yaw look and movement, and solid-object collision. |
| `NasaHeadquartersModal.jsx` | Full-screen interactive presentation of the base, opened from the Level 1: The Moon hub. |

## Using the base in a game scene

```js
import { createNasaHeadquarters } from './NasaHeadquartersModel';

const headquarters = createNasaHeadquarters();
scene.add(headquarters.root);

// In the render loop:
headquarters.update(delta, elapsed);

// Open or close the exterior airlock:
headquarters.door.setOpen(true);

// Operate the parts-room entrance halfway down the exterior corridor:
headquarters.corridor.storageRoom.entryDoor.setOpen(true);

// Operate the firing-room entrance at the far end of the corridor:
headquarters.corridor.firingRoom.door.setOpen(true);

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
Drag in the 3D view to orbit freely around the room, including upward and downward;
click an interactive door or use the on-screen controls. Press **E**
to open or close the door nearest to you (airlock, parts room, or firing room).
Choose **Control astronaut** to move the visible character with **WASD** or the arrow
keys, **Shift** to sprint, and drag to orbit the follow camera. Click a door or use
**E** for the nearest one, and **Esc** to stop character control. Choose **Enter
first person** to explore the base and walk through the open airlock
into the exterior corridor, parts room and firing room with **WASD**, unrestricted
360° horizontal look, and **Shift** to sprint. The player collides with scene props
while moving; airlock and cupboard door panels remain passable. Click the airlock to
operate it, or press **E** to open the nearest door. Click any cupboard glass panel
to swing it open or closed. **Esc** releases the mouse or exits first person.

On a laptop touchpad, one finger moves the normal cursor (so you can click doors),
while a two-finger swipe looks around freely in first person and orbits the camera
in the other views. Use **Enable mouse look** to lock the pointer when you want
traditional mouse look.

## Presentation

The `NASA HEADQUARTERS` button on the `/app` Level 1: The Moon page opens
`NasaHeadquartersModal`. It can also be triggered anywhere else by passing
`isOpen` / `onClose` props.
