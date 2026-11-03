import { useEffect } from 'react';
import { useAuth } from './authContext';
import { AUTH_STATUS } from '../services/authSession';
import { syncProgressWithAccount } from '../../NovaQuest/game/progressRepository';

/**
 * Bridges auth state to the game-progress repository once per signed-in user.
 * Renders nothing and never blocks the application.
 */
export default function ProgressSync() {
  const { status, user } = useAuth();

  useEffect(() => {
    if (status !== AUTH_STATUS.AUTHENTICATED || !user?.id) return undefined;
    syncProgressWithAccount().catch(() => {
      // Progress sync is an optional extra; local progress remains usable.
    });
    return undefined;
  }, [status, user?.id]);

  return null;
}
