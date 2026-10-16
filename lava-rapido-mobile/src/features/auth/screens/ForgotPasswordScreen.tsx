import React, { useContext, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { useTranslation } from 'react-i18next'
import BackButton from '../../../components/common/BackButton'
import { authService } from '../../../services/authService'
import { classifyApiError } from '../../../services/api'

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export default function ForgotPasswordScreen({ navigation }: any) {
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSendCode = async () => {
    const normalizedEmail = email.trim()
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

  return <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}><BackButton accessibilityLabel={t('mobile.serviceDetail.back')} onPress={() => navigation.goBack()} /><Text accessibilityRole="header" style={[styles.headerTitle, { color: theme.text }]}>{t('forgotPassword.title')}</Text></View>
          {sent ? <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <View style={[styles.statusIcon, { backgroundColor: theme.successBackground }]}><Ionicons name="checkmark-circle" size={42} color={theme.success} /></View>
            <Text accessibilityRole="header" style={[styles.statusTitle, { color: theme.text }]}>{t('forgotPassword.sentTitle')}</Text>
            <Text style={[styles.statusCopy, { color: theme.textSecondary }]}>{t('forgotPassword.sentMessage')}</Text>
            <View style={[styles.tip, { backgroundColor: theme.infoBackground }]}><Ionicons name="mail-unread-outline" size={20} color={theme.infoText} /><Text style={[styles.tipText, { color: theme.text }]}>{t('forgotPassword.checkSpam')}</Text></View>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('ResetPassword')} accessibilityRole="button"><Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('forgotPassword.continueWithToken')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')} accessibilityRole="button"><Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('forgotPassword.backToLogin')}</Text></TouchableOpacity>
          </View> : <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <View style={[styles.heroIcon, { backgroundColor: theme.infoBackground }]}><Ionicons name="mail-unread-outline" size={38} color={theme.primary} /></View>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('forgotPassword.subtitle')}</Text>
            <View style={styles.field}><Text style={[styles.label, { color: theme.text }]}>{t('forgotPassword.email')}</Text><View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: error ? theme.errorText : focused ? theme.primary : theme.border }]}><Ionicons name="mail-outline" size={21} color={focused ? theme.primary : theme.textSecondary} /><TextInput accessibilityLabel={t('forgotPassword.email')} placeholder={t('forgotPassword.email')} placeholderTextColor={theme.placeholder} value={email} onChangeText={(value) => { setEmail(value); setError(null) }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="done" onSubmitEditing={handleSendCode} style={[styles.input, { color: theme.text }]} /></View>{error ? <Text accessibilityLiveRegion="polite" style={[styles.error, { color: theme.errorText }]}>{error}</Text> : null}</View>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, opacity: sending ? 0.7 : 1 }]} onPress={handleSendCode} disabled={sending} accessibilityRole="button" accessibilityLabel={sending ? `${t('forgotPassword.sendCode')}, ${t('accessibility.inProgress')}` : t('forgotPassword.sendCode')} accessibilityState={{ disabled: sending, busy: sending }} activeOpacity={0.8}>{sending ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('forgotPassword.sendCode')}</Text>}</TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')} accessibilityRole="button"><Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('forgotPassword.backToLogin')}</Text></TouchableOpacity>
          </View>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, keyboardContainer: { flex: 1 }, scrollContent: { flexGrow: 1, paddingBottom: 48 }, content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24, maxWidth: 540, width: '100%', alignSelf: 'center' },
  header: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 }, headerTitle: { flex: 1, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 }, card: { borderWidth: 1, borderRadius: 24, padding: 24, shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 }, heroIcon: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  subtitle: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 26 }, field: { marginBottom: 20 }, label: { fontSize: 14, fontWeight: '700', marginBottom: 8 }, inputWrapper: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 15 }, input: { flex: 1, minHeight: 52, marginLeft: 10, fontSize: 16 }, error: { marginTop: 8, fontSize: 13, lineHeight: 18 }, button: { minHeight: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }, buttonText: { fontSize: 16, fontWeight: '800' }, secondaryButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center', marginTop: 10 }, secondaryButtonText: { fontSize: 15, fontWeight: '700' },
  statusIcon: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 18 }, statusTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 }, statusCopy: { fontSize: 15, lineHeight: 23, textAlign: 'center' }, tip: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 14, padding: 14, marginVertical: 22 }, tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
})
