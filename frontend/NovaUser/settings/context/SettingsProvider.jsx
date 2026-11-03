import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { AUTH_STATUS } from '../../services/authSession';
import { loadSettingsSnapshot, persistSettingsSnapshot } from '../services/settingsRepository';
import {
  createDefaultSettings,
  getSettings,
  normaliseSettings,
  readStoredSettings,
  saveSettings as persistLocalSettings,
} from '../store/settingsStore';
import { SettingsContext } from './settingsContext';

/**
 * Owns the central game-settings state.
 *
 * The repository picks the source: localStorage for guests, the account API
 * for signed-in users. local is always written first so the game remains fully
 * usable offline.
 */
export function SettingsProvider({ children }) {
  const { status, user } = useAuth();
  const [settings, setSettings] = useState(() => getSettings());
  const [savedSettings, setSavedSettings] = useState(() => getSettings());
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | loading | ready | error
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [message, setMessage] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (status === AUTH_STATUS.LOADING) return undefined;

    if (status !== AUTH_STATUS.AUTHENTICATED || !user?.id) {
      const local = readStoredSettings();
      setSettings(local);
      setSavedSettings(local);
      setSyncStatus('idle');
      setSaveStatus('idle');
      setMessage('');
      return undefined;
    }

    let cancelled = false;
    setSyncStatus('loading');
    setMessage('');

    loadSettingsSnapshot()
      .then((snapshot) => {
        if (cancelled || !mounted.current) return;
        setSettings(snapshot.settings);
        setSavedSettings(snapshot.savedSettings);
        setSyncStatus('ready');
        setMessage(snapshot.notice || '');
      })
      .catch((error) => {
        if (cancelled || !mounted.current) return;
        const local = readStoredSettings();
        setSettings(local);
        setSavedSettings(local);
        setSyncStatus('error');
        setMessage(
          error?.status === 401
            ? 'Your session expired. Showing settings saved on this device.'
            : 'Could not sync with your account. Showing settings saved on this device.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [status, user?.id]);

  /**
   * Update one setting, persist the local fallback immediately and return the
   * normalised snapshot so callers can apply it to the audio engine.
   */
  const updateSetting = useCallback(
    (section, key, value) => {
      const next = normaliseSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [key]: value,
        },
      });
      setSettings(next);
      persistLocalSettings(next);
      setSaveStatus('idle');
      setMessage('');
      return next;
    },
    [settings],
  );

  const save = useCallback(async () => {
    const snapshot = normaliseSettings(settings);
    persistLocalSettings(snapshot);
    setSaveStatus('saving');
    setMessage('');

    try {
      const result = await persistSettingsSnapshot(snapshot);
      if (!mounted.current) return true;
      setSettings(result.settings);
      setSavedSettings(result.settings);
      setSaveStatus('saved');
      setMessage(result.notice);
      return true;
    } catch (error) {
      if (!mounted.current) return false;
      setSaveStatus('error');
      setMessage(
        error?.message ||
          'Could not save your settings to your account. Your changes are saved on this device.',
      );
      return false;
    }
  }, [settings]);

  const resetDefaults = useCallback(() => {
    const defaults = createDefaultSettings();
    setSettings(defaults);
    persistLocalSettings(defaults);
    setSaveStatus('idle');
    setMessage('Defaults restored. Save to apply them to your account.');
    return defaults;
  }, []);

  const discardChanges = useCallback(() => {
    setSettings(savedSettings);
    persistLocalSettings(savedSettings);
    setSaveStatus('idle');
    setMessage('Unsaved changes discarded.');
  }, [savedSettings]);

  const value = useMemo(
    () => ({
      settings,
      savedSettings,
      syncStatus,
      saveStatus,
      message,
      updateSetting,
      save,
      resetDefaults,
      discardChanges,
    }),
    [
      settings,
      savedSettings,
      syncStatus,
      saveStatus,
      message,
      updateSetting,
      save,
      resetDefaults,
      discardChanges,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
