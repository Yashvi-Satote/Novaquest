import { useEffect, useState } from 'react';

/**
 * Phones are the only touch devices that get the landscape-only experience.
 * Tablets, touchscreen laptops and desktops keep their normal layout.
 *
 * A phone is detected from touch support plus a coarse pointer / mobile user
 * agent, and the smallest viewport edge must stay below the tablet range.
 * The short-edge check works in both portrait and landscape because it always
 * looks at the smaller of width and height.
 */
const PHONE_SHORT_EDGE_MAX = 560;

export function isPhoneDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const hasTouch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  if (!hasTouch) return false;

  const userAgent = navigator.userAgent || '';
  const mobileUserAgent = /Android|iPhone|iPod|Mobile|Windows Phone|webOS|BlackBerry|Opera Mini/i.test(userAgent);

  let coarsePointer = false;
  try {
    coarsePointer = typeof window.matchMedia === 'function'
      && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  } catch {
    coarsePointer = false;
  }

  const shortEdge = Math.min(window.innerWidth || 0, window.innerHeight || 0);

  return (mobileUserAgent || coarsePointer)
    && shortEdge > 0
    && shortEdge <= PHONE_SHORT_EDGE_MAX;
}

export function isPortraitViewport() {
  if (typeof window === 'undefined') return false;

  try {
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(orientation: portrait)').matches;
    }
  } catch {
    // Fall through to the viewport comparison below.
  }

  return (window.innerHeight || 0) >= (window.innerWidth || 0);
}

function getPhoneLandscapeState() {
  const isPhone = isPhoneDevice();
  const isPortrait = isPortraitViewport();

  return {
    isPhone,
    isPortrait: isPhone && isPortrait,
    isLandscape: !isPhone || !isPortrait,
  };
}

/**
 * Tracks whether the current device is a phone and whether it is currently
 * held in landscape. `isLandscape` is true for every non-phone device so the
 * rest of the app can use it as a simple "allowed" flag.
 */
export function usePhoneLandscape() {
  const [state, setState] = useState(getPhoneLandscapeState);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let orientationQuery = null;

    const update = () => {
      const next = getPhoneLandscapeState();
      setState((previous) => (
        previous.isPhone === next.isPhone
          && previous.isPortrait === next.isPortrait
          && previous.isLandscape === next.isLandscape
          ? previous
          : next
      ));
    };

    update();

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    if (typeof window.matchMedia === 'function') {
      try {
        orientationQuery = window.matchMedia('(orientation: portrait)');
        if (orientationQuery.addEventListener) {
          orientationQuery.addEventListener('change', update);
        } else if (orientationQuery.addListener) {
          orientationQuery.addListener(update);
        }
      } catch {
        orientationQuery = null;
      }
    }

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);

      if (!orientationQuery) return;
      if (orientationQuery.removeEventListener) {
        orientationQuery.removeEventListener('change', update);
      } else if (orientationQuery.removeListener) {
        orientationQuery.removeListener(update);
      }
    };
  }, []);

  return state;
}
