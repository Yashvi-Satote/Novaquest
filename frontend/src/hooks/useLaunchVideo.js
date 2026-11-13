import { useCallback, useEffect, useRef, useState } from 'react';
import { LAUNCH_VIDEO } from '../config/launchVideo.js';

/**
 * useLaunchVideo
 * 
 * Reusable hook to control playback of the NASA/JPL Surveyor 5 launch video.
 * Enforces precise segment timing (stops within ~50ms of segment end),
 * manages video lifecycle, and handles browser autoplay policies.
 */
export function useLaunchVideo({
  videoRef: externalVideoRef,
  src = LAUNCH_VIDEO.src,
  onSegmentEnd: initialOnSegmentEnd,
} = {}) {
  const internalVideoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [error, setError] = useState(null);

  const targetEndTimeRef = useRef(null);
  const segmentCallbackRef = useRef(initialOnSegmentEnd);
  const frameCallbackIdRef = useRef(null);
  const rafIdRef = useRef(null);
  const activeSegmentRef = useRef(null);

  // Synchronize initial callback
  useEffect(() => {
    segmentCallbackRef.current = initialOnSegmentEnd;
  }, [initialOnSegmentEnd]);

  // Ensure internal video element if external ref not provided
  const getVideo = useCallback(() => {
    if (externalVideoRef?.current) {
      return externalVideoRef.current;
    }
    if (!internalVideoRef.current && typeof document !== 'undefined') {
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.playsInline = true;
      vid.preload = 'auto';
      vid.muted = false;
      vid.src = src;
      internalVideoRef.current = vid;
    }
    return internalVideoRef.current;
  }, [externalVideoRef, src]);

  // Precision frame watcher: stops precisely at targetEndTime (~50ms accuracy)
  const stopFrameWatcher = useCallback(() => {
    const video = getVideo();
    if (frameCallbackIdRef.current && video?.cancelVideoFrameCallback) {
      video.cancelVideoFrameCallback(frameCallbackIdRef.current);
      frameCallbackIdRef.current = null;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, [getVideo]);

  const onSegmentEnd = useCallback((callback) => {
    segmentCallbackRef.current = callback;
  }, []);

  const checkSegmentEnd = useCallback(() => {
    const video = getVideo();
    if (!video) return;

    const targetEnd = targetEndTimeRef.current;
    const curTime = video.currentTime;
    setCurrentTime(curTime);

    // If targetEnd is set and we reached within 50ms (or passed it)
    if (targetEnd !== null && curTime >= targetEnd - 0.05) {
      video.pause();
      try {
        video.currentTime = targetEnd;
      } catch (e) {
        // Safe seek guard
      }
      stopFrameWatcher();
      setIsPlaying(false);
      const finishedSegment = activeSegmentRef.current;
      targetEndTimeRef.current = null;
      activeSegmentRef.current = null;
      setCurrentSegment(null);

      if (segmentCallbackRef.current) {
        segmentCallbackRef.current(finishedSegment);
      }
      return;
    }

    // Schedule next frame check
    if (typeof video.requestVideoFrameCallback === 'function') {
      frameCallbackIdRef.current = video.requestVideoFrameCallback(() => {
        checkSegmentEnd();
      });
    } else {
      rafIdRef.current = requestAnimationFrame(checkSegmentEnd);
    }
  }, [getVideo, stopFrameWatcher]);

  const startFrameWatcher = useCallback(() => {
    stopFrameWatcher();
    checkSegmentEnd();
  }, [checkSegmentEnd, stopFrameWatcher]);

  // Play a specific configured segment ('part1', 'part2', 'part3')
  const playSegment = useCallback(
    async (partName) => {
      const segment = LAUNCH_VIDEO[partName];
      if (!segment) {
        console.warn(`[useLaunchVideo] Unknown segment: ${partName}`);
        return;
      }

      const video = getVideo();
      if (!video) return;

      activeSegmentRef.current = partName;
      targetEndTimeRef.current = typeof segment.end === 'number' ? segment.end : null;
      setCurrentSegment(partName);

      try {
        // Fast seek to segment start
        if (Math.abs(video.currentTime - segment.start) > 0.1) {
          video.currentTime = segment.start;
        }

        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        setIsPlaying(true);
        startFrameWatcher();
      } catch (err) {
        console.warn('[useLaunchVideo] Playback blocked or failed, retrying muted:', err);
        try {
          video.muted = true;
          await video.play();
          setIsPlaying(true);
          startFrameWatcher();
        } catch (retryErr) {
          setError(retryErr);
          setIsPlaying(false);
        }
      }
    },
    [getVideo, startFrameWatcher],
  );

  // Pause at an explicit timestamp
  const pauseAt = useCallback(
    (time) => {
      const video = getVideo();
      if (!video) return;

      if (typeof time === 'number') {
        targetEndTimeRef.current = time;
        if (video.currentTime >= time) {
          video.pause();
          video.currentTime = time;
          setIsPlaying(false);
          stopFrameWatcher();
        } else {
          startFrameWatcher();
        }
      } else {
        video.pause();
        setIsPlaying(false);
        stopFrameWatcher();
      }
    },
    [getVideo, startFrameWatcher, stopFrameWatcher],
  );

  // Resume playback
  const resume = useCallback(
    async (newTargetEnd = null) => {
      const video = getVideo();
      if (!video) return;

      if (typeof newTargetEnd === 'number') {
        targetEndTimeRef.current = newTargetEnd;
      }

      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        setIsPlaying(true);
        startFrameWatcher();
      } catch (err) {
        console.warn('[useLaunchVideo] Resume failed, retrying muted:', err);
        try {
          video.muted = true;
          await video.play();
          setIsPlaying(true);
          startFrameWatcher();
        } catch (retryErr) {
          setError(retryErr);
        }
      }
    },
    [getVideo, startFrameWatcher],
  );

  // Wire video element events
  useEffect(() => {
    const video = getVideo();
    if (!video) return undefined;

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      checkSegmentEnd();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      stopFrameWatcher();
      if (segmentCallbackRef.current) {
        segmentCallbackRef.current(activeSegmentRef.current || 'ended');
      }
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError(video.error || new Error('Video loading error'));
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Initial check
    if (video.readyState >= 3) {
      setIsLoading(false);
      setDuration(video.duration || 0);
    }

    return () => {
      stopFrameWatcher();
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);

      // Clean up internal video on unmount
      if (internalVideoRef.current) {
        internalVideoRef.current.pause();
        internalVideoRef.current.removeAttribute('src');
        internalVideoRef.current.load();
        internalVideoRef.current = null;
      }
    };
  }, [getVideo, checkSegmentEnd, stopFrameWatcher]);

  return {
    videoElement: getVideo(),
    isLoading,
    isPlaying,
    currentTime,
    duration,
    currentSegment,
    error,
    playSegment,
    pauseAt,
    resume,
    onSegmentEnd,
  };
}

export default useLaunchVideo;
