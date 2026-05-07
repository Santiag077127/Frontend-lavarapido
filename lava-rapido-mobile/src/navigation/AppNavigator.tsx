import React, { useState } from 'react'

import { createNativeStackNavigator } from '@react-navigation/native-stack'

import LandingScreen from '../features/landing/screens/LandingScreen'

import TabNavigator from './TabNavigator'

import ServiceDetailScreen from '../features/services/screens/ServiceDetailScreen'

import LoginScreen from '../features/auth/screens/LoginScreen'

import RegisterScreen from '../features/auth/screens/RegisterScreen'

import ReservationScreen from '../features/reservations/screens/ReservationScreen'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (

    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false
      }}
    >

      {/* 🚀 LANDING */}
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
      />

      {/* 🏠 TABS */}
      <Stack.Screen name="MainTabs">
        {() => (
          <TabNavigator
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Stack.Screen>

      {/* 🚗 DETALLE SERVICIO */}
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
      />

      {/* 📅 RESERVAS */}
      <Stack.Screen
        name="Reservation"
        component={ReservationScreen}
      />

      {/* 🔐 LOGIN */}
      <Stack.Screen name="Login">
        {() => (
          <LoginScreen
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Stack.Screen>

      {/* 📝 REGISTER */}
      <Stack.Screen name="Register">
        {() => (
          <RegisterScreen
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Stack.Screen>

    </Stack.Navigator>

  )
}