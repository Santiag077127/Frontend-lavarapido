import React, { useContext, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { useTranslation } from 'react-i18next'
import BackButton from '../../../components/common/BackButton'
import { authService } from '../../../services/authService'
import { classifyApiError } from '../../../services/api'
import { getPasswordUtf8ByteLength, isValidPassword, passwordsMatch } from '../../../services/passwordPolicy'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(route.params?.token ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const passwordValid = isValidPassword(password)
  const confirmationValid = passwordsMatch(password, confirmPassword)

  const handleReset = async () => {
    if (!token.trim() || !password || !confirmPassword) return setError(t('resetPassword.incompleteMessage'))
    if (!confirmationValid) return setError(t('resetPassword.mismatch'))
    if (!passwordValid) return setError(t('resetPassword.passwordRequirements'))
    setError(null)
    setSaving(true)
    try {
      await authService.resetPassword(token.trim(), password)
      setSuccess(true)
    } catch (requestError) {
      const kind = classifyApiError(requestError)
      setError(['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
        ? t(`apiErrors.${kind}`)
        : t('resetPassword.resetError'))
    } finally {
      setSaving(false)
    }
  }

  const passwordField = (label: string, value: string, onChangeText: (text: string) => void, visible: boolean, toggle: () => void, icon: 'lock-closed-outline' | 'shield-checkmark-outline', invalid: boolean) => <View style={styles.field}>
    <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: value && invalid ? theme.errorText : theme.border }]}><Ionicons name={icon} size={20} color={theme.primary} /><TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor={theme.placeholder} secureTextEntry={!visible} value={value} onChangeText={(next) => { onChangeText(next); setError(null) }} autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: theme.text }]} /><TouchableOpacity onPress={toggle} hitSlop={8} accessibilityRole="button" accessibilityLabel={t(visible ? 'accessibility.hidePassword' : 'accessibility.showPassword')} accessibilityState={{ expanded: visible }}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textSecondary} /></TouchableOpacity></View>
  </View>

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}><BackButton accessibilityLabel={t('mobile.serviceDetail.back')} onPress={() => navigation.goBack()} /><Text accessibilityRole="header" style={[styles.headerTitle, { color: theme.text }]}>{t('resetPassword.title')}</Text></View>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            {success ? <View style={styles.successContent}>
              <View style={[styles.successIcon, { backgroundColor: theme.successBackground }]}><Ionicons name="checkmark-circle" size={42} color={theme.success} /></View>
              <Text accessibilityRole="header" style={[styles.successTitle, { color: theme.text }]}>{t('resetPassword.successTitle')}</Text>
              <Text style={[styles.successCopy, { color: theme.textSecondary }]}>{t('resetPassword.successMessage')}</Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Login')} accessibilityRole="button"><Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('forgotPassword.backToLogin')}</Text></TouchableOpacity>
            </View> : <>
              <View style={[styles.heroIcon, { backgroundColor: theme.infoBackground }]}><Ionicons name="shield-checkmark-outline" size={38} color={theme.primary} /></View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('resetPassword.subtitle')}</Text>
              <View style={styles.field}><Text style={[styles.label, { color: theme.text }]}>{t('resetPassword.token')}</Text><View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}><Ionicons name="key-outline" size={20} color={theme.primary} /><TextInput placeholder={t('resetPassword.token')} accessibilityLabel={t('resetPassword.token')} placeholderTextColor={theme.placeholder} value={token} onChangeText={(value) => { setToken(value); setError(null) }} autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: theme.text }]} /></View></View>
              {passwordField(t('resetPassword.newPassword'), password, setPassword, showPassword, () => setShowPassword(!showPassword), 'lock-closed-outline', !passwordValid)}
              <View style={[styles.policy, { backgroundColor: theme.infoBackground }]}><Ionicons name={passwordValid ? 'checkmark-circle' : 'information-circle-outline'} size={19} color={passwordValid ? theme.success : theme.infoText} /><View style={styles.policyCopy}><Text style={[styles.policyText, { color: theme.text }]}>{t('resetPassword.passwordRequirements')}</Text>{getPasswordUtf8ByteLength(password) > 72 ? <Text style={[styles.counter, { color: theme.errorText }]}>{t('resetPassword.passwordTooLong')}</Text> : null}</View></View>
              {passwordField(t('resetPassword.confirmPassword'), confirmPassword, setConfirmPassword, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword), 'shield-checkmark-outline', !confirmationValid)}
              {error ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: theme.errorText }]}>{error}</Text> : null}
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }]} onPress={handleReset} disabled={saving} accessibilityRole="button" accessibilityLabel={saving ? `${t('resetPassword.save')}, ${t('accessibility.inProgress')}` : t('resetPassword.save')} accessibilityState={{ disabled: saving, busy: saving }} activeOpacity={0.8}>{saving ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('resetPassword.save')}</Text>}</TouchableOpacity>
            </>}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, keyboard: { flex: 1 }, scrollContent: { flexGrow: 1 }, content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24, maxWidth: 540, width: '100%', alignSelf: 'center' }, header: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 }, headerTitle: { flex: 1, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  card: { borderWidth: 1, borderRadius: 24, padding: 24, shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 }, heroIcon: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 18 }, subtitle: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 24 }, field: { marginBottom: 16 }, label: { fontSize: 14, fontWeight: '700', marginBottom: 8 }, inputWrapper: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 15 }, input: { flex: 1, minHeight: 52, marginHorizontal: 10, fontSize: 16 },
  policy: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderRadius: 12, padding: 12, marginTop: -5, marginBottom: 16 }, policyCopy: { flex: 1 }, policyText: { fontSize: 13, lineHeight: 18 }, counter: { fontSize: 12, marginTop: 3 }, error: { fontSize: 13, lineHeight: 18, marginBottom: 14 }, button: { minHeight: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 2 }, buttonText: { fontSize: 16, fontWeight: '800' }, successContent: { alignItems: 'center' }, successIcon: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', marginBottom: 18 }, successTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 }, successCopy: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 24 },
})
