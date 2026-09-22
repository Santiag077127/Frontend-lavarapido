import React, { useContext, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'
import { useTranslation } from 'react-i18next'

export default function ResetPasswordScreen({ navigation }: any) {
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const handleReset = () => {
    if (!password || !confirmPassword) {
      Alert.alert(t('resetPassword.incompleteTitle'), t('resetPassword.incompleteMessage'))
      return
    }
    if (password !== confirmPassword) {
      Alert.alert(t('resetPassword.errorTitle'), t('resetPassword.mismatch'))
      return
    }
    Alert.alert(t('resetPassword.successTitle'), t('resetPassword.successMessage'))
    navigation.navigate('Login')
  }
  const passwordField = (placeholder: string, value: string, onChangeText: (text: string) => void, visible: boolean, toggle: () => void, icon: 'lock-closed-outline' | 'shield-checkmark-outline') => (
    <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
      <Ionicons name={icon} size={22} color={theme.primary} />
      <TextInput placeholder={placeholder} placeholderTextColor={theme.placeholder} secureTextEntry={!visible} value={value} onChangeText={onChangeText} autoCapitalize="none" autoCorrect={false} style={[styles.input, { color: theme.text }]} />
      <TouchableOpacity onPress={toggle} hitSlop={8}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textSecondary} /></TouchableOpacity>
    </View>
  )
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.title, { color: theme.text }]}>{t('resetPassword.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('resetPassword.subtitle')}</Text>
            {passwordField(t('resetPassword.newPassword'), password, setPassword, showPassword, () => setShowPassword(!showPassword), 'lock-closed-outline')}
            {passwordField(t('resetPassword.confirmPassword'), confirmPassword, setConfirmPassword, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword), 'shield-checkmark-outline')}
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleReset} activeOpacity={0.8}><Text style={styles.buttonText}>{t('resetPassword.save')}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  safeArea: { flex: 1 }, keyboard: { flex: 1 }, scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 24 },
  logo: { width: '62%', maxWidth: 220, height: 150, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  inputContainer: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  input: { flex: 1, minHeight: 50, marginHorizontal: 12, fontSize: 16 },
  button: { minHeight: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
