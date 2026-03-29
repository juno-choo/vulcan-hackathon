export type ThemeKey = 'style/theme-1' | 'style/theme-2' | 'style/theme-3' | 'style/theme-4' | 'style/theme-5';

type ThemePalette = {
  name: string;
  background: string;
  surface: string;
  surfaceSoft: string;
  card: string;
  border: string;
  primary: string;
  primaryMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  onPrimary: string;
  destructive: string;
  success: string;
  warning: string;
};

const themes: Record<ThemeKey, ThemePalette> = {
  'style/theme-1': {
    name: 'Warm Craft',
    background: '#FBF6EF',
    surface: '#FFF9F1',
    surfaceSoft: '#F4E8D8',
    card: '#FFFDF9',
    border: '#D6BFA7',
    primary: '#A5563B',
    primaryMuted: '#D58963',
    textPrimary: '#3C2518',
    textSecondary: '#6A4A37',
    textMuted: '#8E6F5B',
    onPrimary: '#FFF8F2',
    destructive: '#B23A2E',
    success: '#2E6B4F',
    warning: '#A66C2D',
  },
  'style/theme-2': {
    name: 'Ocean Trust',
    background: '#F3F8FB',
    surface: '#FFFFFF',
    surfaceSoft: '#E4EEF4',
    card: '#FFFFFF',
    border: '#BED1DE',
    primary: '#0D3B66',
    primaryMuted: '#1E5D8E',
    textPrimary: '#0B2239',
    textSecondary: '#264A63',
    textMuted: '#58758B',
    onPrimary: '#F5FBFF',
    destructive: '#B23A48',
    success: '#1D6D5A',
    warning: '#8A6200',
  },
  'style/theme-3': {
    name: 'Forest Workshop',
    background: '#F3F7F1',
    surface: '#FFFFFF',
    surfaceSoft: '#E2ECDD',
    card: '#FCFEFB',
    border: '#B7CCAE',
    primary: '#27543A',
    primaryMuted: '#3E6D50',
    textPrimary: '#1F3125',
    textSecondary: '#365243',
    textMuted: '#5D796A',
    onPrimary: '#F5FFF8',
    destructive: '#9C3D2A',
    success: '#2D7248',
    warning: '#7F6722',
  },
  'style/theme-4': {
    name: 'Classic Slate',
    background: '#F4F6FA',
    surface: '#FFFFFF',
    surfaceSoft: '#E8ECF3',
    card: '#FFFFFF',
    border: '#C7CFDC',
    primary: '#384766',
    primaryMuted: '#4E5E81',
    textPrimary: '#1F2635',
    textSecondary: '#3B465F',
    textMuted: '#6A748A',
    onPrimary: '#F7F9FE',
    destructive: '#A73D52',
    success: '#2F6751',
    warning: '#7A641F',
  },
  'style/theme-5': {
    name: 'Sunset Studio',
    background: '#FFF7EE',
    surface: '#FFFFFF',
    surfaceSoft: '#FFE5D2',
    card: '#FFFDF9',
    border: '#E7C1A0',
    primary: '#C95B34',
    primaryMuted: '#E07A3F',
    textPrimary: '#402417',
    textSecondary: '#72402B',
    textMuted: '#9A6248',
    onPrimary: '#FFF8F3',
    destructive: '#B43D3D',
    success: '#2E6C56',
    warning: '#9A6500',
  },
};

// Change this key to switch app theme branches quickly.
export const ACTIVE_THEME: ThemeKey = 'style/theme-2';

export const theme = themes[ACTIVE_THEME];

export const typeScale = {
  caption: { fontSize: 13, lineHeight: 18 },
  body: { fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontSize: 16, lineHeight: 24 },
  subtitle: { fontSize: 18, lineHeight: 25 },
  title: { fontSize: 22, lineHeight: 30 },
  hero: { fontSize: 30, lineHeight: 38 },
};
