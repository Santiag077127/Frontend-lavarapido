import React, { useContext, useState } from 'react'
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../services/authService'
import { classifyApiError } from '../../../services/api'
import { images } from '../../../assets/images'
import { isValidEmail } from '../../../services/validators'

export default function ForgotPasswordScreen({ navigation }: any) {
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSendCode = async () => {
    const normalizedEmail = email.trim()
    setEmailTouched(true)
    if (!normalizedEmail) return setError(t('forgotPassword.emailRequired'))
    if (!isValidEmail(normalizedEmail)) return setError(t('forgotPassword.invalidEmail'))
    setError(null)
    setSending(true)
    try {
      await authService.requestPasswordReset(normalizedEmail)
      setSent(true)
    } catch (requestError) {
      const kind = classifyApiError(requestError)
      setError(['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
        ? t(`apiErrors.${kind}`)
        : t('forgotPassword.sendError'))
    } finally {
      setSending(false)
    }
  }

  const emailFieldError = emailTouched && (!email.trim() || !isValidEmail(email))

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (!emailTouched) return
    if (!value.trim()) setError(t('forgotPassword.emailRequired'))
    else if (!isValidEmail(value)) setError(t('forgotPassword.invalidEmail'))
    else setError(null)
  }

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'} showsVerticalScrollIndicator={false} bounces={false} automaticallyAdjustContentInsets={false} automaticallyAdjustKeyboardInsets={false}>
        <View style={styles.content}>
          {sent ? <View style={styles.card}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" accessible={false} />
            <Text accessibilityRole="header" style={[styles.statusTitle, { color: theme.text }]}>{t('forgotPassword.sentTitle')}</Text>
            <Text style={[styles.statusCopy, { color: theme.textSecondary }]}>{t('forgotPassword.sentMessage')}</Text>
            <View style={[styles.tip, { backgroundColor: theme.infoBackground }]}><Ionicons name="mail-unread-outline" size={20} color={theme.infoText} /><Text style={[styles.tipText, { color: theme.text }]}>{t('forgotPassword.checkSpam')}</Text></View>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primaryDark, paddingHorizontal: 16 }]} onPress={() => navigation.navigate('ResetPassword')} accessibilityRole="button"><Text style={[styles.buttonText, { color: theme.onPrimary, textAlign: 'center' }]}>{t('forgotPassword.continueWithToken')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')} accessibilityRole="button"><Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('forgotPassword.backToLogin')}</Text></TouchableOpacity>
          </View> : <View style={styles.card}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" accessible={false} />
            <View style={styles.formContent}>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('forgotPassword.subtitle')}</Text>
              <View style={styles.field}><Text style={[styles.label, { color: theme.text }]}>{t('forgotPassword.email')}</Text><View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: emailFieldError ? theme.errorText : focused ? theme.primary : theme.border }]}><Ionicons name="mail-outline" size={21} color={focused ? theme.primary : theme.textSecondary} /><TextInput accessibilityLabel={t('forgotPassword.email')} placeholder={t('forgotPassword.email')} placeholderTextColor={theme.placeholder} value={email} onChangeText={handleEmailChange} onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); setEmailTouched(true); if (!email.trim()) setError(t('forgotPassword.emailRequired')); else if (!isValidEmail(email)) setError(t('forgotPassword.invalidEmail')) }} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="done" onSubmitEditing={handleSendCode} style={[styles.input, { color: theme.text }]} /></View>{error ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: theme.errorText }]}>{error}</Text> : null}</View>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.primaryDark, opacity: sending ? 0.7 : 1, paddingHorizontal: 16 }]} onPress={handleSendCode} disabled={sending} accessibilityRole="button" accessibilityLabel={sending ? `${t('forgotPassword.sendCode')}, ${t('accessibility.inProgress')}` : t('forgotPassword.sendCode')} accessibilityState={{ disabled: sending, busy: sending }} activeOpacity={0.8}>{sending ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={[styles.buttonText, { color: theme.onPrimary, textAlign: 'center' }]}>{t('forgotPassword.sendCode')}</Text>}</TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')} accessibilityRole="button"><Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('forgotPassword.backToLogin')}</Text></TouchableOpacity>
            </View>
          </View>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, keyboardContainer: { flex: 1 }, scrollContent: { flexGrow: 1 }, content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 84, maxWidth: 540, width: '100%', alignSelf: 'center' },
  card: { width: '100%' }, logo: { width: '100%', maxWidth: 420, height: 210, alignSelf: 'center', marginBottom: 4 }, formContent: { width: '100%', alignSelf: 'center', transform: [{ translateY: -28 }] },
  subtitle: { width: '100%', maxWidth: 380, alignSelf: 'center', fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 20 }, field: { marginBottom: 16 }, label: { fontSize: 14, fontWeight: '700', marginBottom: 7, marginLeft: 3 }, inputWrapper: { width: '100%', minHeight: 62, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 17, elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 }, input: { flex: 1, minWidth: 0, minHeight: 58, marginLeft: 12, paddingVertical: 0, fontSize: 16 }, error: { marginTop: 8, fontSize: 13, lineHeight: 18 }, button: { width: '100%', alignSelf: 'center', minHeight: 58, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }, buttonText: { fontSize: 17, fontWeight: '800' }, secondaryButton: { width: '100%', alignSelf: 'center', minHeight: 48, justifyContent: 'center', alignItems: 'center', marginTop: 10 }, secondaryButtonText: { fontSize: 14, fontWeight: '700' },
  statusTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 }, statusCopy: { fontSize: 15, lineHeight: 23, textAlign: 'center' }, tip: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 14, padding: 14, marginVertical: 22 }, tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
})
