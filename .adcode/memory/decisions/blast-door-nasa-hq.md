---
name: blast-door-nasa-hq
description: Scifi blast door added to NASA HQ 3D room
type: decision
created: 2026-11-10
agents: [adcode-chat]
---

A medium-poly sci-fi blast door lives in frontend/NovaQuest/nasa-headquarters/SciFiBlastDoor.js and is mounted on the circular wall of NasaHeadquartersModel at angle Math.PI (behind the command dais) facing the room interior. It is floor-anchored and opens/closes by sliding both panels sideways. Toggle from the viewer (BLAST DOOR pill or D key) or programmatically via headquarters.door.setOpen(). It re-exports door control through NasaHeadquartersViewer's imperative handle (openDoor/closeDoor/toggleDoor).
