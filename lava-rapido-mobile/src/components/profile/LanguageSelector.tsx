import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { changeLanguage, type LanguageCode } from '../../i18n'

type Props = { theme: { card: string; text: string; textSecondary: string }; darkMode: boolean }

const languages: LanguageCode[] = ['es', 'en', 'pt', 'fr']

export default function LanguageSelector({ theme, darkMode }: Props) {
  const { i18n: translationInstance, t } = useTranslation()
  const [visible, setVisible] = React.useState(false)
  const currentLanguage = (translationInstance.resolvedLanguage || translationInstance.language || 'es') as LanguageCode
  const selectedLanguage = languages.find(language => language === currentLanguage) ?? 'es'

  const selectLanguage = async (language: LanguageCode) => {
    await changeLanguage(language)
    setVisible(false)
  }

  return (
    <>
      <TouchableOpacity style={[styles.row, { borderColor: darkMode ? '#303B4A' : '#E5E7EB' }]} activeOpacity={0.7} onPress={() => setVisible(true)} accessibilityRole="button" accessibilityLabel={t('language.title')}>
        <View style={styles.left}>
          <View style={[styles.icon, { backgroundColor: darkMode ? '#263241' : '#EEF4FF' }]}><Ionicons name="language-outline" size={20} color="#2563EB" /></View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.text }]}>{t('language.title')}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>{t(`language.names.${selectedLanguage}`)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={darkMode ? '#667085' : '#94A3B8'} />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('language.select')}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} accessibilityLabel={t('language.close')}><Ionicons name="close" size={24} color={theme.textSecondary} /></TouchableOpacity>
            </View>
            {languages.map(language => {
              const selected = language === currentLanguage
              return <TouchableOpacity key={language} style={[styles.languageOption, { borderColor: darkMode ? '#303B4A' : '#E5E7EB' }]} onPress={() => selectLanguage(language)} accessibilityRole="radio" accessibilityState={{ selected }}>
                <View><Text style={[styles.languageName, { color: theme.text }]}>{t(`language.names.${language}`)}</Text><Text style={[styles.languageSubtitle, { color: theme.textSecondary }]}>{t(`language.englishNames.${language}`)}</Text></View>
                {selected && <Ionicons name="checkmark-circle" size={23} color="#2563EB" />}
              </TouchableOpacity>
            })}
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 2, borderBottomWidth: 0.5 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  textContainer: { flex: 1 }, title: { fontSize: 15, fontWeight: '700' }, description: { fontSize: 11.5, marginTop: 3 },
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15, 23, 42, 0.55)' }, modal: { borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, modalTitle: { fontSize: 18, fontWeight: '800' },
  languageOption: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0.5 }, languageName: { fontSize: 16, fontWeight: '700' }, languageSubtitle: { fontSize: 12, marginTop: 2 },
})
