
import React, {
  createContext,
  useState,
} from 'react'
import { darkTheme, lightTheme, type ThemeTokens } from './themeTokens'

export const ThemeContext = createContext<any>(null)

export function ThemeProvider({
  children,
}: any) {
  const [darkMode, setDarkMode] =
    useState(false)

  const theme: ThemeTokens = darkMode
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
