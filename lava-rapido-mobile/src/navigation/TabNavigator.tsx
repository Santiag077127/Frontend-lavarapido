import React, {
  useContext,
} from 'react'

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'

import {
  Ionicons,
} from '@expo/vector-icons'

import HomeScreen from '../features/home/screens/HomeScreen'

import ProfileScreen from '../features/profile/screens/ProfileScreen'

import MapScreen from '../features/map/screens/MapScreen'

import MyReservationsScreen from '../features/reservations/screens/MyReservationsScreen'

import MyServicesScreen from '../features/profile/screens/MyServicesScreen'

import {
  ThemeContext,
} from '../theme/ThemeContext'

const Tab =
  createBottomTabNavigator()

type Props = {
  isLoggedIn: boolean
  setIsLoggedIn: (
    value: boolean
  ) => void
}

export default function TabNavigator({
  isLoggedIn,
  setIsLoggedIn,
}: Props) {

  const {
    theme,
    darkMode,
  } = useContext(
    ThemeContext
  )

  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }) => ({

        headerShown: false,

        tabBarStyle: {
          backgroundColor:
            theme.card,

          borderTopColor:
            theme.border,

          height: 60,

          paddingBottom: 5,
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },

        tabBarIcon: ({
          color,
          size,
        }) => {

          let iconName:
            | 'home'
            | 'calendar'
            | 'receipt'
            | 'map'
            | 'person' =
            'home'

          if (
            route.name ===
            'Home'
          ) {
            iconName = 'home'
          }

          else if (
            route.name ===
            'Reservas'
          ) {
            iconName = 'calendar'
          }

          else if (
            route.name ===
            'Mis servicios'
          ) {
            iconName = 'receipt'
          }

          else if (
            route.name ===
            'Mapa'
          ) {
            iconName = 'map'
          }

          else if (
            route.name ===
            'Perfil'
          ) {
            iconName = 'person'
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          )
        },

        tabBarActiveTintColor:
          theme.primary,

        tabBarInactiveTintColor:
          theme.textSecondary,
      })}
    >

      {/* 🏠 HOME */}
      <Tab.Screen name="Home">
        {() => (
          <HomeScreen
          />
        )}
      </Tab.Screen>

      {/* 🗺️ MAPA */}
      <Tab.Screen
        name="Reservas"
        component={
          MyReservationsScreen
        }
      />

      <Tab.Screen
        name="Mis servicios"
        component={
          MyServicesScreen
        }
      />

      <Tab.Screen
        name="Mapa"
        component={
          MapScreen
        }
      />

      {/* 👤 PERFIL */}
      <Tab.Screen name="Perfil">
        {() => (
          <ProfileScreen
            setIsLoggedIn={
              setIsLoggedIn
            }
          />
        )}
      </Tab.Screen>

    </Tab.Navigator>
  )
}

