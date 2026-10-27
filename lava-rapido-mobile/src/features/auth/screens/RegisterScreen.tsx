import React, { useContext, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../../theme/ThemeContext';
import { authService } from '../../../services/authService';
import { classifyApiError } from '../../../services/api';
import { getPasswordUtf8ByteLength, isValidPassword, passwordsMatch } from '../../../services/passwordPolicy';
import { sanitizeHumanText } from '../../../services/inputSanitizers';
import { isValidEmail } from '../../../services/validators';
import RegisterLegalConsent from '../components/RegisterLegalConsent';
import RegisterLegalDocumentModal from '../components/RegisterLegalDocumentModal';
import { RegisterCredentialFields, RegisterPersonalInformationFields } from '../components/RegisterFormFields';
import { RegisterFormActions, RegisterFormMessage } from '../components/RegisterFormFeedback';
import { isTenDigitDocumentType, normalizeDocumentNumber, type DocumentType } from '../components/registerTypes';
import type { LegalDocument } from '../legalContent';

export { normalizeDocumentNumber } from '../components/registerTypes';

type Props = {
  setIsLoggedIn: (value: boolean) => void;
};

export default function RegisterScreen({ setIsLoggedIn }: Props) {
  const navigation = useNavigation<any>();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
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
  const [acceptsPrivacy, setAcceptsPrivacy] = useState(false);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [legalDocument, setLegalDocument] = useState<LegalDocument | null>(null);

  const passwordBytes = getPasswordUtf8ByteLength(password);
  const passwordIsValid = isValidPassword(password);
  const confirmationMatches = passwordsMatch(password, confirmPassword);
  const emailIsValid = isValidEmail(email);
  const emailFormatError = emailTouched && email.trim().length > 0 && !emailIsValid;

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    setEmailTouched(true);

    if (
      !email.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !phoneNumber.trim() ||
      !documentNumber.trim() ||
      !password ||
      !confirmPassword ||
      !acceptsPrivacy ||
      !acceptsTerms
    ) {
      setError(!acceptsPrivacy || !acceptsTerms
        ? 'Debes leer la política de privacidad y aceptar los términos y condiciones para continuar.'
        : t('register.required'));
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

    const normalizedDocumentNumber = normalizeDocumentNumber(documentNumber, documentType);
    if (isTenDigitDocumentType(documentType) && normalizedDocumentNumber !== documentNumber.trim()) {
      setDocumentNumber(normalizedDocumentNumber);
      setError(t('register.invalidDocument'));
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

    if (!confirmationMatches) {
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
        documentNumber: normalizedDocumentNumber,
        password,
      };

      await authService.register(data);
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
      const kind = classifyApiError(err);
      const message = ['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
        ? t(`apiErrors.${kind}`)
        : status === 400 || status === 422
          ? t('register.badRequest')
          : status === 401
            ? t('apiErrors.unauthorized')
            : status === 403
              ? t('apiErrors.forbidden')
              : status === 404
                ? t('apiErrors.not_found')
                : status === 409
                  ? t('register.conflict')
                  : t('register.genericError');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.page, { backgroundColor: theme.background }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
        >
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" accessible={false} />
          <View style={styles.form}>
            <RegisterPersonalInformationFields
              theme={theme}
              translate={t}
              email={email}
              emailFormatError={emailFormatError}
              firstName={firstName}
              lastName={lastName}
              phoneNumber={phoneNumber}
              documentType={documentType}
              documentNumber={documentNumber}
              onEmailChange={(value) => { setEmail(value); clearMessages(); }}
              onEmailBlur={() => setEmailTouched(true)}
              onFirstNameChange={(value) => setFirstName(sanitizeHumanText(value))}
              onLastNameChange={(value) => setLastName(sanitizeHumanText(value))}
              onPhoneChange={(value) => {
                const digits = value.replace(/\D/g, '');
                if (digits.length <= 10) setPhoneNumber(digits);
              }}
              onDocumentTypeChange={(value) => {
                setDocumentType(value);
                setDocumentNumber((current) => normalizeDocumentNumber(current, value));
              }}
              onDocumentNumberChange={(value) => setDocumentNumber(normalizeDocumentNumber(value, documentType))}
            />
            <RegisterCredentialFields
              theme={theme}
              translate={t}
              password={password}
              confirmPassword={confirmPassword}
              passwordBytes={passwordBytes}
              confirmationMatches={confirmationMatches}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              onPasswordChange={(value) => { setPassword(value); clearMessages(); }}
              onConfirmPasswordChange={(value) => { setConfirmPassword(value); clearMessages(); }}
              onTogglePassword={() => setShowPassword((current) => !current)}
              onToggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
              onSubmitEditing={() => { void handleRegister(); }}
            />
            <RegisterFormMessage message={error} variant="error" theme={theme} />
            <RegisterLegalConsent
              acceptsPrivacy={acceptsPrivacy}
              acceptsTerms={acceptsTerms}
              borderColor={theme.border}
              inputBackground={theme.inputBackground}
              primaryColor={theme.primary}
              onTogglePrivacy={() => setAcceptsPrivacy((current) => !current)}
              onToggleTerms={() => setAcceptsTerms((current) => !current)}
              onOpenDocument={setLegalDocument}
              textColor={theme.text}
              onPrimaryColor={theme.onPrimary}
            />
            <RegisterFormMessage message={success} variant="success" theme={theme} />
            <RegisterFormActions
              loading={loading}
              theme={theme}
              translate={t}
              onSubmit={() => { void handleRegister(); }}
              onLogin={() => navigation.navigate('Login')}
            />
            <View style={styles.bottomSpace} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RegisterLegalDocumentModal
        document={legalDocument}
        onClose={() => setLegalDocument(null)}
        surfaceColor={theme.surface}
        textColor={theme.text}
        secondaryTextColor={theme.textSecondary}
        buttonColor={theme.primaryDark}
        onPrimaryColor={theme.onPrimary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  keyboardContainer: { flex: 1 },
  scroll: { flex: 1 },
  page: { flexGrow: 1, alignItems: 'center', paddingTop: 24, paddingBottom: 24 },
  logo: { width: '100%', maxWidth: 420, height: 210, alignSelf: 'center', marginBottom: 0 },
  form: { width: '100%', maxWidth: 430, paddingHorizontal: 16, gap: 12 },
  bottomSpace: { height: 25 },
});
