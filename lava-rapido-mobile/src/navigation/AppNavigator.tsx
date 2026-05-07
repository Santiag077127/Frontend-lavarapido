import React, { useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import TabNavigator from './TabNavigator'
import ServiceDetailScreen from '../features/services/screens/ServiceDetailScreen'
import LoginScreen from '../features/auth/screens/LoginScreen'
import RegisterScreen from '../features/auth/screens/RegisterScreen'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* 🔥 SIEMPRE INICIA EN HOME */}
      <Stack.Screen name="MainTabs">
        {() => (
          <TabNavigator 
            isLoggedIn={isLoggedIn} 
            setIsLoggedIn={setIsLoggedIn} 
          />
        )}
      </Stack.Screen>

      {/* 🔥 DETALLE SERVICIO */}
      <Stack.Screen 
        name="ServiceDetail" 
        component={ServiceDetailScreen} 
      />

      {/* 🔥 LOGIN */}
      <Stack.Screen name="Login">
        {() => <LoginScreen setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>

      {/* 🔥 REGISTER */}
      <Stack.Screen name="Register">
        {() => <RegisterScreen setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>

    </Stack.Navigator>
  )
}