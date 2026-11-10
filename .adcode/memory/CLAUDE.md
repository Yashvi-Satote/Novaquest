<!--
  GENERATED FILE - do not edit.

  Rewritten from .adcode/memory/**/*.md on every memory write. Any edit here is lost
  on the next one. Edit the markdown files instead; they are the source of truth.
-->

# Project memory

Shared memory for every AI working in this project. Read this first; it is the
cheapest way to find out what has already been decided and why.

## Decisions

### blast-door-nasa-hq

Scifi blast door added to NASA HQ 3D room

A medium-poly sci-fi blast door lives in frontend/NovaQuest/nasa-headquarters/SciFiBlastDoor.js and is mounted on the circular wall of NasaHeadquartersModel at angle Math.PI (behind the command dais) facing the room interior. It is floor-anchored and opens/closes by sliding both panels sideways. Toggle from the viewer (BLAST DOOR pill or D key) or programmatically via headquarters.door.setOpen(). It re-exports door control through NasaHeadquartersViewer's imperative handle (openDoor/closeDoor/toggleDoor).
