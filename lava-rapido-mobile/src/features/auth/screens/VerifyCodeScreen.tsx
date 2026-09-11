import React, { useState, useContext } from 'react'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { ThemeContext } from '../../../theme/ThemeContext'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'

export default function VerifyCodeScreen({ navigation }: any) {

  const { theme } = useContext(ThemeContext)

  const [code, setCode] = useState('')

  const handleVerify = () => {

    if (code.length < 6) {

      Alert.alert(
        'Código inválido',
        'Ingresa el código de 6 dígitos'
      )

      return
    }

    navigation.navigate('ResetPassword')
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
        Verificar Código
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
        Ingresa el código enviado a tu correo electrónico.
      </Text>

      {/* INPUT */}
      <View style={styles.inputContainer}>

        <Ionicons
          name="shield-checkmark-outline"
          size={24}
          color="#1E6FB9"
        />

        <TextInput
          placeholder="123456"
          placeholderTextColor="#94A3B8"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          style={styles.input}
        />

      </View>

      {/* BOTÓN */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
      >

        <Text style={styles.buttonText}>
          Verificar Código
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
    marginBottom: 10,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 30,
    paddingHorizontal: 15,
    lineHeight: 22,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    height: 70,

    borderRadius: 20,

    paddingHorizontal: 20,

    marginBottom: 25,

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

    fontSize: 20,

    textAlign: 'center',

    fontWeight: '600',

    letterSpacing: 4,

    color: '#1E293B',
    },

  button: {
    backgroundColor: '#1E6FB9',

    height: 60,

    borderRadius: 18,

    justifyContent: 'center',
    alignItems: 'center',

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },

    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

})
