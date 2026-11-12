import { STORAGE_ROOM_COMPONENTS } from './storageRoomComponents';

/**
 * The flight manifest for the 1967 Surveyor 5 build.
 *
 * The storage room deliberately mixes parts from three spacecraft. Only the
 * ids below belong on Surveyor 5; everything else on the shelves is a decoy.
 * The list is derived from the storage-room catalogue so the task page and the
 * in-world sprites always share the same names, colours and descriptions.
 */
export const SURVEYOR5_MANIFEST_IDS = [
  // Structure & landing gear
  'surveyor-triangular-frame',
  'surveyor-landing-legs',
  'surveyor-warm-electronics-box',
  // Propulsion
  'surveyor-retrorocket',
  'surveyor-vernier-thrusters',
  // Power
  'surveyor-solar-panel',
  'surveyor-battery',
  // Avionics, guidance & thermal control
  'surveyor-altitude-radar',
  'surveyor-star-sun-sensor',
  'surveyor-thermal-compartments',
  // Communications
  'surveyor-high-gain-antenna',
  'surveyor-omni-antennas',
  // Science
  'surveyor-tv-camera',
  'surveyor-alpha-scattering',
  'surveyor-footpad-magnet',
];

const componentsById = new Map(STORAGE_ROOM_COMPONENTS.map((component) => [component.id, component]));

export const SURVEYOR5_MANIFEST = SURVEYOR5_MANIFEST_IDS
  .map((id) => componentsById.get(id))
  .filter(Boolean);

export const SURVEYOR5_MANIFEST_TOTAL = SURVEYOR5_MANIFEST.length;

/** The player's collection cart only holds this many loose parts at once. */
export const SURVEYOR5_CART_LIMIT = 10;

/** The one Surveyor part in the room that must stay on the shelf. */
export const SURVEYOR5_DECOY_IDS = ['surveyor-soil-sampler'];

export const SURVEYOR5_STAGES = [
  {
    id: 'collect',
    index: 1,
    label: 'Collect the manifest',
    shortLabel: 'Collection',
    location: 'Parts storage room',
  },
  {
    id: 'materialise',
    index: 2,
    label: 'Materialise the hologram',
    shortLabel: 'Assembly',
    location: 'Mission-control dais',
  },
  {
    id: 'launch',
    index: 3,
    label: 'Launch Surveyor 5',
    shortLabel: 'Launch',
    location: 'Firing room',
  },
];
