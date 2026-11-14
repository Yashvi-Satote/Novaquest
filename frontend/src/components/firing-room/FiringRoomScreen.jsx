import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { LAUNCH_VIDEO, HELIUM_T } from '../../config/launchVideo.js';
import { useLaunchVideo } from '../../hooks/useLaunchVideo.js';

/**
 * FiringRoomScreen
 * 
 * Manages the hidden <video> element mapped to the Firing Room 3D big screen
 * via THREE.VideoTexture (SRGBColorSpace, LinearFilter, no mipmaps).
 * Coordinates Part 2 (liftoff -> HELIUM_T) and Part 3 (HELIUM_T -> end).
 * Handles disposal on unmount to avoid memory leaks.
 */
const FiringRoomScreen = forwardRef(function FiringRoomScreen(
  {
    onVideoTextureReady,
    onSegmentEnd,
    onEmergencyAtHeliumT,
    muted = true,
  },
  ref,
) {
  const videoRef = useRef(null);
  const textureRef = useRef(null);
  const [textureCreated, setTextureCreated] = useState(false);

  const handleSegmentFinished = useCallback(
    (finishedSegment) => {
      if (finishedSegment === 'part2') {
        // Paused at HELIUM_T -> trigger emergency
        onEmergencyAtHeliumT?.();
      }
      onSegmentEnd?.(finishedSegment);
    },
    [onEmergencyAtHeliumT, onSegmentEnd],
  );

  const {
    isLoading,
    isPlaying,
    currentTime,
    duration,
    currentSegment,
    playSegment,
    pauseAt,
    resume,
    setMuted,
  } = useLaunchVideo({
    videoRef,
    src: LAUNCH_VIDEO.src,
    onSegmentEnd: handleSegmentFinished,
    muted: true,
    stopBeforeEndSeconds: 3,
  });

  // Ensure video element audio is strictly muted upon mounting in firing room
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.volume = 0;
    }
  }, []);

  // Create VideoTexture when video element is ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.muted = true;
    video.volume = 0;

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    textureRef.current = texture;
    setTextureCreated(true);

    if (onVideoTextureReady) {
      onVideoTextureReady(texture);
    }

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, [onVideoTextureReady]);

  // Imperative API for parent control
  useImperativeHandle(ref, () => ({
    playSegment: (partName) => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
      }
      return playSegment(partName);
    },
    pauseAt: (time) => pauseAt(time),
    resume: (targetEnd) => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
      }
      const dur = videoRef.current?.duration || 105.72;
      const earlyStop = typeof targetEnd === 'number' ? targetEnd : Math.max(0, dur - 3);
      return resume(earlyStop);
    },
    mute: () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
      }
      setMuted(true);
    },
    getVideoElement: () => videoRef.current,
    getVideoTexture: () => textureRef.current,
    currentTime,
    isPlaying,
    isLoading,
  }));

  return (
    <div aria-hidden="true">
      {/* Hidden video element used as Three.js VideoTexture source */}
      <video
        ref={videoRef}
        src={LAUNCH_VIDEO.src}
        playsInline
        muted={true}
        preload="auto"
        crossOrigin="anonymous"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '4px',
          height: '4px',
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <source src={LAUNCH_VIDEO.src} type={LAUNCH_VIDEO.type} />
      </video>
    </div>
  );
});

export default FiringRoomScreen;
