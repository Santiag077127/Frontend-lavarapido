import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { sanitizeHumanText } from '../../../services/inputSanitizers';
import ScreenHeader from '../../../components/common/ScreenHeader';
import BrandPickerModal from '../components/BrandPickerModal';
import VehicleForm, { type VehicleTypeOption } from '../components/VehicleForm';
import { appAlert } from '../../../components/notifications/NotificationProvider';
import { ThemeContext } from '../../../theme/ThemeContext';
import { classifyApiError } from '../../../services/api';
import {
  normalizeVehiclePlateInput,
  validateVehiclePlate,
  vehiclePlateBackendValidationMessage,
} from '../../../services/vehiclePlate';
import {
  type Brand,
  type Vehicle,
  type VehicleRequest,
  type VehicleType,
  vehicleService,
} from '../../../services/vehicleService';

type Props = {
  navigation: any;
  route: any;
};

const vehicleTypes: VehicleTypeOption[] = [
  { value: 'CARRO', labelKey: 'vehicles.types.car', icon: 'car-sport-outline' },
  { value: 'CAMIONETA', labelKey: 'vehicles.types.pickup', icon: 'car-outline' },
  { value: 'MOTO', labelKey: 'vehicles.types.motorcycle', icon: 'bicycle-outline' },
  { value: 'MOTOCARRO', labelKey: 'vehicles.types.motortricycle', icon: 'car-outline' },
  { value: 'FURGONETA', labelKey: 'vehicles.types.van', icon: 'bus-outline' },
  { value: 'PESADO', labelKey: 'vehicles.types.heavy', icon: 'bus-outline' },
];

export default function AddVehicleScreen({ navigation, route }: Props) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const vehicle: Vehicle | undefined = route?.params?.vehicle;
  const isEditing = Boolean(vehicle);

  const [plate, setPlate] = useState(vehicle?.placa || '');
  const [vehicleColor, setVehicleColor] = useState(vehicle?.color || '');
  const [vehicleType, setVehicleType] = useState<VehicleType>(vehicle?.tipoVehiculo || 'CARRO');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState(vehicle?.idMarca || '');
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandsLoadError, setBrandsLoadError] = useState(false);
  const brandsLoadInProgress = useRef(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [showBrands, setShowBrands] = useState(false);
  const [brandQuery, setBrandQuery] = useState('');

  const loadBrands = async () => {
    if (brandsLoadInProgress.current) return;
    brandsLoadInProgress.current = true;
    try {
      setLoadingBrands(true);
      setBrandsLoadError(false);
      const response = await vehicleService.getActiveBrands();
      setBrands(response.data);
      if (!vehicle && response.data.length === 0) {
        appAlert.alert(
          t('vehicles.form.noBrandsTitle'),
          t('vehicles.form.noBrandsMessage'),
          undefined,
          'warning',
        );
      }
    } catch {
      setBrandsLoadError(true);
    } finally {
      setLoadingBrands(false);
      brandsLoadInProgress.current = false;
    }
  };

  useEffect(() => {
    void loadBrands();
  }, []);

  const plateValidation = validateVehiclePlate(plate, vehicleType);
  const plateHasValue = plate.trim().length > 0;
  const invalidPlate = plateHasValue && !plateValidation.isValid;
  const plateFormatMessage = `${t('vehicles.fields.type')}: ${t(
    vehicleTypes.find((type) => type.value === vehicleType)?.labelKey ?? 'vehicles.fields.type',
  )} · ${plateValidation.expectedFormat}`;

  const validateForm = () => {
    if (!plateValidation.normalized) {
      appAlert.alert(t('vehicles.form.plateRequiredTitle'), t('vehicles.form.plateRequired'), undefined, 'error');
      return false;
    }
    if (!plateValidation.isValid) {
      appAlert.alert(t('vehicles.form.plateInvalidTitle'), plateFormatMessage, undefined, 'error');
      return false;
    }
    if (!selectedBrandId) {
      appAlert.alert(t('vehicles.form.brandRequiredTitle'), t('vehicles.form.brandRequired'), undefined, 'error');
      return false;
    }
    if (!vehicleType) {
      appAlert.alert(t('vehicles.form.typeRequiredTitle'), t('vehicles.form.typeRequired'), undefined, 'error');
      return false;
    }
    if (vehicleColor.length > 30) {
      appAlert.alert(t('vehicles.form.colorInvalidTitle'), t('vehicles.form.colorInvalid'), undefined, 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (savingRef.current || !validateForm()) return;
    const data: VehicleRequest = {
      placa: plateValidation.normalized,
      color: vehicleColor.trim(),
      tipoVehiculo: vehicleType,
      fkIdMarca: selectedBrandId,
    };

    try {
      savingRef.current = true;
      setSaving(true);
      if (isEditing && vehicle) {
        await vehicleService.update(vehicle.idVehiculo, data);
        appAlert.alert(t('vehicles.form.updatedTitle'), t('vehicles.form.updatedMessage'), [
          { text: t('common.accept'), onPress: () => navigation.goBack() },
        ], 'success');
      } else {
        await vehicleService.create(data);
        appAlert.alert(t('vehicles.form.createdTitle'), t('vehicles.form.createdMessage'), [
          { text: t('common.accept'), onPress: () => navigation.goBack() },
        ], 'success');
      }
    } catch (error: unknown) {
      let message = t('vehicles.errors.save');
      const errorKind = classifyApiError(error);
      const responseData: unknown = axios.isAxiosError(error) ? error.response?.data : undefined;
      const backendValidationMessage = vehiclePlateBackendValidationMessage(responseData);
      const responseMessages = typeof responseData === 'string'
        ? [responseData]
        : responseData && typeof responseData === 'object'
          ? ['message', 'error', 'detail'].flatMap((key) => {
            const value = (responseData as Record<string, unknown>)[key];
            return typeof value === 'string' ? [value] : [];
          })
          : [];
      const duplicatePlate = responseMessages.some((value) =>
        value.toLocaleLowerCase().includes('ya existe un vehículo registrado con esa placa'),
      );

      if (['network', 'server_unavailable', 'timeout', 'server'].includes(errorKind)) {
        message = t(`apiErrors.${errorKind}`);
      } else if (errorKind === 'unauthorized') {
        return;
      } else if (axios.isAxiosError(error) && (error.response?.status === 409
        || (error.response?.status === 400 && duplicatePlate))) {
        message = t('vehicles.errors.conflict');
      } else if (axios.isAxiosError(error) && error.response?.status === 400 && backendValidationMessage) {
        message = backendValidationMessage;
      } else if (axios.isAxiosError(error) && [400, 422].includes(error.response?.status ?? 0)) {
        message = t('vehicles.errors.badRequest');
      }

      appAlert.alert(t('vehicles.errors.title'), message, undefined, 'error');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const selectedBrandName = brands.find((brand) => brand.idMarca === selectedBrandId)?.nombre;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader
          accessibilityLabel={t('mobile.serviceDetail.back')}
          disabled={saving}
          onBack={() => navigation.goBack()}
          style={{ marginHorizontal: 18, marginTop: 8 }}
          subtitle={isEditing ? t('vehicles.form.editSubtitle') : t('vehicles.form.addSubtitle')}
          title={isEditing ? t('vehicles.form.editTitle') : t('vehicles.form.addTitle')}
        />
        <ScrollView
          contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: Math.max(insets.bottom + 16, 24) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
        >
          <VehicleForm
            theme={theme}
            translate={t}
            vehicleTypes={vehicleTypes}
            isEditing={isEditing}
            plate={plate}
            onPlateChange={(value) => setPlate(normalizeVehiclePlateInput(value))}
            plateFormatMessage={plateFormatMessage}
            invalidPlate={invalidPlate}
            color={vehicleColor}
            onColorChange={(value) => setVehicleColor(sanitizeHumanText(value))}
            selectedBrandName={selectedBrandName}
            loadingBrands={loadingBrands}
            brandsLoadError={brandsLoadError}
            onOpenBrandPicker={() => setShowBrands(true)}
            onRetryBrandLoad={() => void loadBrands()}
            saving={saving}
            selectedVehicleType={vehicleType}
            onVehicleTypeChange={setVehicleType}
            onSave={() => void handleSave()}
            onCancel={() => navigation.goBack()}
          />
        </ScrollView>
        <BrandPickerModal
          visible={showBrands}
          brands={brands}
          selectedBrandId={selectedBrandId}
          query={brandQuery}
          onQueryChange={setBrandQuery}
          onSelect={(brandId) => {
            setSelectedBrandId(brandId);
            setBrandQuery('');
            setShowBrands(false);
          }}
          onClose={() => setShowBrands(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
});
