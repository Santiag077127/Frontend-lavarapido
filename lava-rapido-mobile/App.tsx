import { NavigationContainer } from '@react-navigation/native'
import { useState } from 'react'
import AppNavigator from './src/navigation/AppNavigator'
import { ThemeProvider } from './src/theme/ThemeContext'

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <ThemeProvider> 
      <NavigationContainer>
        <AppNavigator 
          isLoggedIn={isLoggedIn} 
          setIsLoggedIn={setIsLoggedIn} 
        />
      </NavigationContainer>
    </ThemeProvider>
    
  )
}