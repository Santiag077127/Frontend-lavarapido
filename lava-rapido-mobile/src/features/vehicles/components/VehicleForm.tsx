import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { VehicleType } from '../../../services/vehicleService';

export type VehicleTypeOption = {
  value: VehicleType;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  theme: any;
  translate: (key: string) => string;
  vehicleTypes: VehicleTypeOption[];
  isEditing: boolean;
  plate: string;
  onPlateChange: (value: string) => void;
  plateFormatMessage: string;
  invalidPlate: boolean;
  color: string;
  onColorChange: (value: string) => void;
  selectedBrandName?: string;
  loadingBrands: boolean;
  brandsLoadError: boolean;
  onOpenBrandPicker: () => void;
  onRetryBrandLoad: () => void;
  saving: boolean;
  selectedVehicleType: VehicleType;
  onVehicleTypeChange: (type: VehicleType) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function VehicleForm({
  theme,
  translate: t,
  vehicleTypes,
  isEditing,
  plate,
  onPlateChange,
  plateFormatMessage,
  invalidPlate,
  color,
  onColorChange,
  selectedBrandName,
  loadingBrands,
  brandsLoadError,
  onOpenBrandPicker,
  onRetryBrandLoad,
  saving,
  selectedVehicleType,
  onVehicleTypeChange,
  onSave,
  onCancel,
}: Props) {
  const brandName = selectedBrandName || t('vehicles.form.selectBrand');

  return (
    <>
      <View style={[styles.introCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.introIcon, { backgroundColor: theme.primary }]}>
          <Ionicons name="car-sport-outline" size={26} color={theme.onPrimary} />
        </View>
        <View style={styles.introText}>
          <Text style={[styles.introTitle, { color: theme.text }]}>{t('vehicles.form.infoTitle')}</Text>
          <Text style={[styles.introDescription, { color: theme.textSecondary }]}>{t('vehicles.form.infoDescription')}</Text>
        </View>
      </View>

      <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('vehicles.fields.plate')}</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="card-outline" size={21} color={theme.primary} />
          <TextInput
            accessibilityLabel={t('vehicles.fields.plate')}
            value={plate}
            onChangeText={onPlateChange}
            placeholder={t('vehicles.form.plateExample')}
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="characters"
            maxLength={6}
            style={[styles.input, { color: theme.text }]}
          />
        </View>
        <Text
          accessibilityRole={invalidPlate ? 'alert' : undefined}
          accessibilityLiveRegion="polite"
          style={[styles.helperText, { color: invalidPlate ? theme.errorText : theme.textSecondary }]}
        >
          {plateFormatMessage}
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('vehicles.fields.brand')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('vehicles.fields.brand')}: ${loadingBrands ? t('vehicles.form.loadingBrands') : brandName}`}
          accessibilityState={{ disabled: loadingBrands || brandsLoadError || saving, busy: loadingBrands }}
          style={[styles.selectContainer, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onOpenBrandPicker}
          disabled={loadingBrands || brandsLoadError || saving}
        >
          <View style={styles.selectLeft}>
            <Ionicons name="pricetag-outline" size={21} color={theme.primary} />
            <Text style={[styles.selectText, { color: selectedBrandName ? theme.text : theme.textSecondary }]}>
              {loadingBrands ? t('vehicles.form.loadingBrands') : brandName}
            </Text>
          </View>
          {loadingBrands
            ? <ActivityIndicator size="small" color={theme.primary} />
            : <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />}
        </Pressable>

        {brandsLoadError ? (
          <View style={[styles.brandLoadError, { backgroundColor: theme.errorBackground, borderColor: theme.errorBorder }]}>
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.brandLoadErrorText, { color: theme.errorText }]}>
              {t('vehicles.errors.brands')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: loadingBrands, busy: loadingBrands }}
              disabled={loadingBrands}
              onPress={onRetryBrandLoad}
            >
              {loadingBrands ? <ActivityIndicator color={theme.primary} /> : <Text style={[styles.brandRetryText, { color: theme.primary }]}>{t('common.retry')}</Text>}
            </Pressable>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('vehicles.fields.type')}</Text>
        <View style={styles.typeGrid}>
          {vehicleTypes.map((type) => {
            const selected = selectedVehicleType === type.value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={t(type.labelKey)}
                accessibilityState={{ selected, disabled: saving }}
                key={type.value}
                style={[styles.typeCard, {
                  backgroundColor: selected ? theme.primarySoft : theme.card,
                  borderColor: selected ? theme.primary : theme.border,
                }]}
                onPress={() => onVehicleTypeChange(type.value)}
                disabled={saving}
              >
                <Ionicons name={type.icon} size={25} color={selected ? theme.primary : theme.textSecondary} />
                <Text style={[styles.typeText, { color: selected ? theme.primary : theme.text }]}>{t(type.labelKey)}</Text>
                {selected ? <View style={[styles.selectedCheck, { backgroundColor: theme.primary }]}>
                  <Ionicons name="checkmark" size={11} color={theme.onPrimary} />
                </View> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('vehicles.fields.color')}</Text>
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="color-palette-outline" size={21} color={theme.primary} />
          <TextInput
            accessibilityLabel={t('vehicles.fields.color')}
            value={color}
            onChangeText={onColorChange}
            placeholder={t('vehicles.form.colorPlaceholder')}
            placeholderTextColor={theme.textSecondary}
            maxLength={30}
            style={[styles.input, { color: theme.text }]}
          />
        </View>
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>{t('vehicles.form.colorHelper')}</Text>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary, opacity: saving || invalidPlate ? 0.7 : 1 }]}
          onPress={onSave}
          disabled={saving || invalidPlate}
          accessibilityRole="button"
          accessibilityState={{ disabled: saving || invalidPlate, busy: saving }}
          accessibilityLiveRegion="polite"
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator size="small" color={theme.onPrimary} />
            : <Ionicons name={isEditing ? 'checkmark-circle-outline' : 'add-circle-outline'} size={22} color={theme.onPrimary} />}
          <Text style={[styles.saveButtonText, { color: theme.onPrimary }]}>
            {saving ? t('vehicles.form.saving') : isEditing ? t('vehicles.form.saveChanges') : t('vehicles.actions.add')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.border, backgroundColor: theme.card }]}
          onPress={onCancel}
          disabled={saving}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={[styles.cancelButtonText, { color: theme.text }]}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  introCard: { borderRadius: 20, borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  introIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  introText: { flex: 1, marginLeft: 13 },
  introTitle: { fontSize: 15, fontWeight: '800' },
  introDescription: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  formCard: { borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 18, elevation: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 9, marginTop: 14 },
  inputContainer: { minHeight: 58, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 15, marginLeft: 11, minHeight: 52, paddingVertical: 8 },
  helperText: { fontSize: 11, marginTop: 6, marginBottom: 17, marginLeft: 3 },
  selectContainer: { minHeight: 58, borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  selectText: { flex: 1, minWidth: 0, fontSize: 15, marginLeft: 11 },
  brandLoadError: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLoadErrorText: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 18 },
  brandRetryText: { fontSize: 14, fontWeight: '700' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  typeCard: { width: '47%', minWidth: 112, flexGrow: 1, minHeight: 82, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative', paddingHorizontal: 4 },
  typeText: { fontSize: 12, fontWeight: '700', marginTop: 7, textAlign: 'center' },
  selectedCheck: { position: 'absolute', top: 7, right: 7, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  saveButton: { minHeight: 58, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  saveButtonText: { fontSize: 15, fontWeight: '800' },
  cancelButton: { height: 52, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  cancelButtonText: { fontSize: 15, fontWeight: '700' },
});
