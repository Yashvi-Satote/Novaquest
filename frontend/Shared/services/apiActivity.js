export const API_ACTIVITY_EVENT = 'novaquest:api-activity';

let activeApiRequests = 0;

function notifyApiActivity() {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(
    new window.CustomEvent(API_ACTIVITY_EVENT, {
      detail: { activeRequests: activeApiRequests },
    }),
  );
}

export function getActiveApiRequestCount() {
  return activeApiRequests;
}

export async function trackedFetch(input, init) {
  activeApiRequests += 1;
  notifyApiActivity();
  try {
    return await fetch(input, init);
  } finally {
    activeApiRequests = Math.max(0, activeApiRequests - 1);
    notifyApiActivity();
  }
}
