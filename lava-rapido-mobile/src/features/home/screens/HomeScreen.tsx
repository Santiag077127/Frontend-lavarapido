import React, { useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { images } from '../../../assets/images'
import { useNavigation, NavigationProp } from '@react-navigation/native'
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

  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const { theme } = useContext(ThemeContext)

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

  return (

    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.background }
      ]}
      showsVerticalScrollIndicator={false}
    >

      {/* 🔍 BUSCADOR */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.card }
        ]}
      >
        <TextInput
          placeholder="Buscar servicios..."
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.searchInput,
            { color: theme.text }
          ]}
        />

        <Ionicons
          name="search"
          size={20}
          color={theme.text}
        />
      </View>

      {/* 🔐 LOGIN */}
      {!isLoggedIn && (
        <View
          style={[
            styles.loginCard,
            { backgroundColor: theme.card }
          ]}
        >
          <Text
            style={[
              styles.loginText,
              { color: theme.text }
            ]}
          >
            Inicia sesión para reservar 🚗
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={() => navigation.navigate('Login')}
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
      )}

      {/* 🚗 SERVICIOS */}
      {services.map((item) => (

        <TouchableOpacity
          key={item.id}
          style={[
            styles.card,
            { backgroundColor: theme.card }
          ]}
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
                { color: theme.text }
              ]}
            >
              {item.title}
            </Text>

            <Text
              style={[
                styles.description,
                { color: theme.textSecondary }
              ]}
            >
              {item.description}
            </Text>

          </View>

        </TouchableOpacity>

      ))}

    </ScrollView>
  )
}

/* 🎨 ESTILOS */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 15,
  },

  /* 🔍 SEARCH */
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 30,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginVertical: 15,
    height: 50,
    justifyContent: 'space-between',
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
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
    marginTop: 10,

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
    fontSize: 12,
    lineHeight: 18,
  },

})