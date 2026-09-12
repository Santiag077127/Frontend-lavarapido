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
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: 'CARRO',
    label: 'Carro',
    icon: 'car-sport-outline',
  },
  {
    value: 'CAMIONETA',
    label: 'Camioneta',
    icon: 'car-outline',
  },
  {
    value: 'MOTO',
    label: 'Moto',
    icon: 'bicycle-outline',
  },
  {
    value: 'MOTOCARRO',
    label: 'Motocarro',
    icon: 'car-outline',
  },
  {
    value: 'FURGONETA',
    label: 'Furgoneta',
    icon: 'bus-outline',
  },
  {
    value: 'PESADO',
    label: 'Pesado',
    icon: 'bus-outline',
  },
];

export default function AddVehicleScreen({
  navigation,
  route,
}: Props) {
  const { theme } = useContext(ThemeContext);

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
          'Sin marcas disponibles',
          'No hay marcas activas disponibles en el catálogo.',
        );
      }
    } catch (error: any) {
      console.error(
        'Error cargando marcas:',
        error?.response?.data || error,
      );

      Alert.alert(
        'Error',
        error?.response?.data ||
          'No se pudieron cargar las marcas.',
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
        'Placa requerida',
        'Ingresa la placa del vehículo.',
      );
      return false;
    }

    const plateRegex =
      /^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/;

    if (!plateRegex.test(placaNormalizada)) {
      Alert.alert(
        'Placa inválida',
        'La placa debe tener el formato ABC123 o ABC12A.',
      );
      return false;
    }

    if (!selectedBrand) {
      Alert.alert(
        'Marca requerida',
        'Selecciona la marca del vehículo.',
      );
      return false;
    }

    if (!tipoVehiculo) {
      Alert.alert(
        'Tipo requerido',
        'Selecciona el tipo de vehículo.',
      );
      return false;
    }

    if (color.length > 30) {
      Alert.alert(
        'Color inválido',
        'El color no puede superar los 30 caracteres.',
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
          'Vehículo actualizado',
          'Los datos del vehículo fueron actualizados correctamente.',
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      } else {
        await vehicleService.create(data);

        Alert.alert(
          'Vehículo agregado',
          'El vehículo fue registrado correctamente.',
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    } catch (error: any) {
      console.error(
        'Error guardando vehículo:',
        error?.response?.data || error,
      );

      let message =
        'No se pudo guardar el vehículo.';

      if (typeof error?.response?.data === 'string') {
        message = error.response.data;
      } else if (
        error?.response?.data?.message
      ) {
        message = error.response.data.message;
      }

      Alert.alert('Error', message);
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
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>

        <View>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            {isEditing
              ? 'Editar vehículo'
              : 'Agregar vehículo'}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textSecondary,
              },
            ]}
          >
            {isEditing
              ? 'Actualiza la información'
              : 'Registra tu vehículo'}
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
              backgroundColor:
                theme.primary + '12',
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
              color="#fff"
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
              Información del vehículo
            </Text>

            <Text
              style={[
                styles.introDescription,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Ingresa los datos de tu vehículo
              para utilizarlo en tus reservas.
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Placa
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
            value={placa}
            onChangeText={(value) =>
              setPlaca(normalizePlate(value))
            }
            placeholder="ABC123"
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
          Ejemplo: ABC123 o ABC12A
        </Text>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Marca
        </Text>

        <Pressable
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
                ? 'Cargando marcas...'
                : selectedBrandObject?.nombre ||
                  'Selecciona una marca'}
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
          Tipo de vehículo
        </Text>

        <View style={styles.typeGrid}>
          {vehicleTypes.map((type) => {
            const selected =
              tipoVehiculo === type.value;

            return (
              <Pressable
                key={type.value}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: selected
                      ? theme.primary + '15'
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
                  {type.label}
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
                      color="#fff"
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
          Color
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
            value={color}
            onChangeText={setColor}
            placeholder="Ejemplo: Rojo"
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
          Opcional · Máximo 30 caracteres
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
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <Ionicons
              name={
                isEditing
                  ? 'checkmark-circle-outline'
                  : 'add-circle-outline'
              }
              size={22}
              color="#fff"
            />
          )}

          <Text style={styles.saveButtonText}>
            {saving
              ? 'Guardando...'
              : isEditing
              ? 'Guardar cambios'
              : 'Agregar vehículo'}
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
            Cancelar
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showBrands}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBrands(false)}
      >
        <View style={styles.modalBackdrop}>
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
                  Selecciona una marca
                </Text>
                <Text
                  style={[
                    styles.brandPickerSubtitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  {brands.length} marcas disponibles
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Cerrar selector de marcas"
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
                value={brandQuery}
                onChangeText={setBrandQuery}
                placeholder="Buscar marca"
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
                  accessibilityLabel="Limpiar búsqueda"
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
                    No encontramos esa marca.
                  </Text>
                </View>
              ) : (
                filteredBrands.map((brand) => {
                  const selected = brand.idMarca === selectedBrand;

                  return (
                    <Pressable
                      key={brand.idMarca}
                      style={[
                        styles.brandOption,
                        {
                          backgroundColor: selected
                            ? theme.primary + '14'
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
                              : theme.primary + '16',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.brandInitialText,
                            {
                              color: selected
                                ? '#fff'
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 3,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  introCard: {
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
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
    fontWeight: '700',
    marginBottom: 9,
    marginTop: 6,
  },

  inputContainer: {
    minHeight: 54,
    borderRadius: 14,
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
    minHeight: 54,
    borderRadius: 14,
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
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
    width: '31.5%',
    minHeight: 92,
    borderRadius: 14,
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
    height: 54,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },

  saveButtonText: {
    color: '#fff',
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
