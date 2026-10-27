import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { legalContent, type LegalDocument } from '../legalContent';
import { useTranslation } from 'react-i18next';

type Props = {
  document: LegalDocument | null;
  onClose: () => void;
  surfaceColor: string;
  textColor: string;
  secondaryTextColor: string;
  buttonColor: string;
  onPrimaryColor: string;
};

export default function RegisterLegalDocumentModal({
  document,
  onClose,
  surfaceColor,
  textColor,
  secondaryTextColor,
  buttonColor,
  onPrimaryColor,
}: Props) {
  const { t } = useTranslation();
  const content = document ? legalContent[document] : null;
  return (
    <Modal visible={document !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: surfaceColor }]}>
          {content ? <>
            <Text accessibilityRole="header" style={[styles.title, { color: textColor }]}>{content.title}</Text>
            <ScrollView style={styles.body}>
              <Text style={[styles.intro, { color: textColor }]}>{content.intro}</Text>
              {content.sections.map((section) => (
                <View key={section.title} style={styles.paragraph}>
                  <Text style={[styles.heading, { color: textColor }]}>{section.titleKey ? t(section.titleKey) : section.title}</Text>
                  <Text style={[styles.text, { color: secondaryTextColor }]}>{section.bodyKey ? t(section.bodyKey) : section.body}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={onClose} style={[styles.close, { backgroundColor: buttonColor }]}>
              <Text style={[styles.buttonText, { color: onPrimaryColor }]}>Cerrar</Text>
            </Pressable>
          </> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  modal: { maxHeight: '85%', borderRadius: 14, padding: 18 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  body: { flexGrow: 0 },
  intro: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  paragraph: { marginBottom: 12 },
  heading: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  text: { fontSize: 14, lineHeight: 21 },
  close: { alignSelf: 'flex-end', minWidth: 96, minHeight: 44, marginTop: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { fontSize: 18, fontWeight: '600' },
});
