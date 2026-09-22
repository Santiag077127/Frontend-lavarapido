import React, { useContext, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'
import { useTranslation } from 'react-i18next'

export default function ForgotPasswordScreen({ navigation }: any) {
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const handleSendCode = () => {
    if (!email.trim()) {
      Alert.alert(t('forgotPassword.errorTitle'), t('forgotPassword.emailRequired'))
      return
    }
    navigation.navigate('VerifyCode', { email })
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.title, { color: theme.text }]}>{t('forgotPassword.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('forgotPassword.subtitle')}</Text>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.text }]}>{t('forgotPassword.email')}</Text>
              <TextInput placeholder={t('forgotPassword.email')} placeholderTextColor={theme.placeholder} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="done" onSubmitEditing={handleSendCode} style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]} />
            </View>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSendCode} activeOpacity={0.8}><Text style={styles.buttonText}>{t('forgotPassword.sendCode')}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Text style={[styles.backText, { color: theme.primary }]}>{t('forgotPassword.backToLogin')}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, keyboardContainer: { flex: 1 }, scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 24 },
  logo: { width: '62%', maxWidth: 220, height: 150, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  field: { marginBottom: 24 }, label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  button: { minHeight: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backButton: { alignSelf: 'center', paddingVertical: 12, marginTop: 12 }, backText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
})
