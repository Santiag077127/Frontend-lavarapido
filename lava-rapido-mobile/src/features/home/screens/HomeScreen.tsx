import React, { useContext, useState } from 'react'

import {
  View,
  Text,
 StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Platform,
  StatusBar,
  FlatList
} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'

import { images } from '../../../assets/images'

import {
  useNavigation,
  NavigationProp
} from '@react-navigation/native'

import { ThemeContext } from '../../../theme/ThemeContext'

/* 🔹 TIPOS */
type RootStackParamList = {
  ServiceDetail: {
    service: {
      id: number
      title: string
      description: string
      image: any
    }
  }

  Login: undefined
}

type Props = {
  isLoggedIn: boolean
}

export default function HomeScreen({ isLoggedIn }: Props) {

  const navigation =
    useNavigation<NavigationProp<RootStackParamList>>()

  const { theme } = useContext(ThemeContext)

  const [search, setSearch] = useState('')

  const services = [
    {
      id: 1,
      title: 'Lavado Básico',
      description:
        'Limpieza de carrocería, aplicación de shampoo, secado a mano y limpieza de rines.',
      image: images.ServicioBasico
    },

    {
      id: 2,
      title: 'Lavado de Motor',
      description:
        'Limpieza técnica con desengrasantes especiales.',
      image: images.ServicioMotor
    },

    {
      id: 3,
      title: 'Aspirado Profundo',
      description:
        'Alfombras, asientos, baúl y rincones de difícil acceso.',
      image: images.ServicioAspirado
    },

    {
      id: 4,
      title: 'Lavado de Tapicería',
      description:
        'Limpieza con máquinas de inyección y succión.',
      image: images.ServicioTapiceria
    },

    {
      id: 5,
      title: 'Pulido y Abrillantado',
      description:
        'Eliminación de micro-rayones y restauración del brillo.',
      image: images.ServicioPulido
    },

    {
      id: 6,
      title: 'Encerado Profesional',
      description:
        'Protección con ceras de alta calidad.',
      image: images.ServicioEncerado
    }
  ]

  /* 🔍 FILTRAR SERVICIOS */
  const filteredServices = services.filter((service) =>
    service.title
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (

    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background
        }
      ]}
    >

      {/* 🔍 BUSCADOR FIJO */}
      <View
        style={[
          styles.searchWrapper,
          {
            backgroundColor: theme.background
          }
        ]}
      >

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.card
            }
          ]}
        >

          <Ionicons
            name="search"
            size={20}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />

          <TextInput
            placeholder="Buscar servicios..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={[
              styles.searchInput,
              {
                color: theme.text
              }
            ]}
          />

        </View>

      </View>

      {/* 🚗 LISTA */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: 40,
          paddingTop: 10
        }}
        ListHeaderComponent={
          !isLoggedIn ? (

            <View
              style={[
                styles.loginCard,
                {
                  backgroundColor: theme.card
                }
              ]}
            >

              <Text
                style={[
                  styles.loginText,
                  {
                    color: theme.text
                  }
                ]}
              >
                Inicia sesión para reservar 🚗
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed
                ]}
                onPress={() =>
                  navigation.navigate('Login')
                }
              >

                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color="#fff"
                />

                <Text style={styles.buttonText}>
                  Iniciar Sesión
                </Text>

              </Pressable>

            </View>

          ) : null
        }
        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: theme.card
              }
            ]}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('ServiceDetail', {
                service: item
              })
            }
          >

            <Image
              source={item.image}
              style={styles.image}
            />

            <View style={styles.textContainer}>

              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text
                  }
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    color: theme.textSecondary
                  }
                ]}
              >
                {item.description}
              </Text>

            </View>

          </TouchableOpacity>

        )}
      />

    </SafeAreaView>
  )
}

/* 🎨 ESTILOS */
const styles = StyleSheet.create({

  safeArea: {
  flex: 1,
  },

  /* 🔍 WRAPPER */
  searchWrapper: {
  paddingHorizontal: 15,
  paddingTop: 2,
  paddingBottom: 5,
  zIndex: 10,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    height: 55,

    borderRadius: 18,

    paddingHorizontal: 15,

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },

    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
  },

  /* 🔐 LOGIN */
  loginCard: {
    padding: 15,
    borderRadius: 18,
    marginBottom: 15,

    elevation: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  loginText: {
    marginBottom: 10,
    fontWeight: '600',
    fontSize: 15,
  },

  button: {
    flexDirection: 'row',
    backgroundColor: '#1E6FB9',

    width: '100%',
    height: 55,

    borderRadius: 15,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 5,

    elevation: 5,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3
    },

    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  /* 🚗 CARDS */
  card: {
    flexDirection: 'row',

    borderRadius: 18,

    padding: 10,
    marginBottom: 15,

    elevation: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
  },

})