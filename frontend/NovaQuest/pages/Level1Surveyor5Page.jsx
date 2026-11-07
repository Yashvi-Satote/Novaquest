import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameplayHUD from '../components/gameplay/GameplayHUD';
import LunarSurfaceScene from '../components/gameplay/LunarSurfaceScene';
import NasaHqScene from '../components/gameplay/NasaHqScene';
import AssemblyLabScene from '../components/gameplay/AssemblyLabScene';
import LaunchEmergencyScene from '../components/gameplay/LaunchEmergencyScene';
import SoilAnalysisScene from '../components/gameplay/SoilAnalysisScene';
import MissionCompletionModal from '../components/gameplay/MissionCompletionModal';
import { SURVEYOR_5_MISSION } from '../config/surveyor5Data';
import { gameAudio } from '../config/gameAudio';
import { saveGame } from '../game/saveManager';

/**
 * Level1Surveyor5Page.jsx
 * 
 * Master Game Runner for Level 1: Surveyor 5 (1967)
 * "Time Travelers of Space" — NovaQuest Games
 * 
 * Orchestrates all 6 scenes according to the Game Development Document:
 * 1. Discovery on the Moon (0:00 - 0:45)
 * 2. NASA Headquarters 1967 (0:45 - 1:15)
 * 3. Surveyor 5 Assembly Lab (1:15 - 2:30)
 * 4. Launch Emergency (2:30 - 3:30)
 * 5. Lunar Soil Analysis (3:30 - 4:30)
 * 6. Final Mission Conclusion (4:30 - 5:00)
 */
export default function Level1Surveyor5Page() {
  const navigate = useNavigate();

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const scenes = SURVEYOR_5_MISSION.scenes;
  const currentScene = scenes[currentSceneIndex] || scenes[0];

  // Mission Timer
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Scene Progression Handlers
  const handleAdvanceScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      // Persist completion state
      try {
        saveGame({
          currentChapter: 'surveyor_5_completed',
          badges: [SURVEYOR_5_MISSION.badgeName],
          stars: 3,
          level1Completed: true
        });
      } catch (e) {}
    }
  };

  const handleReplay = () => {
    setCurrentSceneIndex(0);
    setElapsedSeconds(0);
    setIsCompleted(false);
    gameAudio.playClick();
  };

  const handleReturnToHub = () => {
    gameAudio.playClick();
    navigate('/missions');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. Global Gameplay HUD */}
      <GameplayHUD
        currentSceneIndex={currentSceneIndex}
        totalScenes={scenes.length}
        sceneTitle={currentScene.title}
        sceneObjective={currentScene.objective}
        elapsedSeconds={elapsedSeconds}
        onExit={() => navigate('/missions')}
        onToggleHelp={() => setShowHelp(prev => !prev)}
        showHelp={showHelp}
      />

      {/* 2. Scene Rendering based on active index */}
      <div className="w-full h-full pt-16">
        {currentSceneIndex === 0 && (
          <LunarSurfaceScene onComplete={handleAdvanceScene} />
        )}

        {currentSceneIndex === 1 && (
          <NasaHqScene onComplete={handleAdvanceScene} />
        )}

        {currentSceneIndex === 2 && (
          <AssemblyLabScene onComplete={handleAdvanceScene} />
        )}

        {currentSceneIndex === 3 && (
          <LaunchEmergencyScene onComplete={handleAdvanceScene} />
        )}

        {currentSceneIndex === 4 && (
          <SoilAnalysisScene onComplete={handleAdvanceScene} />
        )}

        {currentSceneIndex === 5 && !isCompleted && (
          <div className="w-full h-full flex items-center justify-center p-6 text-center">
            <MissionCompletionModal
              isOpen={true}
              onReplay={handleReplay}
              onReturnToHub={handleReturnToHub}
              elapsedSeconds={elapsedSeconds}
            />
          </div>
        )}
      </div>

      {/* 3. Mission Completion Modal */}
      {isCompleted && (
        <MissionCompletionModal
          isOpen={true}
          onReplay={handleReplay}
          onReturnToHub={handleReturnToHub}
          elapsedSeconds={elapsedSeconds}
        />
      )}
    </div>
  );
}
