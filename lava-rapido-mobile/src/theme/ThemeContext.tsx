
import React, {
  createContext,
  useState,
} from 'react'

export const ThemeContext = createContext<any>(null)

const lightTheme = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  elevatedCard: '#FFFFFF',
  interactiveSurface: '#EFF6FF',
  primaryContainer: '#EFF6FF',
  onPrimary: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  inputBackground: '#FFFFFF',
  placeholder: '#64748B',
  errorBackground: '#DC262612',
  errorText: '#DC2626',
  errorBorder: '#DC26264D',
  errorAction: '#DC2626',
  errorOnAction: '#FFFFFF',
  successBackground: '#16A34A12',
  successText: '#15803D',
  successBorder: '#16A34A4D',
  warningBackground: '#D9770612',
  warningText: '#B45309',
  warningBorder: '#D977064D',
  infoBackground: '#EFF6FF',
  infoText: '#2563EB',
  infoBorder: '#2563EB4D',
  icon: '#64748B',
  disabled: '#94A3B8',

  primary: '#2563EB',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  primarySoft: '#EFF6FF',
  accent: '#06B6D4',
  accentText: '#0E7490',
  processBackground: '#06B6D412',
  success: '#16A34A',
  warning: '#D97706',
  inProgress: '#06B6D4',
  inProgressText: '#0E7490',
  overlay: 'rgba(15, 23, 42, 0.55)',
  shadow: '#000000',
}

const darkTheme = {
  background: '#0B1220',
  surface: '#111B2E',
  card: '#111B2E',
  elevatedCard: '#111B2E',
  interactiveSurface: '#60A5FA24',
  primaryContainer: '#60A5FA24',
  onPrimary: '#0B1220',
  text: '#F8FAFC',
  textSecondary: '#A8B3C5',
  border: '#26354D',
  inputBackground: '#111B2E',
  placeholder: '#A8B3C5',
  errorBackground: '#DC262624',
  errorText: '#F87171',
  errorBorder: '#F8717166',
  errorAction: '#F87171',
  errorOnAction: '#0B1220',
  successBackground: '#16A34A24',
  successText: '#4ADE80',
  successBorder: '#4ADE8066',
  warningBackground: '#D9770624',
  warningText: '#FBBF24',
  warningBorder: '#FBBF2466',
  infoBackground: '#60A5FA24',
  infoText: '#60A5FA',
  infoBorder: '#60A5FA66',
  icon: '#A8B3C5',
  disabled: '#64748B',

  primary: '#60A5FA',
  primaryLight: '#93C5FD',
  primaryDark: '#60A5FA',
  primarySoft: '#60A5FA24',
  accent: '#22D3EE',
  accentText: '#67E8F9',
  processBackground: '#22D3EE24',
  success: '#4ADE80',
  warning: '#FBBF24',
  inProgress: '#22D3EE',
  inProgressText: '#67E8F9',
  overlay: 'rgba(11, 18, 32, 0.78)',
  shadow: '#000000',
}

export function ThemeProvider({
  children,
}: any) {
  const [darkMode, setDarkMode] =
    useState(false)

  const theme = darkMode
    ? darkTheme
    : lightTheme

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
