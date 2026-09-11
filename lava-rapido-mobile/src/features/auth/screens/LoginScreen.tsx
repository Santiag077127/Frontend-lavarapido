import React, { useContext, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Dimensions,
  StatusBar,
  Keyboard,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ThemeContext } from '../../../theme/ThemeContext';
import { images } from '../../../assets/images';

import { authService, UserRole } from '../../../services/authService';
import { setToken } from '../../../services/api';

type Props = {
  setIsLoggedIn: (value: boolean) => void;
  setRole?: (role: UserRole) => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen({
  setIsLoggedIn,
  setRole,
}: Props) {
  const navigation = useNavigation<any>();

  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar el mensaje de error estético
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (msg: string) => {
    setErrorMessage(msg);
  };

  const clearError = () => {
    if (errorMessage) setErrorMessage(null);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    clearError();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      showError('Ingresa tu correo electrónico y contraseña.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      showError('Ingresa un correo electrónico válido.');
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login(
        cleanEmail,
        cleanPassword
      );

      const data = response.data;

      if (!data || !data.token) {
        throw new Error('El servidor no devolvió un token válido.');
      }

      setToken(data.token);
      setRole?.(data.user?.role ?? 'USER');
      setIsLoggedIn(true);

    } catch (error: any) {
      console.log(
        'ERROR LOGIN:',
        error?.response?.data || error?.message || error
      );

      let message =
        'No fue posible iniciar sesión. Intenta nuevamente.';

      const status = error?.response?.status;
      const backendMessage = error?.response?.data;

      if (status === 401) {
        message =
          typeof backendMessage === 'string'
            ? backendMessage
            : 'El correo o la contraseña son incorrectos.';
      } else if (status === 400) {
        message =
          typeof backendMessage === 'string'
            ? backendMessage
            : 'Los datos enviados no son válidos.';
      } else if (status === 404) {
        message =
          'No se pudo encontrar el servicio de autenticación.';
      } else if (!error?.response) {
        message =
          'No se pudo conectar con el servidor. Verifica que el backend esté encendido y la red Wi-Fi.';
      }

      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const backgroundColor = theme.background;

  return (
    <>
      <StatusBar
        barStyle={
          theme.background === '#000000' ||
          theme.background === '#000'
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={backgroundColor}
        translucent={false}
      />

      <KeyboardAvoidingView
        style={[
          styles.keyboardContainer,
          {
            backgroundColor,
          },
        ]}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={[
            styles.scrollView,
            {
              backgroundColor,
            },
          ]}
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: SCREEN_HEIGHT,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios'
              ? 'interactive'
              : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
          bounces={false}
          automaticallyAdjustContentInsets={false}
          automaticallyAdjustKeyboardInsets={false}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor,
              },
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
                  color: theme.text,
                },
              ]}
            >
              Iniciar sesión
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Ingresa a tu cuenta de Lava Rápido
            </Text>

            {/* BANNER DE ERROR */}
            {errorMessage && (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: theme.errorBackground,
                    borderColor: theme.errorBorder,
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={theme.errorText}
                  style={styles.errorIcon}
                />
                <Text style={[styles.errorText, { color: theme.errorText }]}>
                  {errorMessage}
                </Text>
                <TouchableOpacity onPress={clearError} activeOpacity={0.7}>
                  <Ionicons name="close" size={18} color={theme.errorText} />
                </TouchableOpacity>
              </View>
            )}

            {/* EMAIL */}
            <View style={styles.fieldWrapper}>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Correo electrónico
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: errorMessage ? theme.errorBorder : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={theme.textSecondary}
                />

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                    },
                  ]}
                  placeholder="Ingresa tu correo"
                  placeholderTextColor={theme.placeholder}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>
            </View>

            {/* CONTRASEÑA */}
            <View style={styles.fieldWrapper}>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Contraseña
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: errorMessage ? theme.errorBorder : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={theme.textSecondary}
                />

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                    },
                  ]}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor={theme.placeholder}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />

                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={22}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* RECUPERAR CONTRASEÑA */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate(
                  'ForgotPassword'
                );
              }}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotText, { color: theme.primary }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* BOTÓN LOGIN */}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: theme.primary,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={styles.buttonText}>
                  Iniciando sesión...
                </Text>
              ) : (
                <Text style={styles.buttonText}>
                  Ingresar
                </Text>
              )}
            </TouchableOpacity>

            {/* REGISTRO */}
            <View style={styles.footer}>
              <Text
                style={[
                  styles.footerText,
                  {
                    color: theme.textSecondary,
                  },
                ]}
              >
                ¿No tienes cuenta?
              </Text>

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  navigation.navigate('Register');
                }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={[styles.registerText, { color: theme.primary }]}>
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 30,
  },
  logo: {
    width: '75%',
    maxWidth: 300,
    height: 190,
    alignSelf: 'center',
    marginBottom: 0,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  fieldWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
    marginLeft: 3,
  },
  inputContainer: {
    width: '100%',
    minHeight: 62,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    minHeight: 58,
    marginLeft: 12,
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeButton: {
    width: 42,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -2,
    marginBottom: 21,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  forgotText: {
    fontWeight: '700',
    fontSize: 14,
  },
  button: {
    width: '100%',
    minHeight: 58,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  footerText: {
    fontSize: 14,
  },
  registerText: {
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 5,
  },
  bottomSpacer: {
    height: 10,
  },
});
