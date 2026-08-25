import React, { createContext, useState } from 'react'

export const ThemeContext = createContext<any>(null)

const lightTheme = {
  background: '#BFD0DB',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#555555',
}

const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#D6D6D6',
}

export function ThemeProvider({ children }: any) {

  const [darkMode, setDarkMode] = useState(false)

  const theme = darkMode ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        theme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}