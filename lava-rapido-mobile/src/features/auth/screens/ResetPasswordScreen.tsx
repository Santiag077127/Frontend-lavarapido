import React, { useContext, useState } from 'react'
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../services/authService'
import { classifyApiError } from '../../../services/api'
import { getPasswordUtf8ByteLength, isValidPassword, passwordsMatch } from '../../../services/passwordPolicy'
import { passwordVisibilityIcon } from '../../../services/passwordVisibility'
import { images } from '../../../assets/images'
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
    <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: value && invalid ? theme.errorText : theme.border }]}><Ionicons name={icon} size={22} color={theme.textSecondary} /><TextInput accessibilityLabel={label} placeholder={label === t('resetPassword.newPassword') ? t('resetPassword.newPasswordPlaceholder') : t('resetPassword.confirmPasswordPlaceholder')} placeholderTextColor={theme.placeholder} secureTextEntry={!visible} value={value} onChangeText={(next) => { onChangeText(next); setError(null) }} autoCapitalize="none" autoCorrect={false} style={[styles.input, label === t('resetPassword.confirmPassword') && styles.confirmInput, { color: theme.text }]} /><TouchableOpacity style={styles.eyeButton} onPress={toggle} hitSlop={8} accessibilityRole="button" accessibilityLabel={t(visible ? 'accessibility.hidePassword' : 'accessibility.showPassword')} accessibilityState={{ expanded: visible }}><Ionicons name={passwordVisibilityIcon(visible)} size={22} color={theme.textSecondary} /></TouchableOpacity></View>
  </View>

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'} showsVerticalScrollIndicator={false} bounces={false} automaticallyAdjustContentInsets={false} automaticallyAdjustKeyboardInsets={false}>
        <View style={styles.content}>
          <View style={styles.card}>
            {success ? <View style={styles.successContent}>
              <View style={[styles.successIcon, { backgroundColor: theme.successBackground }]}><Ionicons name="checkmark-circle" size={42} color={theme.success} /></View>
              <Text accessibilityRole="header" style={[styles.successTitle, { color: theme.text }]}>{t('resetPassword.successTitle')}</Text>
              <Text style={[styles.successCopy, { color: theme.textSecondary }]}>{t('resetPassword.successMessage')}</Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.primaryDark }]} onPress={() => navigation.navigate('Login')} accessibilityRole="button"><Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('forgotPassword.backToLogin')}</Text></TouchableOpacity>
            </View> : <>
              <Image source={images.logo} style={styles.logo} resizeMode="contain" accessible={false} />
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('resetPassword.subtitle')}</Text>
              <View style={styles.field}><Text style={[styles.label, { color: theme.text }]}>{t('resetPassword.token')}</Text><View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}><Ionicons name="key-outline" size={22} color={theme.textSecondary} /><TextInput placeholder={t('resetPassword.tokenPlaceholder')} accessibilityLabel={t('resetPassword.token')} placeholderTextColor={theme.placeholder} value={token} onChangeText={(value) => { setToken(value); setError(null) }} autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: theme.text }]} /></View></View>
              {passwordField(t('resetPassword.newPassword'), password, setPassword, showPassword, () => setShowPassword(!showPassword), 'lock-closed-outline', !passwordValid)}
              <View style={[styles.policy, { backgroundColor: theme.infoBackground }]}><Ionicons name={passwordValid ? 'checkmark-circle' : 'information-circle-outline'} size={19} color={passwordValid ? theme.success : theme.infoText} /><View style={styles.policyCopy}><Text style={[styles.policyText, { color: theme.text }]}>{t('resetPassword.passwordRequirements')}</Text>{getPasswordUtf8ByteLength(password) > 72 ? <Text style={[styles.counter, { color: theme.errorText }]}>{t('resetPassword.passwordTooLong')}</Text> : null}</View></View>
              {passwordField(t('resetPassword.confirmPassword'), confirmPassword, setConfirmPassword, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword), 'shield-checkmark-outline', !confirmationValid)}
              {error ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: theme.errorText }]}>{error}</Text> : null}
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.primaryDark, opacity: saving ? 0.7 : 1 }]} onPress={handleReset} disabled={saving} accessibilityRole="button" accessibilityLabel={saving ? `${t('resetPassword.save')}, ${t('accessibility.inProgress')}` : t('resetPassword.save')} accessibilityState={{ disabled: saving, busy: saving }} activeOpacity={0.8}>{saving ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('resetPassword.save')}</Text>}</TouchableOpacity>
            </>}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, keyboard: { flex: 1 }, scrollContent: { flexGrow: 1, paddingBottom: 24 }, content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 84, maxWidth: 540, width: '100%', alignSelf: 'center' },
  card: { width: '100%' }, logo: { width: '100%', maxWidth: 420, height: 210, alignSelf: 'center', marginBottom: 4 }, subtitle: { width: '100%', maxWidth: 380, alignSelf: 'center', fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 20 }, field: { marginBottom: 16 }, label: { fontSize: 14, fontWeight: '700', marginBottom: 7, marginLeft: 3 }, inputWrapper: { width: '100%', minHeight: 62, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 17, elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 }, input: { flex: 1, minWidth: 0, minHeight: 58, marginLeft: 12, paddingVertical: 0, fontSize: 16 }, confirmInput: { minWidth: 0, textAlignVertical: 'center' }, eyeButton: { width: 42, height: 50, justifyContent: 'center', alignItems: 'center', marginRight: -8 },
  policy: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderRadius: 12, padding: 12, marginTop: -5, marginBottom: 16 }, policyCopy: { flex: 1 }, policyText: { fontSize: 13, lineHeight: 18 }, counter: { fontSize: 12, marginTop: 3 }, error: { fontSize: 13, lineHeight: 18, marginBottom: 14 }, button: { minHeight: 58, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2, elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }, buttonText: { fontSize: 17, fontWeight: '800' }, successContent: { alignItems: 'center' }, successIcon: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', marginBottom: 18 }, successTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 }, successCopy: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 24 },
})
