import React, { useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { ThemeContext } from '../../../theme/ThemeContext'

type Props = {
  setIsLoggedIn: (value: boolean) => void
}

export default function ProfileScreen({ setIsLoggedIn }: Props) {

  const { darkMode, setDarkMode, theme } = useContext(ThemeContext)

  return (

    <View
      style={[
        styles.container,
        { backgroundColor: theme.background }
      ]}
    >

      {/* HEADER */}
      <View style={styles.header}>

        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.primary }
          ]}
        >
          <Ionicons name="person" size={55} color="#fff" />
        </View>

        <Text
          style={[
            styles.name,
            { color: theme.text }
          ]}
        >
          Santiago Gordo
        </Text>

        <Text
          style={[
            styles.email,
            { color: darkMode ? '#BBBBBB' : '#555' }
          ]}
        >
          santiagogordoperez77@gmail.com
        </Text>

      </View>

      {/* MENÚ */}
      <View
        style={[
          styles.menu,
          { backgroundColor: theme.card }
        ]}
      >

        <TouchableOpacity style={styles.item}>
          <Ionicons
            name="person-outline"
            size={22}
            color={theme.text}
          />

          <Text
            style={[
              styles.text,
              { color: theme.text }
            ]}
          >
            Mi perfil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Ionicons
            name="car-outline"
            size={22}
            color={theme.text}
          />

          <Text
            style={[
              styles.text,
              { color: theme.text }
            ]}
          >
            Mis servicios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Ionicons
            name="settings-outline"
            size={22}
            color={theme.text}
          />

          <Text
            style={[
              styles.text,
              { color: theme.text }
            ]}
          >
            Configuración
          </Text>
        </TouchableOpacity>

        {/* 🌙 DARK MODE */}
        <View style={styles.themeItem}>

          <View style={styles.themeLeft}>
            <Ionicons
              name={darkMode ? 'moon' : 'sunny'}
              size={22}
              color={theme.text}
            />

            <Text
              style={[
                styles.text,
                { color: theme.text }
              ]}
            >
              {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
            </Text>
          </View>

          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />

        </View>

      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logout}
        onPress={() => setIsLoggedIn(false)}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#fff"
        />

        <Text style={styles.logoutText}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 30,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  email: {
    fontSize: 16,
    marginTop: 5,
  },

  menu: {
    borderRadius: 15,
    padding: 10,
    width: '100%',
    elevation: 3,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },

  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    marginLeft: 12,
    fontSize: 16,
  },

  logout: {
    marginTop: 30,
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  /* boton de cambio de tema */
  themeItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 15,
  borderBottomWidth: 0.5,
  borderColor: '#ccc',
},

})