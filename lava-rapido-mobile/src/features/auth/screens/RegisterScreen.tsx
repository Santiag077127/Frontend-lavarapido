import React, { useContext, useMemo, useState } from 'react';
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
  Pressable,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';

import { ThemeContext } from '../../../theme/ThemeContext';
import { authService } from '../../../services/authService';
import { useTranslation } from 'react-i18next';

type Props = {
  setIsLoggedIn: (value: boolean) => void;
};

type DocumentType = 'CC' | 'TI' | 'CE';

// =========================================================
// COMPONENTES AUXILIARES MOVIDOS AFUERA (REGLA DE REACT)
// =========================================================

const PasswordRequirement = ({
  valid,
  text,
  textColor,
}: {
  valid: boolean;
  text: string;
  textColor: string;
}) => (
  <View style={styles.requirementRow}>
    <Text
      style={[
        styles.requirementIcon,
        { color: valid ? '#2EAD62' : '#E05252' },
      ]}
    >
      {valid ? '✓' : '✗'}
    </Text>
    <Text
      style={[
        styles.requirementText,
        { color: valid ? '#2EAD62' : textColor },
      ]}
    >
      {text}
    </Text>
  </View>
);

const InputContainer = ({
  children,
  backgroundColor,
  borderColor,
}: {
  children: React.ReactNode;
  backgroundColor: string;
  borderColor: string;
}) => (
  <View
    style={[
      styles.inputContainer,
      {
        backgroundColor,
        borderColor,
      },
    ]}
  >
    {children}
  </View>
);

// =========================================================
// PANTALLA PRINCIPAL
// =========================================================

export default function RegisterScreen({ setIsLoggedIn }: Props) {
  const navigation = useNavigation<any>();
  const { theme, darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();

  // ESTADOS
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // VALIDACIONES
  const passwordRequirements = useMemo(
    () => ({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    }),
    [password]
  );

  const passwordIsValid =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number;

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // HANDLER REGISTRO
  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (
      !email.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !phoneNumber.trim() ||
      !documentNumber.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(t('register.required'));
      return;
    }

    if (!emailIsValid) {
      setError(t('register.invalidEmail'));
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError(t('register.invalidPhone'));
      return;
    }

    if (!/^\d+$/.test(documentNumber.trim())) {
      setError(t('register.invalidDocument'));
      return;
    }

    if (!passwordIsValid) {
      setError(t('register.invalidPassword'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const data = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: cleanPhone,
        documentType,
        documentNumber: documentNumber.trim(),
        password,
      };

      const response = await authService.register(data);

      setSuccess(t('register.success'));

      setEmail('');
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setDocumentType('CC');
      setDocumentNumber('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setIsLoggedIn(false);
        navigation.navigate('Login');
      }, 1000);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = !err?.response
        ? t('register.connectionError')
        : status === 400
          ? t('register.badRequest')
          : status === 409
            ? t('register.conflict')
            : t('register.genericError');

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // COLORES
  const iconColor = darkMode ? '#FFFFFF' : '#444444';
  const inputBackground = theme.card;
  const borderColor = darkMode ? '#444444' : '#E0E0E0';

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.page,
            { backgroundColor: theme.background },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
        >
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.form}>
            {/* CORREO */}
            <InputContainer
              backgroundColor={inputBackground}
              borderColor={borderColor}
            >
              <MaterialIcons name="email" size={20} color={iconColor} />
              <TextInput
                placeholder={t('register.email')}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                  setSuccess('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </InputContainer>

            {/* NOMBRE */}
            <InputContainer
              backgroundColor={inputBackground}
              borderColor={borderColor}
            >
              <Feather name="user" size={20} color={iconColor} />
              <TextInput
                placeholder={t('register.firstName')}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </InputContainer>

            {/* APELLIDO */}
            <InputContainer
              backgroundColor={inputBackground}
              borderColor={borderColor}
            >
              <Feather name="user" size={20} color={iconColor} />
              <TextInput
                placeholder={t('register.lastName')}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </InputContainer>

            {/* TELÉFONO */}
            <InputContainer
              backgroundColor={inputBackground}
              borderColor={borderColor}
            >
              <Feather name="phone" size={20} color={iconColor} />
              <TextInput
                placeholder={t('register.phone')}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                value={phoneNumber}
                onChangeText={(text) => {
                  const numbers = text.replace(/\D/g, '');
                  if (numbers.length <= 10) {
                    setPhoneNumber(numbers);
                  }
                }}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="next"
              />
            </InputContainer>

            {/* TIPO DE DOCUMENTO */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>
              {t('register.documentType')}
            </Text>

            <View style={styles.documentTypes}>
              {(['CC', 'TI', 'CE'] as DocumentType[]).map((type) => {
                const selected = documentType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.8}
                    onPress={() => setDocumentType(type)}
                    style={[
                      styles.documentButton,
                      {
                        backgroundColor: selected
                          ? '#2A66B2'
                          : inputBackground,
                        borderColor: selected ? '#2A66B2' : borderColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.documentButtonText,
                        { color: selected ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* NÚMERO DE DOCUMENTO */}
            <InputContainer
              backgroundColor={inputBackground}
              borderColor={borderColor}
            >
              <MaterialIcons name="badge" size={20} color={iconColor} />
              <TextInput
                placeholder={t('register.documentNumber')}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                value={documentNumber}
                onChangeText={(text) => {
                  const numbers = text.replace(/\D/g, '');
                  setDocumentNumber(numbers);
                }}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </InputContainer>

            {/* CONTRASEÑA */}
            <InputContainer
              backgroundColor={inputBackground}
              borderColor={borderColor}
            >
              <Ionicons name="lock-closed" size={20} color={iconColor} />
              <TextInput
                placeholder={t('register.password')}
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.text }]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                  setSuccess('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={theme.textSecondary}
                />
              </Pressable>
            </InputContainer>

            {/* REQUISITOS DE CONTRASEÑA */}
            <View
              style={[
                styles.requirementsBox,
                {
                  backgroundColor: darkMode ? '#202020' : '#F7F9FC',
                  borderColor,
                },
              ]}
            >
              <Text style={[styles.requirementsTitle, { color: theme.text }]}>
                {t('register.passwordRequirements')}
              </Text>
              <PasswordRequirement
                valid={passwordRequirements.minLength}
                text={t('register.minLength')}
                textColor={theme.textSecondary}
              />
              <PasswordRequirement
                valid={passwordRequirements.uppercase}
                text={t('register.uppercase')}
                textColor={theme.textSecondary}
              />
              <PasswordRequirement
                valid={passwordRequirements.lowercase}
                text={t('register.lowercase')}
                textColor={theme.textSecondary}
              />
              <PasswordRequirement
                valid={passwordRequirements.number}
                text={t('register.number')}
                textColor={theme.textSecondary}
              />
            </View>

            {/* CONFIRMAR CONTRASEÑA */}
            <InputContainer
              backgroundColor={inputBackground}
              borderColor={borderColor}
            >
              <Ionicons name="lock-closed" size={20} color={iconColor} />
              <TextInput
                placeholder={t('register.confirmPassword')}
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showConfirmPassword}
                style={[styles.input, { color: theme.text }]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                  setSuccess('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <Pressable
                onPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                hitSlop={10}
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={22}
                  color={theme.textSecondary}
                />
              </Pressable>
            </InputContainer>

            {/* ESTADO CONTRASEÑAS */}
            {confirmPassword.length > 0 && (
              <View style={styles.passwordMatchContainer}>
                <Text
                  style={[
                    styles.passwordMatchText,
                    { color: passwordsMatch ? '#2EAD62' : '#E05252' },
                  ]}
                >
                  {passwordsMatch
                    ? `✓ ${t('register.passwordsMatch')}`
                    : `✗ ${t('register.passwordsDoNotMatch')}`}
                </Text>
              </View>
            )}

            {/* ERROR */}
            {error ? (
              <View
                style={[
                  styles.messageBox,
                  {
                    backgroundColor: darkMode ? '#3B1F1F' : '#FFF0F0',
                    borderColor: darkMode ? '#6B3030' : '#FFD0D0',
                  },
                ]}
              >
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            {/* ÉXITO */}
            {success ? (
              <View
                style={[
                  styles.messageBox,
                  {
                    backgroundColor: darkMode ? '#193524' : '#EFFBF3',
                    borderColor: darkMode ? '#285B3D' : '#C8EFD4',
                  },
                ]}
              >
                <Text style={styles.successText}>✓ {success}</Text>
              </View>
            ) : null}

            {/* BOTÓN REGISTRAR */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t('register.button')}</Text>
              )}
            </TouchableOpacity>

            {/* LINK LOGIN */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={[styles.link, { color: theme.text }]}>
                {t('register.hasAccount')}{' '}
                <Text style={styles.linkHighlight}>{t('register.signIn')}</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomSpace} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  keyboardContainer: { flex: 1 },
  scroll: { flex: 1 },
  page: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 20,
    marginBottom: 25,
  },
  form: {
    width: '100%',
    maxWidth: 430,
    paddingHorizontal: 16,
    gap: 12,
  },
  inputContainer: {
    width: '100%',
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    minHeight: 53,
    paddingVertical: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: -5,
  },
  documentTypes: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  documentButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  requirementsBox: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    marginTop: -3,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  requirementIcon: {
    width: 20,
    fontSize: 16,
    fontWeight: '700',
  },
  requirementText: {
    fontSize: 12.5,
    flex: 1,
  },
  passwordMatchContainer: {
    marginTop: -5,
    paddingHorizontal: 5,
  },
  passwordMatchText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  messageBox: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
  },
  errorText: {
    color: '#E05252',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  successText: {
    color: '#2EAD62',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  button: {
    width: '100%',
    backgroundColor: '#2A66B2',
    minHeight: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
    paddingVertical: 8,
  },
  linkHighlight: {
    color: '#2A66B2',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  bottomSpace: { height: 25 },
});
