import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const { width } = Dimensions.get('window')

export default function LandingScreen() {

  const navigation = useNavigation<any>()
  const { t } = useTranslation()

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f0f4f8"
      />

      {/* 🚀 HERO */}
      <LinearGradient
        colors={['#f0f4f8', '#e3f0ff']}
        style={styles.hero}
      >

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            🚗 {t('landing.badge')}
          </Text>
        </View>

        <Text style={styles.title}>
          {t('landing.brand')}
        </Text>

        <Text style={styles.titleBlue}>
          {t('landing.brandAccent')}
        </Text>

        <Text style={styles.subtitle}>
          {t('landing.subtitle')}
        </Text>

        {/* 🔥 BOTONES */}
        <View style={styles.buttonsContainer}>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>
              {t('landing.start')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>
              {t('landing.register')}
            </Text>
          </TouchableOpacity>

        </View>

      </LinearGradient>

      {/* 📱 MOCKUP */}
      <View style={styles.mockupContainer}>

        <View style={styles.phone}>

          <LinearGradient
            colors={['#38afff', '#1a3a8f', '#1565c0']}
            style={styles.phoneGradient}
          >

            <View style={styles.phoneHeader}>
              <Text style={styles.phoneTitle}>
                {t('landing.mockupGreeting')}
              </Text>

              <Text style={styles.phoneSubtitle}>
                {t('landing.mockupReady')}
              </Text>
            </View>

            {/* CARD */}
            <View style={styles.card}>

              <View style={styles.cardRow}>

                <View>
                  <Text style={styles.cardTitle}>
                    {t('landing.premiumWash')}
                  </Text>

                  <Text style={styles.cardDescription}>
                    {t('landing.completeService')}
                  </Text>
                </View>

                <Text style={styles.active}>
                  {t('landing.active')}
                </Text>

              </View>

            </View>

            {/* TRACKING */}
            <View style={styles.card}>

              <Text style={styles.cardTitle}>
                {t('landing.realtimeTracking')}
              </Text>

              <View style={styles.progressBar}>
                <View style={styles.progress} />
              </View>

              <Text style={styles.progressText}>
                {t('landing.progress')}
              </Text>

            </View>

            {/* FEATURES */}
            <View style={styles.featuresGrid}>

              <View style={styles.smallCard}>
                <Ionicons
                  name="map"
                  size={28}
                  color="#1E6FB9"
                />

                <Text style={styles.smallCardTitle}>
                  {t('landing.map')}
                </Text>

                <Text style={styles.smallCardText}>
                  {t('landing.realtimeGps')}
                </Text>
              </View>

              <View style={styles.smallCard}>
                <Ionicons
                  name="person"
                  size={28}
                  color="#1E6FB9"
                />

                <Text style={styles.smallCardTitle}>
                  {t('landing.profile')}
                </Text>

                <Text style={styles.smallCardText}>
                  {t('landing.accountManagement')}
                </Text>
              </View>

            </View>

          </LinearGradient>

        </View>

      </View>

      {/* ✨ FEATURES */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          {t('landing.featuresTitle')}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {t('landing.featuresSubtitle')}
        </Text>

        <View style={styles.featureCard}>
          <Ionicons
            name="phone-portrait"
            size={35}
            color="#1E6FB9"
          />

          <Text style={styles.featureTitle}>
            {t('landing.mobileApp')}
          </Text>

          <Text style={styles.featureText}>
            {t('landing.mobileAppDescription')}
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons
            name="location"
            size={35}
            color="#1E6FB9"
          />

          <Text style={styles.featureTitle}>
            {t('landing.gpsTracking')}
          </Text>

          <Text style={styles.featureText}>
            {t('landing.gpsTrackingDescription')}
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons
            name="moon"
            size={35}
            color="#1E6FB9"
          />

          <Text style={styles.featureTitle}>
            {t('landing.darkTheme')}
          </Text>

          <Text style={styles.featureText}>
            {t('landing.darkThemeDescription')}
          </Text>
        </View>

      </View>

      {/* 🚀 CTA */}
      <LinearGradient
        colors={['#38afff', '#1a3a8f', '#1565c0']}
        style={styles.cta}
      >

        <Text style={styles.ctaTitle}>
          {t('landing.ctaTitle')}
        </Text>

        <Text style={styles.ctaText}>
          {t('landing.ctaText')}
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.ctaButtonText}>
            {t('landing.ctaButton')}
          </Text>
        </TouchableOpacity>

      </LinearGradient>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },

  hero: {
    paddingTop: 80,
    paddingHorizontal: 25,
    paddingBottom: 50,
  },

  badge: {
    backgroundColor: 'rgba(21,101,192,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(21,101,192,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 30,
    marginBottom: 20,
  },

  badgeText: {
    color: '#1565c0',
    fontWeight: '600',
  },

  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0d1f4c',
  },

  titleBlue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1E6FB9',
  },

  subtitle: {
    marginTop: 15,
    fontSize: 16,
    lineHeight: 24,
    color: '#5a6a85',
  },

  buttonsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 35,
  },

  primaryButton: {
    backgroundColor: '#1E6FB9',
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 18,
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#7FA9C4',
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 18,
  },

  secondaryButtonText: {
    color: '#1E6FB9',
    fontWeight: 'bold',
    fontSize: 16,
  },

  mockupContainer: {
    alignItems: 'center',
    marginTop: 10,
  },

  phone: {
    width: width * 0.82,
    height: 620,
    backgroundColor: '#e3f0ff',
    borderRadius: 40,
    padding: 10,
    elevation: 10,
  },

  phoneGradient: {
    flex: 1,
    borderRadius: 35,
    padding: 20,
  },

  phoneHeader: {
    marginBottom: 20,
  },

  phoneTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  phoneSubtitle: {
    color: '#D6EAF8',
    marginTop: 5,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  cardDescription: {
    color: '#6B7280',
    marginTop: 5,
  },

  active: {
    color: '#27AE60',
    fontWeight: 'bold',
  },

  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 15,
  },

  progress: {
    width: '75%',
    height: '100%',
    backgroundColor: '#1E6FB9',
  },

  progressText: {
    marginTop: 10,
    color: '#6B7280',
  },

  featuresGrid: {
    flexDirection: 'row',
    gap: 15,
  },

  smallCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
  },

  smallCardTitle: {
    marginTop: 10,
    fontWeight: 'bold',
  },

  smallCardText: {
    marginTop: 5,
    color: '#6B7280',
    fontSize: 12,
  },

  section: {
    padding: 25,
    marginTop: 30,
  },

  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
  },

  sectionSubtitle: {
    marginTop: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },

  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
  },

  featureTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: 'bold',
  },

  featureText: {
    marginTop: 10,
    color: '#6B7280',
    lineHeight: 22,
  },

  cta: {
    margin: 25,
    borderRadius: 35,
    padding: 35,
    alignItems: 'center',
    marginBottom: 40,
  },

  ctaTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
  },

  ctaText: {
    marginTop: 15,
    color: '#D6EAF8',
    textAlign: 'center',
    lineHeight: 24,
  },

  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 35,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 30,
  },

  ctaButtonText: {
    color: '#1E1E1E',
    fontWeight: 'bold',
    fontSize: 16,
  },

})
