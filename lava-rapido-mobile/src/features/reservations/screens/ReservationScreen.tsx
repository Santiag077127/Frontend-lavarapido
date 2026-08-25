import React, { useContext, useState } from 'react'

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform
} from 'react-native'

import DateTimePicker from '@react-native-community/datetimepicker'

import { Ionicons } from '@expo/vector-icons'

import { ThemeContext } from '../../../theme/ThemeContext'

export default function ReservationScreen({ route, navigation }: any) {

  const { theme, darkMode } = useContext(ThemeContext)

  const [vehicle, setVehicle] = useState('')
  const [plate, setPlate] = useState('')
  const [address, setAddress] = useState('')

  const [date, setDate] = useState(new Date())

  const [showDate, setShowDate] = useState(false)

  // 🔥 CORRECCIÓN
  const service = route?.params?.service

  // 🔥 VALIDACIÓN
  if (!service) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 18
          }}
        >
          No hay servicio seleccionado
        </Text>
      </View>
    )
  }

  const handleReservation = () => {

    if (!vehicle || !plate || !address) {

      Alert.alert(
        'Campos incompletos',
        'Por favor completa todos los campos.'
      )

      return
    }

    Alert.alert(
      'Reserva realizada',
      `Tu servicio ${service.title} fue reservado correctamente.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MainTabs')
        }
      ]
    )
  }

  return (

    <ScrollView
      style={{
        backgroundColor: theme.background
      }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card
          }
        ]}
      >

        <View style={styles.headerTop}>

          <View>

            <Text
              style={[
                styles.label,
                {
                  color: darkMode ? '#BDBDBD' : '#666'
                }
              ]}
            >
              Servicio seleccionado
            </Text>

            <Text
              style={[
                styles.serviceTitle,
                {
                  color: theme.text
                }
              ]}
            >
              {service.title}
            </Text>

          </View>

          <View style={styles.serviceIcon}>
            <Ionicons
              name="car-sport"
              size={30}
              color="#fff"
            />
          </View>

        </View>

      </View>

      {/* FORMULARIO */}
      <View
        style={[
          styles.form,
          {
            backgroundColor: theme.card
          }
        ]}
      >

        {/* VEHÍCULO */}
        <Text
          style={[
            styles.inputLabel,
            {
              color: theme.text
            }
          ]}
        >
          Vehículo
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: darkMode
                ? '#1E1E1E'
                : '#F2F4F5'
            }
          ]}
        >

          <Ionicons
            name="car-outline"
            size={20}
            color="#1E6FB9"
          />

          <TextInput
            placeholder="Ej: Mazda 3"
            placeholderTextColor={darkMode ? '#888' : '#777'}
            value={vehicle}
            onChangeText={setVehicle}
            style={[
              styles.input,
              {
                color: theme.text
              }
            ]}
          />

        </View>

        {/* PLACA */}
        <Text
          style={[
            styles.inputLabel,
            {
              color: theme.text
            }
          ]}
        >
          Placa
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: darkMode
                ? '#1E1E1E'
                : '#F2F4F5'
            }
          ]}
        >

          <Ionicons
            name="barcode-outline"
            size={20}
            color="#1E6FB9"
          />

          <TextInput
            placeholder="ABC123"
            placeholderTextColor={darkMode ? '#888' : '#777'}
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
            style={[
              styles.input,
              {
                color: theme.text
              }
            ]}
          />

        </View>

        {/* DIRECCIÓN */}
        <Text
          style={[
            styles.inputLabel,
            {
              color: theme.text
            }
          ]}
        >
          Dirección
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: darkMode
                ? '#1E1E1E'
                : '#F2F4F5'
            }
          ]}
        >

          <Ionicons
            name="location-outline"
            size={20}
            color="#1E6FB9"
          />

          <TextInput
            placeholder="Cra 8 # 6-71"
            placeholderTextColor={darkMode ? '#888' : '#777'}
            value={address}
            onChangeText={setAddress}
            style={[
              styles.input,
              {
                color: theme.text
              }
            ]}
          />

        </View>

        {/* FECHA */}
        <Text
          style={[
            styles.inputLabel,
            {
              color: theme.text
            }
          ]}
        >
          Fecha y hora
        </Text>

        <TouchableOpacity
          style={[
            styles.dateButton,
            {
              backgroundColor: darkMode
                ? '#1E1E1E'
                : '#F2F4F5'
            }
          ]}
          onPress={() => setShowDate(true)}
        >

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >

            <Ionicons
              name="calendar-outline"
              size={20}
              color="#1E6FB9"
            />

            <Text
              style={[
                styles.dateText,
                {
                  color: theme.text
                }
              ]}
            >
              {date.toLocaleString()}
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.text}
          />

        </TouchableOpacity>

        {showDate && (

          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {

              // 🔥 ANDROID FIX
              if (Platform.OS === 'android') {
                setShowDate(false)
              }

              if (selectedDate) {
                setDate(selectedDate)
              }
            }}
          />

        )}

        {/* RESUMEN */}
        <View
          style={[
            styles.summary,
            {
              backgroundColor: darkMode
                ? '#1A2634'
                : '#EAF4FC'
            }
          ]}
        >

          <Text
            style={[
              styles.summaryTitle,
              {
                color: theme.text
              }
            ]}
          >
            Resumen de la reserva
          </Text>

          <View style={styles.summaryRow}>

            <Text
              style={{
                color: theme.text
              }}
            >
              Servicio
            </Text>

            <Text
              style={{
                color: '#1E6FB9',
                fontWeight: 'bold'
              }}
            >
              {service.title}
            </Text>

          </View>

          <View style={styles.summaryRow}>

            <Text
              style={{
                color: theme.text
              }}
            >
              Estado
            </Text>

            <Text
              style={{
                color: '#27AE60',
                fontWeight: 'bold'
              }}
            >
              Pendiente
            </Text>

          </View>

        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleReservation}
        >

          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#fff"
          />

          <Text style={styles.buttonText}>
            Confirmar reserva
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,

    elevation: 4,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
  },

  serviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E6FB9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  form: {
    borderRadius: 25,
    padding: 20,

    elevation: 4,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },

  dateButton: {
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 15,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateText: {
    marginLeft: 10,
    fontSize: 15,
  },

  summary: {
    borderRadius: 18,
    padding: 18,
    marginTop: 25,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  button: {
    marginTop: 30,
    backgroundColor: '#1E6FB9',
    height: 58,
    borderRadius: 18,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 5,

    shadowColor: '#1E6FB9',

    shadowOffset: {
      width: 0,
      height: 3
    },

    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },

})