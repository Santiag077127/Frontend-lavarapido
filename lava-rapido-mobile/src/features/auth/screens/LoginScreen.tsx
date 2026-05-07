import React, { useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native'

import {
  Ionicons,
  MaterialIcons
} from '@expo/vector-icons'

import { useNavigation } from '@react-navigation/native'
import { ThemeContext } from '../../../theme/ThemeContext'

export default function LoginScreen({ setIsLoggedIn }: any) {

  const navigation = useNavigation<any>()

  const { theme, darkMode } = useContext(ThemeContext)

  return (

    <View
      style={[
        styles.container,
        { backgroundColor: theme.background }
      ]}
    >

      {/* 🔥 LOGO */}
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
      />

      {/* 📧 INPUT CORREO */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.card }
        ]}
      >

        <MaterialIcons
          name="email"
          size={20}
          color={darkMode ? '#fff' : '#555'}
        />

        <TextInput
          placeholder="Correo"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            { color: theme.text }
          ]}
        />

      </View>

      {/* 🔒 INPUT PASSWORD */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.card }
        ]}
      >

        <Ionicons
          name="lock-closed"
          size={20}
          color={darkMode ? '#fff' : '#555'}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          style={[
            styles.input,
            { color: theme.text }
          ]}
        />

      </View>

      {/* 🔥 BOTÓN LOGIN */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setIsLoggedIn(true)
          navigation.replace('MainTabs')
        }}
      >

        <Text style={styles.buttonText}>
          Iniciar Sesión
        </Text>

      </TouchableOpacity>

      {/* 🔗 LINKS */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
      >
        <Text
          style={[
            styles.link,
            { color: theme.text }
          ]}
        >
          Registrarse
        </Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text
          style={[
            styles.link,
            { color: theme.text }
          ]}
        >
          Recuperar Contraseña
        </Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
    borderRadius: 20,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    width: '100%',
    marginBottom: 15,

    elevation: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#1E5AA8',
    width: '100%',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3
    },

    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  link: {
    textDecorationLine: 'underline',
    marginTop: 8,
    fontSize: 14,
  },

})