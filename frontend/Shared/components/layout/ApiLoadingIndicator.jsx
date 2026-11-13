import React, { useEffect, useState } from 'react';
import {
  API_ACTIVITY_EVENT,
  getActiveApiRequestCount,
} from '../../services/apiActivity.js';

export default function ApiLoadingIndicator() {
  const [activeRequests, setActiveRequests] = useState(getActiveApiRequestCount);

  useEffect(() => {
    const handleActivity = (event) => {
      setActiveRequests(event.detail?.activeRequests ?? getActiveApiRequestCount());
    };

    window.addEventListener(API_ACTIVITY_EVENT, handleActivity);
    setActiveRequests(getActiveApiRequestCount());
    return () => window.removeEventListener(API_ACTIVITY_EVENT, handleActivity);
  }, []);

  if (activeRequests === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex items-center gap-3 rounded-xl border border-cyan-300/35 bg-[#03101d]/90 px-3.5 py-2.5 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.2)] backdrop-blur-md sm:right-6 sm:top-6"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full border border-cyan-300/25" />
        <span
          className="h-6 w-6 animate-spin rounded-full"
          style={{
            background:
              'repeating-conic-gradient(from 0deg, #39e7f5 0deg 14deg, transparent 14deg 30deg)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
          }}
        />
      </span>
      <span className="flex flex-col">
        <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          NovaQuest · Data Link
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
          Syncing telemetry{activeRequests > 1 ? ` · ${activeRequests} requests` : ''}
        </span>
      </span>
    </div>
  );
}
