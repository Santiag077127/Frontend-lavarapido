import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import BackButton from '../../../components/common/BackButton';
import { appAlert } from '../../../components/notifications/NotificationProvider';
import { ThemeContext } from '../../../theme/ThemeContext';
import { authService } from '../../../services/authService';
import { isValidPassword, passwordsMatch } from '../../../services/passwordPolicy';
import type { RootStackParamList } from '../../../navigation/types';

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

export default function ChangePasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryableError, setRetryableError] = useState(false);

  const fields: Array<{
    key: PasswordField;
    label: string;
    value: string;
    onChangeText: (value: string) => void;
  }> = [
    { key: 'currentPassword', label: t('changePassword.currentPassword'), value: currentPassword, onChangeText: setCurrentPassword },
    { key: 'newPassword', label: t('changePassword.newPassword'), value: newPassword, onChangeText: setNewPassword },
    { key: 'confirmPassword', label: t('changePassword.confirmPassword'), value: confirmPassword, onChangeText: setConfirmPassword },
  ];

  const handleChangePassword = async () => {
    setError('');
    setRetryableError(false);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError(t('changePassword.required'));
      return;
    }
    if (!isValidPassword(newPassword)) {
      setError(t('changePassword.invalidPassword'));
      return;
    }
    if (!passwordsMatch(newPassword, confirmPassword)) {
      setError(t('changePassword.mismatch'));
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      appAlert.alert(
        t('changePassword.successTitle'),
        t('changePassword.successMessage'),
        undefined,
        'success',
      );
    } catch (requestError: any) {
      const status = requestError?.response?.status;
      const code = requestError?.response?.data?.error;
      if (status === 401) return; // The shared interceptor ends an expired session.
      if (status === 400 && code === 'CURRENT_PASSWORD_INVALID') {
        setError(t('changePassword.incorrectCurrentPassword'));
      } else if (status === 400) {
        setError(t('changePassword.invalidPassword'));
      } else if (status === 403) {
        setError(t('changePassword.forbidden'));
      } else if (status === 404) {
        setError(t('changePassword.notFound'));
      } else if (status >= 500) {
        setError(t('changePassword.serverError'));
        setRetryableError(true);
      } else {
        setError(t('changePassword.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <BackButton onPress={() => navigation.goBack()} />
              <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
                {t('changePassword.title')}
              </Text>
            </View>

            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('changePassword.subtitle')}
            </Text>

            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {fields.map(({ key, label, value, onChangeText }) => (
                <View key={key} style={styles.field}>
                  <Text nativeID={`${key}-label`} style={[styles.label, { color: theme.text }]}>
                    {label}
                  </Text>
                  <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: error ? theme.errorBorder : theme.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.textSecondary} />
                    <TextInput
                      accessibilityLabel={label}
                      accessibilityLabelledBy={`${key}-label`}
                      accessibilityHint={key === 'newPassword' ? t('accessibility.passwordRequirements') : undefined}
                      autoCapitalize="none"
                      autoComplete={key === 'currentPassword' ? 'password' : 'new-password'}
                      autoCorrect={false}
                      editable={!loading}
                      onChangeText={(valueText) => {
                        onChangeText(valueText);
                        setError('');
                        setRetryableError(false);
                      }}
                      placeholder={label}
                      placeholderTextColor={theme.placeholder}
                      returnKeyType={key === 'confirmPassword' ? 'done' : 'next'}
                      secureTextEntry={!visible[key]}
                      style={[styles.input, { color: theme.text }]}
                      value={value}
                    />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t(visible[key] ? 'accessibility.hidePassword' : 'accessibility.showPassword')}
                      accessibilityState={{ expanded: visible[key], disabled: loading }}
                      disabled={loading}
                      hitSlop={8}
                      onPress={() => setVisible((state) => ({ ...state, [key]: !state[key] }))}
                    >
                      <Ionicons name={visible[key] ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <Text style={[styles.requirements, { color: theme.textSecondary }]}>
                {t('accessibility.passwordRequirements')}
              </Text>

              {error ? (
                <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, { color: theme.errorText }]}>
                  {error}
                </Text>
              ) : null}

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={loading ? `${t('changePassword.saving')} ${t('accessibility.inProgress')}` : t(retryableError ? 'changePassword.retry' : 'changePassword.submit')}
                accessibilityState={{ disabled: loading, busy: loading }}
                activeOpacity={0.8}
                disabled={loading}
                onPress={handleChangePassword}
                style={[styles.button, { backgroundColor: loading ? theme.disabled : theme.primary }]}
              >
                {loading ? <ActivityIndicator color={theme.onPrimary} /> : (
                  <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
                    {t(retryableError ? 'changePassword.retry' : 'changePassword.submit')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 16 },
  header: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 22 },
  card: { borderWidth: 1, borderRadius: 18, padding: 18 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 7 },
  inputContainer: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, minHeight: 50, marginHorizontal: 10, fontSize: 16 },
  requirements: { fontSize: 13, lineHeight: 19, marginTop: 1, marginBottom: 12 },
  error: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  button: { minHeight: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
