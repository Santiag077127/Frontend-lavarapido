import React, { useContext } from 'react'

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { useNavigation } from '@react-navigation/native'

import { ThemeContext } from '../../../theme/ThemeContext'

const services = [
  {
    id: '1',
    title: 'Lavado Premium',
    date: '15 Mayo - 3:00 PM',
    status: 'En proceso',
    address: 'Cra 8 # 6-71',
  },

  {
    id: '2',
    title: 'Lavado Completo',
    date: '18 Mayo - 10:00 AM',
    status: 'Pendiente',
    address: 'Av 26 # 15-20',
  },

  {
    id: '3',
    title: 'Polichado',
    date: '10 Mayo - 1:00 PM',
    status: 'Finalizado',
    address: 'Calle 12 # 8-40',
  },
]

export default function MyServicesScreen() {

  const navigation = useNavigation<any>()

  const { theme, darkMode } = useContext(ThemeContext)

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

    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background
        }
      ]}
    >

      <Text
        style={[
          styles.title,
          {
            color: theme.text
          }
        ]}
      >
        Mis Servicios
      </Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40
        }}
        renderItem={({ item }) => (

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.card
              }
            ]}
          >

            {/* HEADER */}
            <View style={styles.top}>

              <View>

                <Text
                  style={[
                    styles.serviceTitle,
                    {
                      color: theme.text
                    }
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.date,
                    {
                      color: darkMode
                        ? '#BDBDBD'
                        : '#666'
                    }
                  ]}
                >
                  {item.date}
                </Text>

              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      renderStatusColor(item.status)
                  }
                ]}
              >

                <Text style={styles.statusText}>
                  {item.status}
                </Text>

              </View>

            </View>

            {/* ADDRESS */}
            <View style={styles.infoRow}>

              <Ionicons
                name="location-outline"
                size={18}
                color="#1E6FB9"
              />

              <Text
                style={[
                  styles.infoText,
                  {
                    color: theme.text
                  }
                ]}
              >
                {item.address}
              </Text>

            </View>

            {/* BUTTONS */}
            <View style={styles.actions}>

              {/* SEGUIMIENTO */}
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() =>
                  navigation.navigate('Map')
                }
              >

                <Ionicons
                  name="map-outline"
                  size={18}
                  color="#fff"
                />

                <Text style={styles.trackText}>
                  Seguimiento
                </Text>

              </TouchableOpacity>

              {/* VER DETALLES */}
              <TouchableOpacity
                style={[
                  styles.detailsButton,
                  {
                    borderColor: '#1E6FB9'
                  }
                ]}
                onPress={() =>
                  navigation.navigate(
                    'ServiceDetails',
                    {
                      service: item
                    }
                  )
                }
              >

                <Text
                  style={[
                    styles.detailsText,
                    {
                      color: '#1E6FB9'
                    }
                  ]}
                >
                  Ver detalles
                </Text>

              </TouchableOpacity>

            </View>

          </View>
        )}
      />

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,

    elevation: 4,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  serviceTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },

  date: {
    marginTop: 5,
    fontSize: 14,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },

  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  infoText: {
    marginLeft: 10,
    fontSize: 15,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },

  trackButton: {
    flex: 1,
    backgroundColor: '#1E6FB9',
    height: 50,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',
  },

  trackText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  detailsButton: {
    flex: 1,
    borderWidth: 1.5,
    height: 50,
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsText: {
    fontWeight: 'bold',
  },

})