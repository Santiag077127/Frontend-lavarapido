
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  Picker,
} from '@react-native-picker/picker';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  ThemeContext,
} from '../../../theme/ThemeContext';

import {
  vehicleService,
} from '../services/vehicleService';

import {
  CreateVehicleData,
  TipoVehiculo,
} from '../types/vehicle.types';

import {
  brandService,
} from '../../brands/services/brandService';

import {
  Brand,
} from '../../brands/types/brand.types';


export default function RegisterVehicleScreen() {

  const navigation = useNavigation<any>();

  const {
    theme,
    darkMode,
  } = useContext(ThemeContext);


  // ─────────────────────────────────────────────
  // ESTADOS
  // ─────────────────────────────────────────────

  const [
    placa,
    setPlaca,
  ] = useState('');

  const [
    color,
    setColor,
  ] = useState('');

  const [
    tipoVehiculo,
    setTipoVehiculo,
  ] = useState<TipoVehiculo>('CARRO');

  const [
    idMarca,
    setIdMarca,
  ] = useState('');

  const [
    marcas,
    setMarcas,
  ] = useState<Brand[]>([]);

  const [
    loadingMarcas,
    setLoadingMarcas,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  // ─────────────────────────────────────────────
  // CARGAR MARCAS
  // ─────────────────────────────────────────────

  const loadMarcas = useCallback(async () => {

    try {

      setLoadingMarcas(true);
      setError(null);

      const data =
        await brandService.getActiveBrands();

      setMarcas(data);

      if (data.length > 0) {
        setIdMarca(data[0].idMarca);
      }

    } catch (err: any) {

      console.error(
        'ERROR CARGANDO MARCAS:',
        err
      );

      if (err?.response?.status === 401) {

        setError(
          'Tu sesión ha expirado. Inicia sesión nuevamente.'
        );

      } else if (err?.response?.status === 404) {

        setError(
          'No se encontró el catálogo de marcas.'
        );

      } else {

        setError(
          'No fue posible cargar las marcas. Verifica la conexión con el servidor.'
        );
      }

    } finally {

      setLoadingMarcas(false);
    }

  }, []);


  useEffect(() => {

    loadMarcas();

  }, [loadMarcas]);


  // ─────────────────────────────────────────────
  // VALIDAR PLACA
  // ─────────────────────────────────────────────

  const validarPlaca = (
    valor: string
  ): boolean => {

    const placaNormalizada =
      valor
        .trim()
        .toUpperCase();

    return /^[A-Z]{3}[0-9]{3}$/.test(
      placaNormalizada
    ) ||
    /^[A-Z]{3}[0-9]{2}[A-Z]$/.test(
      placaNormalizada
    );
  };


  // ─────────────────────────────────────────────
  // ERROR DEL BACKEND
  // ─────────────────────────────────────────────

  const getErrorMessage = (
    err: any
  ): string => {

    const status =
      err?.response?.status;

    const backendMessage =
      err?.response?.data;

    if (
      typeof backendMessage === 'string' &&
      backendMessage.trim()
    ) {
      return backendMessage;
    }

    if (
      backendMessage?.message
    ) {
      return backendMessage.message;
    }

    switch (status) {

      case 400:
        return 'Los datos del vehículo no son válidos.';

      case 401:
        return 'Tu sesión ha expirado. Inicia sesión nuevamente.';

      case 403:
        return 'No tienes permisos para registrar este vehículo.';

      case 404:
        return 'La marca seleccionada no existe.';

      case 409:
        return 'Ya existe un vehículo registrado con esa placa.';

      case 500:
        return 'Ocurrió un error en el servidor.';

      default:
        return 'No fue posible registrar el vehículo. Verifica tu conexión.';
    }
  };


  // ─────────────────────────────────────────────
  // REGISTRAR VEHÍCULO
  // ─────────────────────────────────────────────

  const handleRegister = async () => {

    setError(null);

    const placaNormalizada =
      placa
        .trim()
        .toUpperCase();


    // Validación placa

    if (!placaNormalizada) {

      setError(
        'La placa es obligatoria.'
      );

      return;
    }


    if (!validarPlaca(placaNormalizada)) {

      setError(
        'La placa debe tener el formato ABC123 o ABC12A.'
      );

      return;
    }


    // Validación marca

    if (!idMarca) {

      setError(
        'Debes seleccionar una marca.'
      );

      return;
    }


    // Validación tipo

    if (!tipoVehiculo) {

      setError(
        'Debes seleccionar un tipo de vehículo.'
      );

      return;
    }


    const data: CreateVehicleData = {

      placa:
        placaNormalizada,

      color:
        color.trim()
          ? color.trim()
          : undefined,

      tipoVehiculo,

      fkIdMarca:
        idMarca,
    };


    try {

      setLoading(true);

      await vehicleService.create(
        data
      );

      // Regresamos a ReservationScreen.
      // ReservationScreen recargará los vehículos
      // al recuperar el foco.

      navigation.goBack();

    } catch (err: any) {

      console.error(
        'ERROR REGISTRANDO VEHÍCULO:',
        err
      );

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);
    }
  };


  // ─────────────────────────────────────────────
  // COLORES
  // ─────────────────────────────────────────────

  const backgroundColor =
    theme.background;

  const textColor =
    theme.text;

  const inputBackground =
    theme.card;

  const borderColor =
    darkMode
      ? '#444'
      : '#D6D6D6';


  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (

    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ───────────────── HEADER ───────────────── */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
            disabled={loading}
          >

            <Ionicons
              name="arrow-back"
              size={24}
              color={textColor}
            />

          </TouchableOpacity>


          <View style={styles.headerTextContainer}>

            <Text
              style={[
                styles.title,
                {
                  color: textColor,
                },
              ]}
            >
              Registrar vehículo
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    darkMode
                      ? '#BDBDBD'
                      : '#666',
                },
              ]}
            >
              Agrega un vehículo para poder reservar servicios.
            </Text>

          </View>

        </View>


        {/* ───────────────── ICONO ───────────────── */}

        <View
          style={[
            styles.vehicleIconContainer,
            {
              backgroundColor:
                darkMode
                  ? '#1E2A24'
                  : '#EAF7EF',
            },
          ]}
        >

          <Ionicons
            name="car-sport"
            size={42}
            color={theme.primary}
          />

        </View>


        {/* ───────────────── ERROR ───────────────── */}

        {error && (

          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor:
                  darkMode
                    ? '#3A2020'
                    : '#FDECEC',
                borderColor:
                  darkMode
                    ? '#7A3333'
                    : '#F2B8B8',
              },
            ]}
          >

            <Ionicons
              name="alert-circle"
              size={21}
              color="#D32F2F"
            />

            <Text
              style={[
                styles.errorText,
                {
                  color:
                    darkMode
                      ? '#FFB4AB'
                      : '#B3261E',
                },
              ]}
            >
              {error}
            </Text>

          </View>

        )}


        {/* ───────────────── PLACA ───────────────── */}

        <View style={styles.field}>

          <Text
            style={[
              styles.label,
              {
                color: textColor,
              },
            ]}
          >
            Placa *
          </Text>

          <TextInput
            value={placa}
            onChangeText={(value) =>
              setPlaca(
                value
                  .replace(/\s/g, '')
                  .toUpperCase()
              )
            }
            placeholder="Ej: ABC123"
            placeholderTextColor={
              darkMode
                ? '#888'
                : '#999'
            }
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            editable={!loading}
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor:
                  inputBackground,
                borderColor,
              },
            ]}
          />

          <Text
            style={[
              styles.helperText,
              {
                color:
                  darkMode
                    ? '#999'
                    : '#777',
              },
            ]}
          >
            Formatos permitidos: ABC123 o ABC12A
          </Text>

        </View>


        {/* ───────────────── COLOR ───────────────── */}

        <View style={styles.field}>

          <Text
            style={[
              styles.label,
              {
                color: textColor,
              },
            ]}
          >
            Color
          </Text>

          <TextInput
            value={color}
            onChangeText={setColor}
            placeholder="Ej: Blanco"
            placeholderTextColor={
              darkMode
                ? '#888'
                : '#999'
            }
            maxLength={30}
            editable={!loading}
            style={[
              styles.input,
              {
                color: textColor,
                backgroundColor:
                  inputBackground,
                borderColor,
              },
            ]}
          />

          <Text
            style={[
              styles.helperText,
              {
                color:
                  darkMode
                    ? '#999'
                    : '#777',
              },
            ]}
          >
            Campo opcional
          </Text>

        </View>


        {/* ───────────────── TIPO ───────────────── */}

        <View style={styles.field}>

          <Text
            style={[
              styles.label,
              {
                color: textColor,
              },
            ]}
          >
            Tipo de vehículo *
          </Text>

          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor:
                  inputBackground,
                borderColor,
              },
            ]}
          >

            <Picker
              selectedValue={
                tipoVehiculo
              }
              enabled={!loading}
              onValueChange={(
                value
              ) =>
                setTipoVehiculo(
                  value as TipoVehiculo
                )
              }
              style={{
                color: textColor,
              }}
            >

              <Picker.Item
                label="Carro"
                value="CARRO"
              />

              <Picker.Item
                label="Camioneta"
                value="CAMIONETA"
              />

              <Picker.Item
                label="Moto"
                value="MOTO"
              />

              <Picker.Item
                label="Motocarro"
                value="MOTOCARRO"
              />

              <Picker.Item
                label="Furgoneta"
                value="FURGONETA"
              />

              <Picker.Item
                label="Pesado"
                value="PESADO"
              />

            </Picker>

          </View>

        </View>


        {/* ───────────────── MARCA ───────────────── */}

        <View style={styles.field}>

          <Text
            style={[
              styles.label,
              {
                color: textColor,
              },
            ]}
          >
            Marca *
          </Text>


          {loadingMarcas ? (

            <View
              style={[
                styles.loadingContainer,
                {
                  backgroundColor:
                    inputBackground,
                  borderColor,
                },
              ]}
            >

              <ActivityIndicator
                size="small"
                color={theme.primary}
              />

              <Text
                style={[
                  styles.loadingText,
                  {
                    color: textColor,
                  },
                ]}
              >
                Cargando marcas...
              </Text>

            </View>

          ) : marcas.length === 0 ? (

            <View
              style={[
                styles.emptyBrands,
                {
                  backgroundColor:
                    inputBackground,
                  borderColor,
                },
              ]}
            >

              <Ionicons
                name="information-circle-outline"
                size={22}
                color={theme.primary}
              />

              <Text
                style={[
                  styles.emptyBrandsText,
                  {
                    color: textColor,
                  },
                ]}
              >
                No hay marcas disponibles en el catálogo.
              </Text>

            </View>

          ) : (

            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor:
                    inputBackground,
                  borderColor,
                },
              ]}
            >

              <Picker
                selectedValue={
                  idMarca
                }
                enabled={!loading}
                onValueChange={(
                  value
                ) =>
                  setIdMarca(
                    value
                  )
                }
                style={{
                  color: textColor,
                }}
              >

                {marcas.map(
                  (marca) => (

                    <Picker.Item
                      key={
                        marca.idMarca
                      }
                      label={
                        marca.nombre
                      }
                      value={
                        marca.idMarca
                      }
                    />

                  )
                )}

              </Picker>

            </View>

          )}

        </View>


        {/* ───────────────── BOTÓN ───────────────── */}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                theme.primary,

              opacity:
                loading ||
                loadingMarcas ||
                marcas.length === 0
                  ? 0.6
                  : 1,
            },
          ]}
          onPress={
            handleRegister
          }
          disabled={
            loading ||
            loadingMarcas ||
            marcas.length === 0
          }
        >

          {loading ? (

            <ActivityIndicator
              color="#FFFFFF"
            />

          ) : (

            <>
              <Ionicons
                name="save-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Registrar vehículo
              </Text>
            </>

          )}

        </TouchableOpacity>


        {/* ───────────────── CANCELAR ───────────────── */}

        <TouchableOpacity
          style={[
            styles.cancelButton,
            {
              borderColor:
                theme.primary,
            },
          ]}
          onPress={() =>
            navigation.goBack()
          }
          disabled={loading}
        >

          <Text
            style={[
              styles.cancelButtonText,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            Cancelar
          </Text>

        </TouchableOpacity>


        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

    </KeyboardAvoidingView>
  );
}


// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 25,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },

    headerTextContainer: {
      flex: 1,
    },

    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 5,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 20,
    },

    vehicleIconContainer: {
      width: 82,
      height: 82,
      borderRadius: 41,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 25,
    },

    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      padding: 13,
      marginBottom: 20,
      gap: 9,
    },

    errorText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 19,
    },

    field: {
      marginBottom: 19,
    },

    label: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 8,
    },

    input: {
      height: 52,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      fontSize: 16,
    },

    helperText: {
      fontSize: 12,
      marginTop: 6,
    },

    pickerContainer: {
      borderWidth: 1,
      borderRadius: 12,
      overflow: 'hidden',
      minHeight: 52,
      justifyContent: 'center',
    },

    loadingContainer: {
      minHeight: 52,
      borderWidth: 1,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      gap: 10,
    },

    loadingText: {
      fontSize: 14,
    },

    emptyBrands: {
      minHeight: 70,
      borderWidth: 1,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      gap: 10,
    },

    emptyBrandsText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 19,
    },

    primaryButton: {
      height: 54,
      borderRadius: 13,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 9,
      marginTop: 8,
    },

    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    cancelButton: {
      height: 52,
      borderWidth: 1.5,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    },

    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },

    bottomSpace: {
      height: 20,
    },

  });

