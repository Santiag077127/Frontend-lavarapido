import React, { useContext } from 'react'

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { useNavigation } from '@react-navigation/native'

import { ThemeContext } from '../../../theme/ThemeContext'

type Props = {
  setIsLoggedIn: (value: boolean) => void
}

export default function ProfileScreen({ setIsLoggedIn }: Props) {

  const navigation = useNavigation<any>()

  const { darkMode, setDarkMode, theme } =
    useContext(ThemeContext)

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background
        }
      ]}
    >

      {/* HEADER */}
      <View style={styles.header}>

        <View
          style={[
            styles.avatar,
            {
              backgroundColor: theme.primary
            }
          ]}
        >

          <Ionicons
            name="person"
            size={55}
            color="#fff"
          />

        </View>

        <Text
          style={[
            styles.name,
            {
              color: theme.text
            }
          ]}
        >
          Santiago Gordo
        </Text>

        <Text
          style={[
            styles.email,
            {
              color: darkMode
                ? '#BBBBBB'
                : '#666'
            }
          ]}
        >
          santiagogordoperez77@gmail.com
        </Text>

      </View>

      {/* MENU */}
      <View
        style={[
          styles.menu,
          {
            backgroundColor: theme.card
          }
        ]}
      >

        {/* PERFIL */}
        <TouchableOpacity style={styles.item}>

          <View style={styles.left}>

            <Ionicons
              name="person-outline"
              size={22}
              color={theme.text}
            />

            <Text
              style={[
                styles.text,
                {
                  color: theme.text
                }
              ]}
            >
              Mi perfil
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />

        </TouchableOpacity>

        {/* MIS SERVICIOS */}
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate('MyServices')
          }
        >

          <View style={styles.left}>

            <Ionicons
              name="car-outline"
              size={22}
              color={theme.text}
            />

            <Text
              style={[
                styles.text,
                {
                  color: theme.text
                }
              ]}
            >
              Mis servicios
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />

        </TouchableOpacity>

        {/* CONFIG */}
        <TouchableOpacity style={styles.item}>

          <View style={styles.left}>

            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.text}
            />

            <Text
              style={[
                styles.text,
                {
                  color: theme.text
                }
              ]}
            >
              Configuración
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />

        </TouchableOpacity>

        {/* DARK MODE */}
        <View style={styles.themeItem}>

          <View style={styles.left}>

            <Ionicons
              name={
                darkMode
                  ? 'moon'
                  : 'sunny'
              }
              size={22}
              color={theme.text}
            />

            <Text
              style={[
                styles.text,
                {
                  color: theme.text
                }
              ]}
            >
              {darkMode
                ? 'Modo Oscuro'
                : 'Modo Claro'}
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
    marginTop: 55,
    marginBottom: 35,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 15,

    borderWidth: 3,
    borderColor: '#fff',

    elevation: 5,
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  email: {
    fontSize: 15,
    marginTop: 6,
  },

  menu: {
    borderRadius: 22,
    paddingVertical: 5,

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 18,
    paddingHorizontal: 18,

    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    marginLeft: 14,
    fontSize: 16,
    fontWeight: '500',
  },

  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: 18,
    paddingHorizontal: 18,
  },

  logout: {
    marginTop: 35,

    backgroundColor: '#E74C3C',

    height: 58,
    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',

    elevation: 4,

    shadowColor: '#E74C3C',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },

})