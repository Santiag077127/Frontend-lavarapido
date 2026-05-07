import React, { useEffect, useContext } from 'react'

import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity
} from 'react-native'

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated'

import { useNavigation } from '@react-navigation/native'

import { ThemeContext } from '../../../theme/ThemeContext'

const { height } = Dimensions.get('window')

export default function ServiceDetailScreen({ route }: any) {

  const { service } = route.params

  const navigation = useNavigation<any>()

  const { theme, darkMode } = useContext(ThemeContext)

  const translateY = useSharedValue(300)

  useEffect(() => {

    translateY.value = withTiming(0, {
      duration: 500
    })

  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background
        }
      ]}
    >

      <Image
        source={service.image}
        style={styles.image}
      />

      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          {
            backgroundColor: theme.card
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
          {service.title}
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: darkMode
                ? '#E5E5E5'
                : '#555'
            }
          ]}
        >
          {service.description}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('Reservation', {
              service: service
            })
          }
        >
          <Text style={styles.buttonText}>
            Reservar servicio
          </Text>
        </TouchableOpacity>

      </Animated.View>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  image: {
    width: '100%',
    height: height * 0.45,
  },

  card: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.5,

    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,

    padding: 20,

    elevation: 10,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: -2
    },

    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#1E6FB9',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

})