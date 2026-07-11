export type AppThemeName = 'light' | 'dark';

export type AppThemeColors = {
  background: string;
  appBackground: string;
  userSelectBackground: string;
  panel: string;
  surface: string;
  subtleBackground: string;
  text: string;
  muted: string;
  border: string;
  active: string;
  activeText: string;
  activeBorder: string;
  primary: string;
  destructive: string;
  errorBackground: string;
  destructiveBorder: string;
  warning: string;
  warningBackground: string;
  warningBorder: string;
  chartMuted: string;
};

export const lightColors: AppThemeColors = {
  background: '#F7F8FA',
  appBackground: '#EEF7FF',
  userSelectBackground: '#F7F8FA',
  panel: '#FFFFFF',
  surface: '#FBFDFB',
  subtleBackground: '#F1F5F9',
  text: '#172033',
  muted: '#6B7280',
  border: '#D7DCE7',
  active: '#EAF7F0',
  activeText: '#1F7A4D',
  activeBorder: '#B7D8C5',
  primary: '#1F7A4D',
  destructive: '#C94B4B',
  errorBackground: '#FEF3F2',
  destructiveBorder: '#C94B4B',
  warning: '#D97706',
  warningBackground: '#FFFBEB',
  warningBorder: '#FBBF24',
  chartMuted: '#A7C7B7',
};

export const darkColors: AppThemeColors = {
  background: '#121714',
  appBackground: '#161F1A',
  userSelectBackground: '#121714',
  panel: '#1B2420',
  surface: '#202B25',
  subtleBackground: '#27312B',
  text: '#F3F7F2',
  muted: '#B5C0B8',
  border: '#3A473F',
  active: '#1D3A2A',
  activeText: '#7AD69A',
  activeBorder: '#3D7654',
  primary: '#56B97B',
  destructive: '#FF8585',
  errorBackground: '#4A2525',
  destructiveBorder: '#B85555',
  warning: '#F4BD63',
  warningBackground: '#4A381B',
  warningBorder: '#9B7130',
  chartMuted: '#5B806B',
};

// Kept for non-UI code and existing tests that use the default palette.
export const colors = lightColors;
