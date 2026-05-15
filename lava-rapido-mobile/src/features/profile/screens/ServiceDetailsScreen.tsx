import React, { useContext } from 'react'

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { ThemeContext } from '../../../theme/ThemeContext'

export default function ServiceDetailsScreen({ route, navigation }: any) {

  const { theme, darkMode } = useContext(ThemeContext)

  const { service } = route.params

  const renderStatusColor = (status: string) => {

    switch (status) {

      case 'En proceso':
        return '#F39C12'

      case 'Pendiente':
        return '#3498DB'

      case 'Finalizado':
        return '#27AE60'

      default:
        return '#999'
    }
  }

  return (

    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: theme.background
        }
      ]}
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

        <View style={styles.iconContainer}>
          <Ionicons
            name="car-sport"
            size={40}
            color="#fff"
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: theme.text
            }
          ]}
        >
          {service.title}
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                renderStatusColor(service.status)
            }
          ]}
        >

          <Text style={styles.statusText}>
            {service.status}
          </Text>

        </View>

      </View>

      {/* INFO */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card
          }
        ]}
      >

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text
            }
          ]}
        >
          Información del servicio
        </Text>

        <View style={styles.infoRow}>

          <Ionicons
            name="calendar-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>
            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666'
                }
              ]}
            >
              Fecha
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text
                }
              ]}
            >
              {service.date}
            </Text>
          </View>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="location-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>
            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666'
                }
              ]}
            >
              Dirección
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text
                }
              ]}
            >
              {service.address}
            </Text>
          </View>

        </View>

        <View style={styles.infoRow}>

          <Ionicons
            name="cash-outline"
            size={22}
            color="#1E6FB9"
          />

          <View style={styles.infoContent}>
            <Text
              style={[
                styles.label,
                {
                  color: darkMode
                    ? '#BDBDBD'
                    : '#666'
                }
              ]}
            >
              Precio
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color: theme.text
                }
              ]}
            >
              $45.000 COP
            </Text>
          </View>

        </View>

      </View>

      {/* ESTADO */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card
          }
        ]}
      >

        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text
            }
          ]}
        >
          Estado del proceso
        </Text>

        <View style={styles.timeline}>

          <View style={styles.step}>
            <View style={styles.activeDot} />

            <Text
              style={[
                styles.stepText,
                {
                  color: theme.text
                }
              ]}
            >
              Reserva confirmada
            </Text>
          </View>

          <View style={styles.line} />

          <View style={styles.step}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    service.status === 'En proceso'
                      || service.status === 'Finalizado'
                      ? '#1E6FB9'
                      : '#ccc'
                }
              ]}
            />

            <Text
              style={[
                styles.stepText,
                {
                  color: theme.text
                }
              ]}
            >
              Vehículo en servicio
            </Text>
          </View>

          <View style={styles.line} />

          <View style={styles.step}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    service.status === 'Finalizado'
                      ? '#27AE60'
                      : '#ccc'
                }
              ]}
            />

            <Text
              style={[
                styles.stepText,
                {
                  color: theme.text
                }
              ]}
            >
              Servicio finalizado
            </Text>
          </View>

        </View>

      </View>

      {/* BOTONES */}
      <View style={styles.actions}>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() =>
            navigation.navigate('Map')
          }
        >

          <Ionicons
            name="map-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.trackText}>
            Ver seguimiento
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },

  header: {
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E6FB9',

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 50,
  },

  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  card: {
    borderRadius: 22,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  infoContent: {
    marginLeft: 15,
  },

  label: {
    fontSize: 13,
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
  },

  timeline: {
    marginTop: 10,
  },

  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#27AE60',
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  line: {
    width: 2,
    height: 35,
    backgroundColor: '#ccc',
    marginLeft: 6,
    marginVertical: 4,
  },

  stepText: {
    marginLeft: 15,
    fontSize: 15,
  },

  actions: {
    marginBottom: 40,
  },

  trackButton: {
    backgroundColor: '#1E6FB9',
    height: 55,
    borderRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',
  },

  trackText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },

})