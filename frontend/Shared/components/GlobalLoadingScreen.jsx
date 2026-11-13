import React, { useEffect } from 'react';

const dots = [
  [20, 4, 2.2, 1],
  [28, 6.1, 2.1, 0.92],
  [33.9, 12, 2, 0.84],
  [36, 20, 1.9, 0.76],
  [33.9, 28, 1.8, 0.68],
  [28, 33.9, 1.7, 0.6],
  [20, 36, 1.6, 0.52],
  [12, 33.9, 1.5, 0.44],
  [6.1, 28, 1.4, 0.36],
  [4, 20, 1.3, 0.28],
  [6.1, 12, 1.2, 0.2],
  [12, 6.1, 1.1, 0.12],
];

export default function GlobalLoadingScreen() {
  return (
    <div
      className="global-loading-screen"
      role="status"
      aria-live="polite"
      aria-label="Loading NovaQuest"
    >
      <div className="global-loading-content">
        <svg
          aria-hidden="true"
          viewBox="0 0 40 40"
          className="global-loading-spinner"
        >
          {dots.map(([cx, cy, radius, opacity]) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={radius}
              fill="#14d7df"
              opacity={opacity}
            />
          ))}
        </svg>
        <span className="global-loading-label">Preparing mission control</span>
      </div>
    </div>
  );
}

export function DismissStartupLoader() {
  useEffect(() => {
    const startupLoader = document.getElementById('app-loading-screen');
    if (!startupLoader) return undefined;

    startupLoader.classList.add('app-loading-screen-hidden');
    const timeoutId = window.setTimeout(() => startupLoader.remove(), 200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
