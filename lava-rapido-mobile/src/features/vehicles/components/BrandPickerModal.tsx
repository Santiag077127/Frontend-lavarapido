import React, { useContext } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { sanitizeHumanText } from '../../../services/inputSanitizers';
import type { Brand } from '../../../services/vehicleService';
import { ThemeContext } from '../../../theme/ThemeContext';

type Props = {
  visible: boolean;
  brands: Brand[];
  selectedBrandId: string;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (brandId: string) => void;
  onClose: () => void;
};

export default function BrandPickerModal({
  visible,
  brands,
  selectedBrandId,
  query,
  onQueryChange,
  onSelect,
  onClose,
}: Props) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const filteredBrands = brands
    .filter((brand) =>
      brand.nombre
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
    )
    .sort((firstBrand, secondBrand) =>
      firstBrand.nombre.localeCompare(secondBrand.nombre),
    );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.brandPicker, { backgroundColor: theme.background }]}>
          <View style={[styles.brandPickerHandle, { backgroundColor: theme.border }]} />

          <View style={styles.brandPickerHeader}>
            <View>
              <Text style={[styles.brandPickerTitle, { color: theme.text }]}>
                {t('vehicles.form.selectBrand')}
              </Text>
              <Text style={[styles.brandPickerSubtitle, { color: theme.textSecondary }]}>
                {t('vehicles.form.brandsAvailable', { count: brands.length })}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('vehicles.form.closeBrandSelector')}
              style={[styles.closeButton, { backgroundColor: theme.card }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </Pressable>
          </View>

          <View style={[styles.brandSearch, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
            <TextInput
              accessibilityLabel={t('vehicles.form.searchBrand')}
              value={query}
              onChangeText={(value) => onQueryChange(sanitizeHumanText(value))}
              placeholder={t('vehicles.form.searchBrand')}
              placeholderTextColor={theme.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[styles.brandSearchInput, { color: theme.text }]}
            />
            {query.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('vehicles.form.clearSearch')}
                onPress={() => onQueryChange('')}
              >
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </Pressable>
            )}
          </View>

          <ScrollView
            style={styles.brandResults}
            contentContainerStyle={styles.brandResultsContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
            showsVerticalScrollIndicator={false}
          >
            {filteredBrands.length === 0 ? (
              <View style={styles.emptyBrands}>
                <Ionicons name="search-outline" size={28} color={theme.textSecondary} />
                <Text style={[styles.noBrandsText, { color: theme.textSecondary }]}>
                  {t('vehicles.form.noBrandResults')}
                </Text>
              </View>
            ) : (
              filteredBrands.map((brand) => {
                const selected = brand.idMarca === selectedBrandId;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityLabel={brand.nombre}
                    accessibilityState={{ selected }}
                    key={brand.idMarca}
                    style={[
                      styles.brandOption,
                      {
                        backgroundColor: selected ? theme.primarySoft : theme.card,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => onSelect(brand.idMarca)}
                  >
                    <View
                      style={[
                        styles.brandInitial,
                        { backgroundColor: selected ? theme.primary : theme.primarySoft },
                      ]}
                    >
                      <Text
                        style={[
                          styles.brandInitialText,
                          { color: selected ? theme.onPrimary : theme.primary },
                        ]}
                      >
                        {brand.nombre.charAt(0)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.brandOptionText,
                        { color: theme.text, fontWeight: selected ? '700' : '600' },
                      ]}
                    >
                      {brand.nombre}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  brandPicker: {
    height: '84%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  brandPickerHandle: {
    width: 42,
    height: 5,
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  brandPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },
  brandPickerTitle: { fontSize: 20, fontWeight: '800' },
  brandPickerSubtitle: { fontSize: 13, marginTop: 3 },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSearch: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  brandSearchInput: { flex: 1, fontSize: 15, marginHorizontal: 10 },
  brandResults: { flex: 1 },
  brandResultsContent: { paddingBottom: 18 },
  brandInitial: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitialText: { fontSize: 15, fontWeight: '800' },
  emptyBrands: { alignItems: 'center', justifyContent: 'center', paddingTop: 62 },
  noBrandsText: { textAlign: 'center', marginTop: 10 },
  brandOption: {
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 9,
  },
  brandOptionText: { fontSize: 14, flex: 1, marginLeft: 12 },
});
