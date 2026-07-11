import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import {
  darkColors,
  lightColors,
  type AppThemeColors,
  type AppThemeName,
} from './theme/colors';

const themeStorageKey = 'gymbro-app-theme';

type AppThemeContextValue = {
  colors: AppThemeColors;
  themeName: AppThemeName;
  setThemeName: (themeName: AppThemeName) => void;
};

const AppThemeContext = createContext<AppThemeContextValue>({
  colors: lightColors,
  themeName: 'light',
  setThemeName: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<AppThemeName>('light');

  useEffect(() => {
    let isMounted = true;

    async function restoreTheme() {
      try {
        const savedThemeName = await AsyncStorage.getItem(themeStorageKey);

        if (isMounted && savedThemeName === 'dark') {
          setThemeNameState('dark');
        }
      } catch {
        // Keep the light default when local storage is unavailable.
      }
    }

    void restoreTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeName = useCallback((nextThemeName: AppThemeName) => {
    setThemeNameState(nextThemeName);
    void AsyncStorage.setItem(themeStorageKey, nextThemeName);
  }, []);
  const colors = themeName === 'dark' ? darkColors : lightColors;
  const value = useMemo(
    () => ({ colors, setThemeName, themeName }),
    [colors, setThemeName, themeName],
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}

export function useAppStyles<T>(createStyles: (colors: AppThemeColors) => T) {
  const { colors } = useAppTheme();

  return useMemo(() => createStyles(colors), [colors, createStyles]);
}
