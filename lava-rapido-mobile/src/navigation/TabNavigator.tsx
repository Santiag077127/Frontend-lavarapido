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

import MyServicesScreen from '../features/profile/screens/MyServicesScreen'
import NotificationsScreen from '../features/notifications/screens/NotificationsScreen'

import {
  ThemeContext,
} from '../theme/ThemeContext'
import { useTranslation } from 'react-i18next'
import type { MainTabParamList } from './types'
import NotificationTabIcon from '../components/notifications/NotificationTabIcon'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'

const Tab =
  createBottomTabNavigator<MainTabParamList>()

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

  const { i18n } = useTranslation()
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, right: 0, bottom: 0, left: 0 }
  const bottomInset = Math.max(0, insets.bottom)
  const language = i18n.resolvedLanguage || i18n.language || 'es'
  const labels: Record<string, Record<string, string>> = {
    es: { Home: 'Inicio', 'Mis servicios': 'Reservas', Mapa: 'Mapa', Perfil: 'Perfil', Notificaciones: 'Avisos' },
    en: { Home: 'Home', 'Mis servicios': 'Reservations', Mapa: 'Map', Perfil: 'Profile', Notificaciones: 'Alerts' },
    pt: { Home: 'Inicio', 'Mis servicios': 'Reservas', Mapa: 'Mapa', Perfil: 'Perfil', Notificaciones: 'Avisos' },
    fr: { Home: 'Accueil', 'Mis servicios': 'Réservations', Mapa: 'Carte', Perfil: 'Profil', Notificaciones: 'Alertes' },
  }
  const tabLabels = labels[language] || labels.es

  return (
    <Tab.Navigator
      // Expo Go on Android can keep a detached native tab surface in the
      // compositor. Keep tab state mounted, but render inactive tabs through
      // React Native's display:none fallback so a previous scene cannot bleed
      // through the focused one.
      detachInactiveScreens={false}
      sceneContainerStyle={{
        backgroundColor: theme.background,
      }}
      screenOptions={({
        route,
      }) => ({

        headerShown: false,

        tabBarStyle: {
          backgroundColor:
            theme.tabBarBackground,

          borderTopColor:
            theme.divider,

          // The explicit height includes the Android three-button navigation inset.
          // Keeping it in the bar prevents the last row from being covered without
          // adding a large, fixed bottom padding to every screen.
          height: 60 + bottomInset,
          paddingBottom: bottomInset > 0 ? bottomInset : 5,
          paddingTop: 5,
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },

        tabBarLabel:
          tabLabels[route.name] ||
          route.name,

        tabBarIcon: ({
          color,
          size,
        }) => {

          let iconName:
            | 'home'
            | 'receipt'
            | 'map'
            | 'person'
            | 'notifications' =
            'home'

          if (
            route.name ===
            'Home'
          ) {
            iconName = 'home'
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
            'Notificaciones'
          ) { iconName = 'notifications' }

          else if (
            route.name ===
            'Perfil'
          ) {
            iconName = 'person'
          }

          if (route.name === 'Notificaciones') {
            return <NotificationTabIcon color={color} size={size} />
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },

        tabBarActiveTintColor:
          theme.primary,

        tabBarInactiveTintColor:
          theme.textSecondary,
      })}
    >

      {/* 🏠 HOME */}
      <Tab.Screen
        name="Home"
        // The Home scene is the one observed bleeding into other tabs in
        // Expo Go. BottomTabView removes screens with this option before it
        // creates a native/React scene, rather than only hiding the surface.
        options={{ unmountOnBlur: true }}
      >
        {() => (
          <HomeScreen
          />
        )}
      </Tab.Screen>

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
      <Tab.Screen name="Notificaciones" component={NotificationsScreen} />
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
