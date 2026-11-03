import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { fetchGameSettings, saveGameSettings } from '../services/settingsApi';
import {
  createDefaultSettings,
  getSettings,
  normaliseSettings,
  saveSettings as persistLocalSettings,
} from '../store/settingsStore';
import { SettingsContext } from './settingsContext';

/**
 * Owns the central game-settings state.
 *
 * localStorage is read synchronously on first render (so audio and the game
 * work offline).  When a NovaUser session is available the backend copy is
 * fetched and becomes the source of truth; saves write locally first and then
 * sync to the account.
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
    if (status !== 'authenticated' || !user?.id) return undefined;

    let cancelled = false;
    setSyncStatus('loading');
    setMessage('');

    fetchGameSettings()
      .then((remote) => {
        if (cancelled || !mounted.current || !remote) return;
        const normalised = normaliseSettings(remote);
        setSettings(normalised);
        setSavedSettings(normalised);
        persistLocalSettings(normalised);
        setSyncStatus('ready');
      })
      .catch((error) => {
        if (cancelled || !mounted.current) return;
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
      let stored = snapshot;
      if (status === 'authenticated') {
        stored = normaliseSettings(await saveGameSettings(snapshot));
        setSettings(stored);
        persistLocalSettings(stored);
      }
      setSavedSettings(stored);
      setSaveStatus('saved');
      setMessage(
        status === 'authenticated'
          ? 'Game settings saved to your account.'
          : 'Game settings saved on this device.',
      );
      return true;
    } catch (error) {
      setSaveStatus('error');
      setMessage(
        error?.message ||
          'Could not save your settings to your account. Your changes are saved on this device.',
      );
      return false;
    }
  }, [settings, status]);

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
