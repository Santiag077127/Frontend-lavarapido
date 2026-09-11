
import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import LandingScreen from '../features/landing/screens/LandingScreen';
import TabNavigator from './TabNavigator';
import OperatorNavigator from './OperatorNavigator';

import ServiceDetailScreen from '../features/services/screens/ServiceDetailScreen';
import ReservationScreen from '../features/reservations/screens/ReservationScreen';
import MyReservationsScreen from '../features/reservations/screens/MyReservationsScreen';

import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';
import VerifyCodeScreen from '../features/auth/screens/VerifyCodeScreen';
import ResetPasswordScreen from '../features/auth/screens/ResetPasswordScreen';
import EditProfileScreen from '../features/auth/screens/EditProfileScreen';

import MyServicesScreen from '../features/profile/screens/MyServicesScreen';
import ServiceDetailsScreen from '../features/profile/screens/ServiceDetailsScreen';

import MapScreen from '../features/map/screens/MapScreen';

import RegisterVehicleScreen from '../features/vehicles/screens/RegisterVehicleScreen';

import type { RootStackParamList } from './types';
import type { UserRole } from '../services/authService';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

type Props = {
  isLoggedIn: boolean;
  setIsLoggedIn: (
    value: boolean
  ) => void;
  role: UserRole | null;
  setRole: (role: UserRole) => void;
};

export default function AppNavigator({
  isLoggedIn,
  setIsLoggedIn,
  role,
  setRole,
}: Props) {
  const isOperator = role === 'OPERATOR';
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isLoggedIn ? (
        <>
          <Stack.Screen
            name="Landing"
            component={LandingScreen}
          />

          <Stack.Screen name="Login">
            {() => (
              <LoginScreen
                setIsLoggedIn={
                  setIsLoggedIn
                }
                setRole={setRole}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Register">
            {() => (
              <RegisterScreen
                setIsLoggedIn={
                  setIsLoggedIn
                }
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="ForgotPassword"
            component={
              ForgotPasswordScreen
            }
          />

          <Stack.Screen
            name="VerifyCode"
            component={
              VerifyCodeScreen
            }
          />

          <Stack.Screen
            name="ResetPassword"
            component={
              ResetPasswordScreen
            }
          />
        </>
      ) : (
        <>
          {isOperator ? (
            <Stack.Screen name="OperatorTabs">
              {() => (
                <OperatorNavigator setIsLoggedIn={setIsLoggedIn} />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="MainTabs">
                {() => (
                  <TabNavigator
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
              <Stack.Screen name="Reservation" component={ReservationScreen} />
              <Stack.Screen name="MyReservations" component={MyReservationsScreen} />
              <Stack.Screen name="RegisterVehicle" component={RegisterVehicleScreen} />
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
              <Stack.Screen name="MyServices" component={MyServicesScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

