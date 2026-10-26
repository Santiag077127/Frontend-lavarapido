import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { DocumentType } from './registerTypes';

type SharedProps = {
  theme: any;
  translate: (key: string) => string;
};

type PersonalInformationProps = SharedProps & {
  email: string;
  emailFormatError: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  documentType: DocumentType;
  documentNumber: string;
  onEmailChange: (value: string) => void;
  onEmailBlur: () => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onDocumentTypeChange: (value: DocumentType) => void;
  onDocumentNumberChange: (value: string) => void;
};

export function RegisterPersonalInformationFields({
  theme,
  translate: t,
  email,
  emailFormatError,
  firstName,
  lastName,
  phoneNumber,
  documentType,
  documentNumber,
  onEmailChange,
  onEmailBlur,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onDocumentTypeChange,
  onDocumentNumberChange,
}: PersonalInformationProps) {
  const iconColor = theme.icon;
  const borderColor = theme.border;
  const inputBackground = theme.inputBackground;

  return (
    <>
      <InputContainer backgroundColor={inputBackground} borderColor={emailFormatError ? theme.errorText : borderColor}>
        <MaterialIcons name="email" size={20} color={iconColor} />
        <TextInput
          accessibilityLabel={t('register.email')}
          placeholder={t('register.email')}
          placeholderTextColor={theme.placeholder}
          style={[styles.input, { color: theme.text }]}
          value={email}
          onChangeText={onEmailChange}
          onBlur={onEmailBlur}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </InputContainer>
      {emailFormatError ? <Text accessibilityRole="alert" style={[styles.fieldError, { color: theme.errorText }]}>{t('register.invalidEmail')}</Text> : null}

      <InputContainer backgroundColor={inputBackground} borderColor={borderColor}>
        <Feather name="user" size={20} color={iconColor} />
        <TextInput
          accessibilityLabel={t('register.firstName')}
          placeholder={t('register.firstName')}
          placeholderTextColor={theme.placeholder}
          style={[styles.input, { color: theme.text }]}
          value={firstName}
          onChangeText={onFirstNameChange}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </InputContainer>

      <InputContainer backgroundColor={inputBackground} borderColor={borderColor}>
        <Feather name="user" size={20} color={iconColor} />
        <TextInput
          accessibilityLabel={t('register.lastName')}
          placeholder={t('register.lastName')}
          placeholderTextColor={theme.placeholder}
          style={[styles.input, { color: theme.text }]}
          value={lastName}
          onChangeText={onLastNameChange}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </InputContainer>

      <InputContainer backgroundColor={inputBackground} borderColor={borderColor}>
        <Feather name="phone" size={20} color={iconColor} />
        <TextInput
          accessibilityLabel={t('register.phone')}
          placeholder={t('register.phone')}
          placeholderTextColor={theme.placeholder}
          style={[styles.input, { color: theme.text }]}
          value={phoneNumber}
          onChangeText={onPhoneChange}
          keyboardType="phone-pad"
          maxLength={10}
          returnKeyType="next"
        />
      </InputContainer>

      <Text style={[styles.sectionLabel, { color: theme.text }]}>{t('register.documentType')}</Text>
      <View style={styles.documentTypes}>
        {(['CC', 'TI', 'CE'] as DocumentType[]).map((type) => {
          const selected = documentType === type;
          return (
            <TouchableOpacity
              key={type}
              accessibilityRole="radio"
              accessibilityLabel={`${t('register.documentType')}: ${type}`}
              accessibilityState={{ selected }}
              activeOpacity={0.8}
              onPress={() => onDocumentTypeChange(type)}
              style={[styles.documentButton, {
                backgroundColor: selected ? theme.primaryDark : inputBackground,
                borderColor: selected ? theme.primaryDark : borderColor,
              }]}
            >
              <Text style={[styles.documentButtonText, { color: selected ? theme.onPrimary : theme.text }]}>{type}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <InputContainer backgroundColor={inputBackground} borderColor={borderColor}>
        <MaterialIcons name="badge" size={20} color={iconColor} />
        <TextInput
          accessibilityLabel={t('register.documentNumber')}
          placeholder={t('register.documentNumber')}
          placeholderTextColor={theme.placeholder}
          style={[styles.input, { color: theme.text }]}
          value={documentNumber}
          onChangeText={onDocumentNumberChange}
          keyboardType="number-pad"
          maxLength={documentType === 'CE' ? undefined : 10}
          returnKeyType="next"
        />
      </InputContainer>
    </>
  );
}

type CredentialProps = SharedProps & {
  password: string;
  confirmPassword: string;
  passwordBytes: number;
  confirmationMatches: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmitEditing: () => void;
};

export function RegisterCredentialFields({
  theme,
  translate: t,
  password,
  confirmPassword,
  passwordBytes,
  confirmationMatches,
  showPassword,
  showConfirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmitEditing,
}: CredentialProps) {
  const inputBackground = theme.inputBackground;
  const borderColor = theme.border;
  const iconColor = theme.icon;

  return (
    <>
      <InputContainer backgroundColor={inputBackground} borderColor={borderColor}>
        <Ionicons name="lock-closed" size={20} color={iconColor} />
        <TextInput
          accessibilityLabel={t('register.password')}
          placeholder={t('register.password')}
          placeholderTextColor={theme.placeholder}
          secureTextEntry={!showPassword}
          style={[styles.input, { color: theme.text }]}
          value={password}
          onChangeText={onPasswordChange}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
        <PasswordVisibilityButton visible={showPassword} onPress={onTogglePassword} translate={t} color={theme.textSecondary} />
      </InputContainer>

      <View style={[styles.requirementsBox, { backgroundColor: theme.surface, borderColor }]}>
        <Text style={[styles.requirementsTitle, { color: theme.text }]}>{t('register.passwordRequirements')}</Text>
        <PasswordRequirement valid={password.length >= 8} text={t('register.minLength')} textColor={theme.textSecondary} successColor={theme.successText} errorColor={theme.errorText} />
        {passwordBytes > 72 ? <PasswordRequirement valid={false} text={t('register.passwordTooLong')} textColor={theme.textSecondary} successColor={theme.successText} errorColor={theme.errorText} /> : null}
      </View>

      <InputContainer backgroundColor={inputBackground} borderColor={borderColor}>
        <Ionicons name="lock-closed" size={20} color={iconColor} />
        <TextInput
          accessibilityLabel={t('register.confirmPassword')}
          placeholder={t('register.confirmPassword')}
          placeholderTextColor={theme.placeholder}
          secureTextEntry={!showConfirmPassword}
          style={[styles.input, { color: theme.text }]}
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
        />
        <PasswordVisibilityButton visible={showConfirmPassword} onPress={onToggleConfirmPassword} translate={t} color={theme.textSecondary} />
      </InputContainer>

      {confirmPassword.length > 0 ? (
        <View style={styles.passwordMatchContainer}>
          <Text style={[styles.passwordMatchText, { color: confirmationMatches ? theme.successText : theme.errorText }]}>
            {confirmationMatches ? `✓ ${t('register.passwordsMatch')}` : `✗ ${t('register.passwordsDoNotMatch')}`}
          </Text>
        </View>
      ) : null}
    </>
  );
}

function InputContainer({ children, backgroundColor, borderColor }: {
  children: React.ReactNode;
  backgroundColor: string;
  borderColor: string;
}) {
  return <View style={[styles.inputContainer, { backgroundColor, borderColor }]}>{children}</View>;
}

function PasswordVisibilityButton({ visible, onPress, translate: t, color }: {
  visible: boolean;
  onPress: () => void;
  translate: (key: string) => string;
  color: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(visible ? 'accessibility.hidePassword' : 'accessibility.showPassword')}
      accessibilityState={{ expanded: visible }}
      onPress={onPress}
      hitSlop={10}
    >
      <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={22} color={color} />
    </Pressable>
  );
}

function PasswordRequirement({ valid, text, textColor, successColor, errorColor }: {
  valid: boolean;
  text: string;
  textColor: string;
  successColor: string;
  errorColor: string;
}) {
  return (
    <View style={styles.requirementRow}>
      <Text style={[styles.requirementIcon, { color: valid ? successColor : errorColor }]}>{valid ? '✓' : '✗'}</Text>
      <Text style={[styles.requirementText, { color: valid ? successColor : textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { width: '100%', minHeight: 55, flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3 },
  input: { flex: 1, marginLeft: 10, fontSize: 15, minHeight: 53, paddingVertical: 8 },
  fieldError: { marginTop: -6, marginBottom: 2, fontSize: 12, lineHeight: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginTop: 2, marginBottom: -5 },
  documentTypes: { flexDirection: 'row', gap: 10, width: '100%' },
  documentButton: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  documentButtonText: { fontSize: 15, fontWeight: '600' },
  requirementsBox: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, marginTop: -3 },
  requirementsTitle: { fontSize: 13, fontWeight: '600', marginBottom: 7 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  requirementIcon: { width: 20, fontSize: 16, fontWeight: '700' },
  requirementText: { fontSize: 12.5, flex: 1 },
  passwordMatchContainer: { marginTop: -5, paddingHorizontal: 5 },
  passwordMatchText: { fontSize: 12.5, fontWeight: '500' },
});
