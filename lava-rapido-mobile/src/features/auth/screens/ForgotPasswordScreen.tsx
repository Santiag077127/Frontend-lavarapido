import React, { useState, useContext } from 'react'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemeContext } from '../../../theme/ThemeContext'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'

export default function ForgotPasswordScreen({ navigation }: any) {

  const { theme } = useContext(ThemeContext)

  const [email, setEmail] = useState('')

  const handleSendCode = () => {

    if (!email.trim()) {

      Alert.alert(
        'Error',
        'Ingrese un correo electrónico'
      )

      return
    }

    navigation.navigate('VerifyCode', {
      email,
    })
  }

  return (

    <SafeAreaView
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
        Recuperar Contraseña
      </Text>

      {/* SUBTITULO */}
      <Text
        style={[
          styles.subtitle,
          {
            color: theme.textSecondary
          }
        ]}
      >
        Ingresa tu correo electrónico para recibir un código de verificación.
      </Text>

      {/* INPUT */}
      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#8A8A8A"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {/* BOTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendCode}
      >
        <Text style={styles.buttonText}>
          Enviar Código
        </Text>
      </TouchableOpacity>

      {/* VOLVER */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>
          Volver al inicio de sesión
        </Text>
      </TouchableOpacity>

    </SafeAreaView>

  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  /* LOGO MÁS GRANDE */
  logo: {
    width: 300,
    height: 260,
    alignSelf: 'center',
    marginBottom: -20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  input: {
    height: 65,

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    paddingHorizontal: 20,

    fontSize: 16,

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  button: {
    height: 65,

    backgroundColor: '#1E6FB9',

    borderRadius: 20,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 25,

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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  backText: {
    textAlign: 'center',
    marginTop: 25,

    color: '#1E6FB9',

    fontSize: 15,
    fontWeight: '600',
  },

})
