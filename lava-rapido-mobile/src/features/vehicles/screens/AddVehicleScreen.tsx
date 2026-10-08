import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import BackButton from '../../../components/common/BackButton';
import { ThemeContext } from '../../../theme/ThemeContext';

import {
  Brand,
  Vehicle,
  VehicleRequest,
  VehicleType,
  vehicleService,
} from '../../../services/vehicleService';

type Props = {
  navigation: any;
  route: any;
};

const vehicleTypes: {
  value: VehicleType;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: 'CARRO',
    labelKey: 'vehicles.types.car',
    icon: 'car-sport-outline',
  },
  {
    value: 'CAMIONETA',
    labelKey: 'vehicles.types.pickup',
    icon: 'car-outline',
  },
  {
    value: 'MOTO',
    labelKey: 'vehicles.types.motorcycle',
    icon: 'bicycle-outline',
  },
  {
    value: 'MOTOCARRO',
    labelKey: 'vehicles.types.motortricycle',
    icon: 'car-outline',
  },
  {
    value: 'FURGONETA',
    labelKey: 'vehicles.types.van',
    icon: 'bus-outline',
  },
  {
    value: 'PESADO',
    labelKey: 'vehicles.types.heavy',
    icon: 'bus-outline',
  },
];

export default function AddVehicleScreen({
  navigation,
  route,
}: Props) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const vehicle: Vehicle | undefined =
    route?.params?.vehicle;

  const isEditing = Boolean(vehicle);

  const [placa, setPlaca] = useState(
    vehicle?.placa || '',
  );

  const [color, setColor] = useState(
    vehicle?.color || '',
  );

  const [tipoVehiculo, setTipoVehiculo] =
    useState<VehicleType>(
      vehicle?.tipoVehiculo || 'CARRO',
    );

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] =
    useState(vehicle?.idMarca || '');

  const [loadingBrands, setLoadingBrands] =
    useState(true);

  const [saving, setSaving] = useState(false);

  const [showBrands, setShowBrands] =
    useState(false);

  const [brandQuery, setBrandQuery] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const response =
        await vehicleService.getActiveBrands();

      setBrands(response.data);

      if (
        !vehicle &&
        response.data.length === 0
      ) {
        Alert.alert(
          t('vehicles.form.noBrandsTitle'),
          t('vehicles.form.noBrandsMessage'),
        );
      }
    } catch (error: any) {
      console.error(
        'Error cargando marcas:',
        error?.response?.status || error?.message,
      );

      Alert.alert(
        t('vehicles.errors.title'),
        t('vehicles.errors.brands'),
      );
    } finally {
      setLoadingBrands(false);
    }
  };

  const normalizePlate = (value: string) => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 7);
  };

  const validateForm = () => {
    const placaNormalizada = normalizePlate(placa);

    if (!placaNormalizada) {
      Alert.alert(
        t('vehicles.form.plateRequiredTitle'),
        t('vehicles.form.plateRequired'),
      );
      return false;
    }

    const plateRegex =
      /^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/;

    if (!plateRegex.test(placaNormalizada)) {
      Alert.alert(
        t('vehicles.form.plateInvalidTitle'),
        t('vehicles.form.plateInvalid'),
      );
      return false;
    }

    if (!selectedBrand) {
      Alert.alert(
        t('vehicles.form.brandRequiredTitle'),
        t('vehicles.form.brandRequired'),
      );
      return false;
    }

    if (!tipoVehiculo) {
      Alert.alert(
        t('vehicles.form.typeRequiredTitle'),
        t('vehicles.form.typeRequired'),
      );
      return false;
    }

    if (color.length > 30) {
      Alert.alert(
        t('vehicles.form.colorInvalidTitle'),
        t('vehicles.form.colorInvalid'),
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const data: VehicleRequest = {
      placa: normalizePlate(placa),
      color: color.trim(),
      tipoVehiculo,
      fkIdMarca: selectedBrand,
    };

    try {
      setSaving(true);

      if (isEditing && vehicle) {
        await vehicleService.update(
          vehicle.idVehiculo,
          data,
        );

        Alert.alert(
          t('vehicles.form.updatedTitle'),
          t('vehicles.form.updatedMessage'),
          [
            {
              text: t('common.accept'),
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        await vehicleService.create(data);

        Alert.alert(
          t('vehicles.form.createdTitle'),
          t('vehicles.form.createdMessage'),
          [
            {
              text: t('common.accept'),
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    } catch (error: any) {
      console.error(
        'Error guardando vehículo:',
        error?.response?.status || error?.message,
      );

      let message =
        t('vehicles.errors.save');

      if (error?.response?.status === 401) {
        message = t('vehicles.errors.unauthorized');
      } else if (error?.response?.status === 400) {
        message = t('vehicles.errors.badRequest');
      } else if (error?.response?.status === 409) {
        message = t('vehicles.errors.conflict');
      }

      Alert.alert(t('vehicles.errors.title'), message);
    } finally {
      setSaving(false);
    }
  };

  const selectedBrandObject = brands.find(
    (brand) => brand.idMarca === selectedBrand,
  );

  const filteredBrands = brands
    .filter((brand) =>
      brand.nombre
        .toLocaleLowerCase()
        .includes(brandQuery.trim().toLocaleLowerCase()),
    )
    .sort((firstBrand, secondBrand) =>
      firstBrand.nombre.localeCompare(secondBrand.nombre),
    );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <BackButton
          accessibilityLabel={t('mobile.serviceDetail.back')}
          onPress={() => navigation.goBack()}
          disabled={saving}
        />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {isEditing ? t('vehicles.form.editTitle') : t('vehicles.form.addTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={2}>
            {isEditing ? t('vehicles.form.editSubtitle') : t('vehicles.form.addSubtitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.introCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Ionicons
              name="car-sport-outline"
              size={26}
              color={theme.onPrimary}
            />
          </View>

          <View style={styles.introText}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              {t('vehicles.form.infoTitle')}
            </Text>

            <Text
              style={[
                styles.introDescription,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              {t('vehicles.form.infoDescription')}
            </Text>
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          {t('vehicles.fields.plate')}
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="card-outline"
            size={21}
            color={theme.primary}
          />

          <TextInput
            accessibilityLabel={t('vehicles.fields.plate')}
            value={placa}
            onChangeText={(value) =>
              setPlaca(normalizePlate(value))
            }
            placeholder={t('vehicles.form.plateExample')}
            placeholderTextColor={
              theme.textSecondary
            }
            autoCapitalize="characters"
            maxLength={7}
            style={[
              styles.input,
              {
                color: theme.text,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.helperText,
            {
              color: theme.textSecondary,
            },
          ]}
        >
          {t('vehicles.form.plateExample')}
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          {t('vehicles.fields.brand')}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('vehicles.fields.brand')}: ${loadingBrands ? t('vehicles.form.loadingBrands') : selectedBrandObject?.nombre || t('vehicles.form.selectBrand')}`}
          accessibilityState={{ disabled: loadingBrands || saving, busy: loadingBrands }}
          style={[
            styles.selectContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setShowBrands(true)}
          disabled={loadingBrands || saving}
        >
          <View style={styles.selectLeft}>
            <Ionicons
              name="pricetag-outline"
              size={21}
              color={theme.primary}
            />

            <Text
              style={[
                styles.selectText,
                {
                  color: selectedBrandObject
                    ? theme.text
                    : theme.textSecondary,
                },
              ]}
            >
              {loadingBrands
                ? t('vehicles.form.loadingBrands')
                : selectedBrandObject?.nombre ||
                  t('vehicles.form.selectBrand')}
            </Text>
          </View>

          {loadingBrands ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
            />
          ) : (
            <Ionicons
              name={
                'chevron-forward'
              }
              size={20}
              color={theme.textSecondary}
            />
          )}
        </Pressable>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          {t('vehicles.fields.type')}
        </Text>

        <View style={styles.typeGrid}>
          {vehicleTypes.map((type) => {
            const selected =
              tipoVehiculo === type.value;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={t(type.labelKey)}
                accessibilityState={{ selected, disabled: saving }}
                key={type.value}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: selected
                      ? theme.primarySoft
                      : theme.card,
                    borderColor: selected
                      ? theme.primary
                      : theme.border,
                  },
                ]}
                onPress={() =>
                  setTipoVehiculo(type.value)
                }
                disabled={saving}
              >
                <Ionicons
                  name={type.icon}
                  size={25}
                  color={
                    selected
                      ? theme.primary
                      : theme.textSecondary
                  }
                />

                <Text
                  style={[
                    styles.typeText,
                    {
                      color: selected
                        ? theme.primary
                        : theme.text,
                    },
                  ]}
                >
                  {t(type.labelKey)}
                </Text>

                {selected && (
                  <View
                    style={[
                      styles.selectedCheck,
                      {
                        backgroundColor:
                          theme.primary,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={11}
                      color={theme.onPrimary}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          {t('vehicles.fields.color')}
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="color-palette-outline"
            size={21}
            color={theme.primary}
          />

          <TextInput
            accessibilityLabel={t('vehicles.fields.color')}
            value={color}
            onChangeText={setColor}
            placeholder={t('vehicles.form.colorPlaceholder')}
            placeholderTextColor={
              theme.textSecondary
            }
            maxLength={30}
            style={[
              styles.input,
              {
                color: theme.text,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.helperText,
            {
              color: theme.textSecondary,
            },
          ]}
        >
          {t('vehicles.form.colorHelper')}
        </Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.primary,
              opacity: saving ? 0.7 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityState={{ disabled: saving, busy: saving }}
          accessibilityLiveRegion="polite"
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color={theme.onPrimary}
            />
          ) : (
            <Ionicons
              name={
                isEditing
                  ? 'checkmark-circle-outline'
                  : 'add-circle-outline'
              }
              size={22}
              color={theme.onPrimary}
            />
          )}

          <Text style={[styles.saveButtonText, { color: theme.onPrimary }]}>
            {saving
              ? t('vehicles.form.saving')
              : isEditing
              ? t('vehicles.form.saveChanges')
              : t('vehicles.actions.add')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cancelButton,
            {
              borderColor: theme.border,
              backgroundColor: theme.card,
            },
          ]}
          onPress={() => navigation.goBack()}
          disabled={saving}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.cancelButtonText,
              {
                color: theme.text,
              },
            ]}
          >
            {t('common.cancel')}
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showBrands}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBrands(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <View
            style={[
              styles.brandPicker,
              { backgroundColor: theme.background },
            ]}
          >
            <View
              style={[
                styles.brandPickerHandle,
                { backgroundColor: theme.border },
              ]}
            />

            <View style={styles.brandPickerHeader}>
              <View>
                <Text
                  style={[
                    styles.brandPickerTitle,
                    { color: theme.text },
                  ]}
                >
                  {t('vehicles.form.selectBrand')}
                </Text>
                <Text
                  style={[
                    styles.brandPickerSubtitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  {t('vehicles.form.brandsAvailable', { count: brands.length })}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('vehicles.form.closeBrandSelector')}
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.card },
                ]}
                onPress={() => setShowBrands(false)}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={theme.text}
                />
              </Pressable>
            </View>

            <View
              style={[
                styles.brandSearch,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={theme.textSecondary}
              />
              <TextInput
                accessibilityLabel={t('vehicles.form.searchBrand')}
                value={brandQuery}
                onChangeText={setBrandQuery}
                placeholder={t('vehicles.form.searchBrand')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="characters"
                autoCorrect={false}
                style={[
                  styles.brandSearchInput,
                  { color: theme.text },
                ]}
              />
              {brandQuery.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('vehicles.form.clearSearch')}
                  onPress={() => setBrandQuery('')}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}
            </View>

            <ScrollView
              style={styles.brandResults}
              contentContainerStyle={styles.brandResultsContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filteredBrands.length === 0 ? (
                <View style={styles.emptyBrands}>
                  <Ionicons
                    name="search-outline"
                    size={28}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.noBrandsText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {t('vehicles.form.noBrandResults')}
                  </Text>
                </View>
              ) : (
                filteredBrands.map((brand) => {
                  const selected = brand.idMarca === selectedBrand;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityLabel={brand.nombre}
                      accessibilityState={{ selected }}
                      key={brand.idMarca}
                      style={[
                        styles.brandOption,
                        {
                          backgroundColor: selected
                            ? theme.primarySoft
                            : theme.card,
                          borderColor: selected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedBrand(brand.idMarca);
                        setBrandQuery('');
                        setShowBrands(false);
                      }}
                    >
                      <View
                        style={[
                          styles.brandInitial,
                          {
                            backgroundColor: selected
                              ? theme.primary
                              : theme.primarySoft,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.brandInitialText,
                            {
                              color: selected
                                ? theme.onPrimary
                                : theme.primary,
                            },
                          ]}
                        >
                          {brand.nombre.charAt(0)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.brandOptionText,
                          {
                            color: theme.text,
                            fontWeight: selected ? '700' : '600',
                          },
                        ]}
                      >
                        {brand.nombre}
                      </Text>
                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={theme.primary}
                        />
                      )}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 18,
  },

  headerText: { flex: 1, minWidth: 0, marginLeft: 12 },

  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' },

  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 3 },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  introCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  formCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 18,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },

  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  introText: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  introDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 9,
    marginTop: 14,
  },

  inputContainer: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 11,
  },

  helperText: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 17,
    marginLeft: 3,
  },

  selectContainer: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  selectText: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    marginLeft: 11,
  },

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

  brandOptionText: {
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
  },

  noBrandsText: {
    textAlign: 'center',
    marginTop: 10,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },

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

  brandPickerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  brandPickerSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },

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

  brandSearchInput: {
    flex: 1,
    fontSize: 15,
    marginHorizontal: 10,
  },

  brandResults: {
    flex: 1,
  },

  brandResultsContent: {
    paddingBottom: 18,
  },

  brandInitial: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandInitialText: {
    fontSize: 15,
    fontWeight: '800',
  },

  emptyBrands: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 62,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  typeCard: {
    width: '47%',
    minWidth: 112,
    flexGrow: 1,
    minHeight: 82,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 4,
  },

  typeText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 7,
    textAlign: 'center',
  },

  selectedCheck: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButton: {
    minHeight: 58,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },

  cancelButton: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
