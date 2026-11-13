import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSaveGame, saveGame } from '../../NovaQuest/game/saveManager.js';
import { gameAudio } from '../../NovaQuest/config/gameAudio.js';

const LaunchMissionContext = createContext(null);

export function LaunchMissionProvider({ children }) {
  const [launchReady, setLaunchReady] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [task3Solved, setTask3Solved] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [score, setScore] = useState(100);

  // Cinematic & 3D Playback orchestration
  const [isPart1Open, setIsPart1Open] = useState(false);
  const [countdown, setCountdown] = useState(null); // null | 3 | 2 | 1 | 0
  const [isLaunching, setIsLaunching] = useState(false);
  const [cameraShakeIntensity, setCameraShakeIntensity] = useState(0);
  const [hudMessage, setHudMessage] = useState(null);

  // Hydrate from existing save game if present
  useEffect(() => {
    try {
      const save = getSaveGame();
      if (save?.surveyor5Launch) {
        if (save.surveyor5Launch.launchReady) setLaunchReady(true);
        if (save.surveyor5Launch.task3Solved) setTask3Solved(true);
        if (save.surveyor5Launch.missionComplete) setMissionComplete(true);
        if (typeof save.surveyor5Launch.score === 'number') setScore(save.surveyor5Launch.score);
      }
    } catch (e) {
      // Safe fallback
    }
  }, []);

  const persistState = useCallback((updates) => {
    try {
      const current = getSaveGame() || {};
      const updated = {
        ...current,
        surveyor5Launch: {
          ...(current.surveyor5Launch || {}),
          ...updates,
          timestamp: Date.now(),
        },
      };
      saveGame(updated);
    } catch (e) {
      // Persistence fallback
    }
  }, []);

  // Step 2: Triggered by clicking UNLOCK LAUNCH
  const startPart1Cinematic = useCallback(() => {
    setIsPart1Open(true);
  }, []);

  // Step 2 complete: automatically pauses at 1:11, fades out, marks launchReady = true
  const finishPart1Cinematic = useCallback(() => {
    setIsPart1Open(false);
    setLaunchReady(true);
    persistState({ launchReady: true });
    setHudMessage({
      text: "Liftoff is minutes away. Head to the Firing Room at the end of the corridor.",
      type: "info",
      timestamp: Date.now(),
    });
  }, [persistState]);

  // Step 4: Countdown + liftoff swell + camera shake before Part 2 starts
  const startLaunchSequence = useCallback((onCountdownComplete) => {
    if (isLaunching) return;
    setIsLaunching(true);
    setCountdown(3);
    gameAudio.ensureUnlocked?.();
    gameAudio.playCountdownBeep?.(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        gameAudio.playCountdownBeep?.(count === 1);
      } else {
        clearInterval(interval);
        setCountdown(0);
        // Liftoff swell + subtle camera shake
        gameAudio.playThruster?.(3.8);
        setCameraShakeIntensity(1.0);

        setTimeout(() => {
          setCountdown(null);
          setIsLaunching(false);
          if (onCountdownComplete) onCountdownComplete();
        }, 600);
      }
    }, 1000);
  }, [isLaunching]);

  // Step 5: Video reached HELIUM_T -> emergency triggered
  const triggerEmergency = useCallback(() => {
    setEmergencyActive(true);
    gameAudio.playAlarm?.();
  }, []);

  // Step 6: Task 3 solved correctly
  const solveTask3 = useCallback(() => {
    setTask3Solved(true);
    setEmergencyActive(false);
    persistState({ task3Solved: true });
    gameAudio.playVictory?.();
  }, [persistState]);

  // Complete entire mission when Part 3 ends
  const completeMission = useCallback(() => {
    setMissionComplete(true);
    persistState({ missionComplete: true });
    gameAudio.playVictory?.();
  }, [persistState]);

  const deductScore = useCallback((amount = 10) => {
    setScore((prev) => {
      const next = Math.max(0, prev - amount);
      persistState({ score: next });
      return next;
    });
  }, [persistState]);

  const resetMission = useCallback(() => {
    setLaunchReady(false);
    setEmergencyActive(false);
    setTask3Solved(false);
    setMissionComplete(false);
    setScore(100);
    setIsPart1Open(false);
    setCountdown(null);
    setIsLaunching(false);
    setCameraShakeIntensity(0);
    persistState({
      launchReady: false,
      emergencyActive: false,
      task3Solved: false,
      missionComplete: false,
      score: 100,
    });
  }, [persistState]);

  return (
    <LaunchMissionContext.Provider
      value={{
        launchReady,
        setLaunchReady,
        emergencyActive,
        setEmergencyActive,
        task3Solved,
        setTask3Solved,
        missionComplete,
        setMissionComplete,
        score,
        deductScore,
        isPart1Open,
        startPart1Cinematic,
        finishPart1Cinematic,
        countdown,
        isLaunching,
        cameraShakeIntensity,
        setCameraShakeIntensity,
        hudMessage,
        setHudMessage,
        startLaunchSequence,
        triggerEmergency,
        solveTask3,
        completeMission,
        resetMission,
      }}
    >
      {children}
    </LaunchMissionContext.Provider>
  );
}

export function useLaunchMission() {
  const context = useContext(LaunchMissionContext);
  if (!context) {
    throw new Error('useLaunchMission must be used within a LaunchMissionProvider');
  }
  return context;
}

export default LaunchMissionContext;
