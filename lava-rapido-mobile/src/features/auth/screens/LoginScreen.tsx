import React, { useContext, useState } from 'react'

import {
  View,
 Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

import { ThemeContext } from '../../../theme/ThemeContext'
import { images } from '../../../assets/images'

type Props = {
  setIsLoggedIn: (value: boolean) => void
}

export default function LoginScreen({
  setIsLoggedIn
}: Props) {

  const navigation = useNavigation<any>()

  const { theme } = useContext(ThemeContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = () => {

    if (!email || !password) {

      Alert.alert(
        'Campos incompletos',
        'Ingrese correo y contraseña'
      )

      return
    }

    setIsLoggedIn(true)

    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }]
    })
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

      {/* SUBTITULO */}
      <Text
        style={[
          styles.subtitle,
          {
            color: theme.textSecondary
          }
        ]}
      >
        Bienvenido a Lava Rápido
      </Text>

      {/* EMAIL */}
      <View style={styles.inputContainer}>

        <Ionicons
          name="mail-outline"
          size={22}
          color="#1E6FB9"
        />

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

      </View>

      {/* PASSWORD */}
      <View style={styles.inputContainer}>

        <Ionicons
          name="lock-closed-outline"
          size={22}
          color="#1E6FB9"
        />

        <TextInput
          placeholder="Contraseña"
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

      {/* RECUPERAR CONTRASEÑA */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ForgotPassword')
        }
      >

        <Text style={styles.forgotText}>
          ¿Olvidaste tu contraseña?
        </Text>

      </TouchableOpacity>

      {/* BOTON LOGIN */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >

        <Text style={styles.buttonText}>
          Ingresar
        </Text>

      </TouchableOpacity>

      {/* REGISTRO */}
      <View style={styles.footer}>

        <Text
          style={{
            color: theme.textSecondary
          }}
        >
          ¿No tienes cuenta?
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Register')
          }
        >

          <Text style={styles.registerText}>
            Registrarse
          </Text>

        </TouchableOpacity>

      </View>

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

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    color: '#64748B',
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

  forgotText: {
    textAlign: 'right',
    color: '#1E6FB9',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 25,
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

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },

  registerText: {
    color: '#1E6FB9',
    fontWeight: 'bold',
    marginLeft: 5,
  },

})