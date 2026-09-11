
import React, {
  createContext,
  useState,
} from 'react'

export const ThemeContext = createContext<any>(null)

const lightTheme = {
  // Misma paleta de la interfaz web.
  background: '#f0f4f8',
  card: '#FFFFFF',
  text: '#0d1f4c',
  textSecondary: '#5a6a85',
  border: '#e2e8f0',
  inputBackground: '#FFFFFF',
  placeholder: '#94a3b8',
  errorBackground: '#fff0f0',
  errorText: '#c0392b',
  errorBorder: '#f5c6cb',

  primary: '#1565c0',
  primaryLight: '#38afff',
  primaryDark: '#1a3a8f',
}

const darkTheme = {
  background: '#0d1b3e',
  card: '#16294d',
  text: '#FFFFFF',
  textSecondary: '#cbd5e1',
  border: '#1a3a6e',
  inputBackground: '#16294d',
  placeholder: '#94a3b8',
  errorBackground: '#3b1515',
  errorText: '#fca5a5',
  errorBorder: '#7f1d1d',

  primary: '#38afff',
  primaryLight: '#4fc3f7',
  primaryDark: '#1565c0',
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
