import React, { useContext, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemeContext } from '../../../theme/ThemeContext'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'
import { useTranslation } from 'react-i18next'

export default function VerifyCodeScreen({ navigation }: any) {
  const { theme } = useContext(ThemeContext)
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const handleVerify = () => {
    if (code.length < 6) {
      Alert.alert(t('verifyCode.errorTitle'), t('verifyCode.codeRequired'))
      return
    }
    navigation.navigate('ResetPassword')
  }
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.title, { color: theme.text }]}>{t('verifyCode.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('verifyCode.subtitle')}</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color={theme.primary} />
              <TextInput placeholder="123456" placeholderTextColor={theme.placeholder} value={code} onChangeText={setCode} keyboardType="numeric" maxLength={6} returnKeyType="done" onSubmitEditing={handleVerify} style={[styles.input, { color: theme.text }]} />
            </View>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleVerify} activeOpacity={0.8}><Text style={styles.buttonText}>{t('verifyCode.button')}</Text></TouchableOpacity>
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
  inputContainer: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 24 },
  input: { flex: 1, paddingHorizontal: 12, fontSize: 20, textAlign: 'center', fontWeight: '600', letterSpacing: 4 },
  button: { minHeight: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
