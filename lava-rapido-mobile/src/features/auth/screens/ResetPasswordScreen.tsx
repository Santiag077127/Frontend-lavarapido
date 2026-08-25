import React, { useState, useContext } from 'react'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { ThemeContext } from '../../../theme/ThemeContext'
import { images } from '../../../assets/images'

export default function ResetPasswordScreen({ navigation }: any) {

  const { theme } = useContext(ThemeContext)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleReset = () => {

    if (!password || !confirmPassword) {

      Alert.alert(
        'Campos incompletos',
        'Debes completar todos los campos'
      )

      return
    }

    if (password !== confirmPassword) {

      Alert.alert(
        'Error',
        'Las contraseñas no coinciden'
      )

      return
    }

    Alert.alert(
      'Éxito',
      'Contraseña actualizada correctamente'
    )

    navigation.navigate('Login')
  }

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background
        }
      ]}
    >

      {/* LOGO */}
      <Image
        source={images.logo}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* TITULO */}
      <Text
        style={[
          styles.title,
          {
            color: theme.text
          }
        ]}
      >
        Nueva Contraseña
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: theme.textSecondary
          }
        ]}
      >
        Ingresa tu nueva contraseña para continuar.
      </Text>

      {/* NUEVA CONTRASEÑA */}
      <View style={styles.inputContainer}>

        <Ionicons
          name="lock-closed-outline"
          size={22}
          color="#1E6FB9"
        />

        <TextInput
          placeholder="Nueva contraseña"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={() =>
            setShowPassword(!showPassword)
          }
        >
          <Ionicons
            name={
              showPassword
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            size={22}
            color="#94A3B8"
          />
        </TouchableOpacity>

      </View>

      {/* CONFIRMAR CONTRASEÑA */}
      <View style={styles.inputContainer}>

        <Ionicons
          name="shield-checkmark-outline"
          size={22}
          color="#1E6FB9"
        />

        <TextInput
          placeholder="Confirmar contraseña"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
        >
          <Ionicons
            name={
              showConfirmPassword
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            size={22}
            color="#94A3B8"
          />
        </TouchableOpacity>

      </View>

      {/* BOTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleReset}
      >

        <Text style={styles.buttonText}>
          Guardar Contraseña
        </Text>

      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  logo: {
    width: 300,
    height: 260,
    alignSelf: 'center',
    marginBottom: -20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 22,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    height: 70,

    borderRadius: 20,

    paddingHorizontal: 20,

    marginBottom: 18,

    borderWidth: 1.5,
    borderColor: '#D6E4F0',

    elevation: 2,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },

  button: {
    backgroundColor: '#1E6FB9',

    height: 60,

    borderRadius: 18,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 10,

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

})