import React, { useContext, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'
import { useTranslation } from 'react-i18next'
import BackButton from '../../../components/common/BackButton'
import { authService } from '../../../services/authService'
import { isValidPassword, passwordsMatch } from '../../../services/passwordPolicy'

export default function ResetPasswordScreen({ navigation }: any) {
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const handleReset = async () => {
    if (!token.trim() || !password || !confirmPassword) {
      Alert.alert(
        t('resetPassword.incompleteTitle'),
        t('resetPassword.incompleteMessage'),
        undefined,
        'warning',
      )
      return
    }
    if (!passwordsMatch(password, confirmPassword)) {
      Alert.alert(
        t('resetPassword.errorTitle'),
        t('resetPassword.mismatch'),
        undefined,
        'warning',
      )
      return
    }
    if (!isValidPassword(password)) {
      Alert.alert(
        t('resetPassword.errorTitle'),
        t('accessibility.passwordRequirements'),
        undefined,
        'warning',
      )
      return
    }
    setSaving(true)
    try {
      await authService.resetPassword(token.trim(), password)
      Alert.alert(
        t('resetPassword.successTitle'),
        t('resetPassword.successMessage'),
        undefined,
        'success',
      )
      navigation.navigate('Login')
    } catch {
      Alert.alert(
        t('resetPassword.errorTitle'),
        t('accessibility.resetError'),
        undefined,
        'error',
      )
    } finally {
      setSaving(false)
    }
  }
  const passwordField = (placeholder: string, value: string, onChangeText: (text: string) => void, visible: boolean, toggle: () => void, icon: 'lock-closed-outline' | 'shield-checkmark-outline') => (
    <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
      <Ionicons name={icon} size={22} color={theme.primary} />
      <TextInput accessibilityLabel={placeholder} placeholder={placeholder} placeholderTextColor={theme.placeholder} secureTextEntry={!visible} value={value} onChangeText={onChangeText} autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: theme.text }]} />
      <TouchableOpacity onPress={toggle} hitSlop={8} accessibilityRole="button" accessibilityLabel={t(visible ? 'accessibility.hidePassword' : 'accessibility.showPassword')} accessibilityState={{ expanded: visible }}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textSecondary} /></TouchableOpacity>
    </View>
  )
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <BackButton accessibilityLabel={t('mobile.serviceDetail.back')} onPress={() => navigation.goBack()} />
              <Text accessibilityRole="header" style={[styles.headerTitle, { color: theme.text }]} numberOfLines={2}>{t('resetPassword.title')}</Text>
            </View>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" accessible={false} />
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('resetPassword.subtitle')}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Ionicons name="key-outline" size={22} color={theme.primary} />
              <TextInput placeholder={t('accessibility.resetToken')} accessibilityLabel={t('accessibility.resetToken')} placeholderTextColor={theme.placeholder} value={token} onChangeText={setToken} autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: theme.text }]} />
            </View>
            {passwordField(t('resetPassword.newPassword'), password, setPassword, showPassword, () => setShowPassword(!showPassword), 'lock-closed-outline')}
            {passwordField(t('resetPassword.confirmPassword'), confirmPassword, setConfirmPassword, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword), 'shield-checkmark-outline')}
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleReset} disabled={saving} accessibilityRole="button" accessibilityLabel={saving ? `${t('resetPassword.save')}, ${t('accessibility.inProgress')}` : t('resetPassword.save')} accessibilityState={{ disabled: saving, busy: saving }} activeOpacity={0.8}><Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('resetPassword.save')}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  safeArea: { flex: 1 }, keyboard: { flex: 1 }, scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  header: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  headerTitle: { flex: 1, minWidth: 0, fontSize: 22, fontWeight: '700' },
  logo: { width: '62%', maxWidth: 220, height: 150, alignSelf: 'center', marginBottom: 16 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  inputContainer: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  input: { flex: 1, minHeight: 50, marginHorizontal: 12, fontSize: 16 },
  button: { minHeight: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
})
