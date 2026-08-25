import React, { useContext } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import HomeScreen from '../features/home/screens/HomeScreen'
import ProfileScreen from '../features/profile/screens/ProfileScreen'
import { ThemeContext } from '../theme/ThemeContext'
import MapScreen from '../features/map/screens/MapScreen'
const Tab = createBottomTabNavigator()

export default function TabNavigator({
  isLoggedIn,
  setIsLoggedIn
}: any) {

  const { theme, darkMode } = useContext(ThemeContext)

  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({

        headerShown: false,

        /* 🎨 TAB BAR */
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: darkMode ? '#222' : '#ddd',
          height: 60,
          paddingBottom: 5,
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },

        /* 🔥 ICONOS */
        tabBarIcon: ({ color, size }) => {

          let iconName: any

          if (route.name === 'Home')
            iconName = 'home'

          else if (route.name === 'Mapa')
            iconName = 'map'

          else if (route.name === 'Perfil')
            iconName = 'person'

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          )
        },

        /* 🎨 COLORES */
        tabBarActiveTintColor: '#1E6FB9',

        tabBarInactiveTintColor: darkMode
          ? '#BDBDBD'
          : 'gray',

      })}
    >

      {/* 🏠 HOME */}
      <Tab.Screen name="Home">
        {() => (
          <HomeScreen
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Tab.Screen>

      {/* 🗺️ MAPA */}
      <Tab.Screen
        name="Mapa"
        component={MapScreen}
      />

      {/* 👤 PERFIL */}
      <Tab.Screen name="Perfil">
        {() => (
          <ProfileScreen
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Tab.Screen>

    </Tab.Navigator>
  )
}