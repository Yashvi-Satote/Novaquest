/**
 * Novaquest Game Save Manager
 * Handles local persistence of mission checkpoints and player state.
 */

const STORAGE_KEY_SAVE = 'novaquest_save_game';

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

/**
 * Checks whether an active game save exists.
 */
export function hasSaveGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVE);
    return raw !== null && raw.length > 10;
  } catch {
    return false;
  }
}

/**
 * Retrieves the current game save data, or null if none exists.
 */
export function getSaveGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse save game:', err);
    return null;
  }
}

/**
 * Initializes a brand new game state and persists it.
 */
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

/**
 * Persists updated game state to localStorage.
 */
export function saveGame(saveData) {
  try {
    const dataWithTimestamp = {
      ...saveData,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY_SAVE, JSON.stringify(dataWithTimestamp));
    return true;
  } catch (err) {
    console.error('Failed to save game state:', err);
    return false;
  }
}

/**
 * Deletes existing save game (resetting progress).
 */
export function deleteSaveGame() {
  try {
    localStorage.removeItem(STORAGE_KEY_SAVE);
    return true;
  } catch (err) {
    console.error('Failed to clear save game:', err);
    return false;
  }
}
