import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native'

import { useNavigation } from '@react-navigation/native'
import {
  MaterialIcons,
  Feather,
  Ionicons
} from '@expo/vector-icons'

import { ThemeContext } from '../../../theme/ThemeContext'

type Props = {
  setIsLoggedIn: (value: boolean) => void
}

export default function RegisterScreen({
  setIsLoggedIn
}: Props) {

  const navigation = useNavigation<any>()

  const { theme, darkMode } = useContext(ThemeContext)

  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = () => {

    setError('')

    if (
      !nombre ||
      !correo ||
      !telefono ||
      !contrasena ||
      !confirmar
    ) {
      setError('Por favor completa todos los campos')
      return
    }

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (contrasena.length < 8) {
      setError(
        'La contraseña debe tener mínimo 8 caracteres'
      )
      return
    }

    setLoading(true)

    setTimeout(() => {

      setLoading(false)

      setNombre('')
      setCorreo('')
      setTelefono('')
      setContrasena('')
      setConfirmar('')

      setIsLoggedIn(true)

      navigation.goBack()

    }, 1500)
  }

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >

      <ScrollView
        contentContainerStyle={[
          styles.page,
          { backgroundColor: theme.background }
        ]}
        keyboardShouldPersistTaps="handled"
      >

        {/* 🔥 LOGO */}
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
        />

        <View style={styles.form}>

          {/* 📧 CORREO */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.card }
            ]}
          >

            <MaterialIcons
              name="email"
              size={20}
              color={darkMode ? '#fff' : '#444'}
            />

            <TextInput
              placeholder="Correo"
              placeholderTextColor={
                theme.textSecondary
              }
              style={[
                styles.input,
                { color: theme.text }
              ]}
              value={correo}
              onChangeText={setCorreo}
            />

          </View>

          {/* 📱 TELÉFONO */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.card }
            ]}
          >

            <Feather
              name="phone"
              size={20}
              color={darkMode ? '#fff' : '#444'}
            />

            <TextInput
              placeholder="Teléfono"
              placeholderTextColor={
                theme.textSecondary
              }
              style={[
                styles.input,
                { color: theme.text }
              ]}
              value={telefono}
              onChangeText={setTelefono}
            />

          </View>

          {/* 👤 NOMBRE */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.card }
            ]}
          >

            <Feather
              name="user"
              size={20}
              color={darkMode ? '#fff' : '#444'}
            />

            <TextInput
              placeholder="Nombre"
              placeholderTextColor={
                theme.textSecondary
              }
              style={[
                styles.input,
                { color: theme.text }
              ]}
              value={nombre}
              onChangeText={setNombre}
            />

          </View>

          {/* 🔒 PASSWORD */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.card }
            ]}
          >

            <Ionicons
              name="lock-closed"
              size={20}
              color={darkMode ? '#fff' : '#444'}
            />

            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={
                theme.textSecondary
              }
              secureTextEntry
              style={[
                styles.input,
                { color: theme.text }
              ]}
              value={contrasena}
              onChangeText={setContrasena}
            />

          </View>

          {/* 🔒 CONFIRMAR */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.card }
            ]}
          >

            <Ionicons
              name="lock-closed"
              size={20}
              color={darkMode ? '#fff' : '#444'}
            />

            <TextInput
              placeholder="Confirmar contraseña"
              placeholderTextColor={
                theme.textSecondary
              }
              secureTextEntry
              style={[
                styles.input,
                { color: theme.text }
              ]}
              value={confirmar}
              onChangeText={setConfirmar}
            />

          </View>

          {/* ⚠ ERROR */}
          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: darkMode
                    ? '#3B1F1F'
                    : '#FFF0F0'
                }
              ]}
            >

              <Text style={styles.errorText}>
                ⚠ {error}
              </Text>

            </View>
          ) : null}

          {/* 🔥 BOTÓN */}
          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={loading}
          >

            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Registrar
              </Text>
            )}

          </TouchableOpacity>

          {/* 🔗 LINK */}
          <Text
            style={[
              styles.link,
              { color: theme.text }
            ]}
            onPress={() =>
              navigation.navigate('Login')
            }
          >
            Iniciar Sesión
          </Text>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({

  page: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  logo: {
    width: 140,
    height: 140,
    borderRadius: 20,
    marginBottom: 30,
  },

  form: {
    width: '100%',
    paddingHorizontal: 25,
    gap: 15,
    maxWidth: 400,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,

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
    fontSize: 15,
  },

  button: {
    backgroundColor: '#2A66B2',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3
    },

    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  errorBox: {
    borderRadius: 10,
    padding: 12,
  },

  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '500',
  },

  link: {
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
    fontSize: 14,
  },

})