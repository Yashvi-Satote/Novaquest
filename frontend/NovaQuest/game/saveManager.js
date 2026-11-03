/**
 * Novaquest Game Save Manager
 * Handles mission checkpoints and player state.
 *
 * progressRepository chooses the storage source: localStorage for guests and
 * the NovaUser account for signed-in users (with localStorage as an offline
 * cache). Components keep using this synchronous API.
 */

import {
  deleteProgress,
  getProgress,
  hasProgress,
  saveProgress,
} from './progressRepository';

export const DEFAULT_MISSION_ECHO = {
  unlocked: false,
  descentComplete: false,
  surfaceComplete: false,
  archiveComplete: false,
  restoredFrame: null,
  clueDiscovered: false,
  stageComplete: false,
  completedAt: null
};

export const INITIAL_MISSION_STATE = {
  version: '1.0',
  id: 'mission_1',
  code: 'APOLLO-RECON-01',
  currentChapter: 'prologue',
  title: 'Opening: The One Who Looked Up',
  location: 'Childhood Room & Study',
  coordinates: 'Earth (Sol 3)',
  targetBody: 'Moon',
  objective: 'Inspect childhood space artifacts, write the promise in the notebook, and look through the telescope.',
  timestamp: Date.now(),
  playtimeSeconds: 0,
  missionEcho: { ...DEFAULT_MISSION_ECHO },
  player: {
    mcName: 'Captain Arin Rao',
    mcGender: 'male', // 'male' or 'female'
    pronouns: {
      subject: 'he',
      subjectCap: 'He',
      object: 'him',
      possessive: 'his',
      possessiveCap: 'His',
      title: 'Sir'
    },
    callsign: 'Rao-1',
    hullIntegrity: 100,
    fuelCapacity: 100,
    scanProgress: 0,
    dataPacksCollected: 0,
    activeQuestsCompleted: 0
  },
  difficulty: 'Commander'
};

/** Checks whether an active game save exists. */
export function hasSaveGame() {
  return hasProgress();
}

/** Retrieves the current game save data, or null if none exists. */
export function getSaveGame() {
  return getProgress();
}

/** Initializes a brand new game state and persists it. */
export function createNewGame(options = {}) {
  const gender = options.gender || 'male';
  const isFemale = gender === 'female';

  const newSave = {
    ...INITIAL_MISSION_STATE,
    difficulty: options.difficulty || 'Commander',
    currentChapter: 'prologue',
    missionEcho: { ...DEFAULT_MISSION_ECHO },
    player: {
      ...INITIAL_MISSION_STATE.player,
      mcGender: gender,
      callsign: options.callsign || 'Captain Rao',
      pronouns: {
        subject: isFemale ? 'she' : 'he',
        subjectCap: isFemale ? 'She' : 'He',
        object: isFemale ? 'her' : 'him',
        possessive: isFemale ? 'her' : 'his',
        possessiveCap: isFemale ? 'Her' : 'His',
        title: isFemale ? "Ma'am" : 'Sir'
      }
    },
    timestamp: Date.now(),
    playtimeSeconds: 0
  };
  saveGame(newSave);
  return newSave;
}

/** Persists updated game state locally and to the account when signed in. */
export function saveGame(saveData) {
  return saveProgress(saveData);
}

/** Deletes existing save game (resetting progress). */
export function deleteSaveGame() {
  return deleteProgress();
}
