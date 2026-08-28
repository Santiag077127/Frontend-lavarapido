import React from 'react'

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack'

import LandingScreen from '../features/landing/screens/LandingScreen'

import TabNavigator from './TabNavigator'

import ServiceDetailScreen from '../features/services/screens/ServiceDetailScreen'
import ReservationScreen from '../features/reservations/screens/ReservationScreen'

import LoginScreen from '../features/auth/screens/LoginScreen'
import RegisterScreen from '../features/auth/screens/RegisterScreen'

import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen'
import VerifyCodeScreen from '../features/auth/screens/VerifyCodeScreen'
import ResetPasswordScreen from '../features/auth/screens/ResetPasswordScreen'

import MyServicesScreen from '../features/profile/screens/MyServicesScreen'

import MapScreen from '../features/map/screens/MapScreen'

import ServiceDetailsScreen from '../features/profile/screens/ServiceDetailsScreen'

import EditProfileScreen from '../features/auth/screens/EditProfileScreen'

const Stack = createNativeStackNavigator()

type Props = {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function AppNavigator({
  isLoggedIn,
  setIsLoggedIn,
}: Props) {

  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
      }}
    >

      <Stack.Screen
        name="Landing"
        component={LandingScreen}
      />

      <Stack.Screen name="MainTabs">
        {() => (
          <TabNavigator
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
      />

      <Stack.Screen
        name="Reservation"
        component={ReservationScreen}
      />

      <Stack.Screen
        name="Map"
        component={MapScreen}
      />

      <Stack.Screen
        name="ServiceDetails"
        component={ServiceDetailsScreen}
      />

      <Stack.Screen
        name="MyServices"
        component={MyServicesScreen}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />

      <Stack.Screen name="Login">
        {() => (
          <LoginScreen
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Register">
        {() => (
          <RegisterScreen
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />

      <Stack.Screen
        name="VerifyCode"
        component={VerifyCodeScreen}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
      />

    </Stack.Navigator>
  )
}