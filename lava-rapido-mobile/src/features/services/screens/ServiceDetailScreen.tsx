import React, { useContext, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { RootStackParamList } from '../../../navigation/types';
import { ThemeContext } from '../../../theme/ThemeContext';
import BackButton from '../../../components/common/BackButton';
import { formatCurrency } from '../../../utils/formatters';
import { images } from '../../../assets/images';

type ServiceDetailRouteProp = RouteProp<RootStackParamList, 'ServiceDetail'>;
type ServiceDetailNavigationProp = NavigationProp<RootStackParamList>;

export default function ServiceDetailScreen() {
  const navigation = useNavigation<ServiceDetailNavigationProp>();
  const route = useRoute<ServiceDetailRouteProp>();
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { service } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleReservation = () => navigation.navigate('Reservation', { service });

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BackButton
            accessibilityLabel={t('mobile.serviceDetail.back')}
            onPress={() => navigation.goBack()}
          />
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {t('mobile.serviceDetail.title')}
          </Text>
        </View>

        <Animated.View
          style={[
            styles.detailContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Image
              source={images.ServicioBasico}
              style={[styles.image, { backgroundColor: theme.border }]}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />

            <View style={styles.cardContent}>
              <Text style={[styles.serviceName, { color: theme.text }]}>
                {service.nombre}
              </Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {service.descripcion || t('mobile.serviceDetail.descriptionUnavailable')}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: `${theme.primary}18` }]}>
                <Ionicons name="time-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                {t('mobile.serviceDetail.duration')}
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]} adjustsFontSizeToFit numberOfLines={1}>
                {service.duracionMinutos} {t('mobile.serviceDetail.minutes')}
              </Text>
            </View>

            <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: `${theme.primary}18` }]}>
                <Ionicons name="cash-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                {t('mobile.serviceDetail.price')}
              </Text>
              <Text style={[styles.infoValue, styles.price, { color: theme.primary }]} adjustsFontSizeToFit numberOfLines={1}>
                {formatCurrency(service.precio)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: service.estado ? `${theme.primary}12` : theme.errorBackground,
                borderColor: service.estado ? `${theme.primary}35` : theme.errorBorder,
              },
            ]}
          >
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: service.estado ? '#16a34a' : theme.errorText },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.text }]}>
              {service.estado
                ? t('mobile.serviceDetail.available')
                : t('mobile.serviceDetail.unavailable')}
            </Text>
            <Ionicons
              name={service.estado ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={20}
              color={service.estado ? '#16a34a' : theme.errorText}
            />
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            disabled={!service.estado}
            onPress={handleReservation}
            style={[
              styles.reserveButton,
              { backgroundColor: service.estado ? theme.primary : theme.border },
            ]}
          >
            <Text
              style={[
                styles.reserveButtonText,
                { color: service.estado ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {service.estado
                ? t('mobile.serviceDetail.reserve')
                : t('mobile.serviceDetail.unavailable')}
            </Text>
            {service.estado && <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 28, gap: 16 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { flex: 1, minWidth: 0, fontSize: 20, fontWeight: '800' },
  detailContent: { gap: 14 },
  card: { borderWidth: 1, borderRadius: 24, overflow: 'hidden', elevation: 3, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 8 },
  image: { width: '100%', aspectRatio: 1.7 },
  cardContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, gap: 8 },
  serviceName: { fontSize: 25, lineHeight: 31, fontWeight: '800' },
  description: { fontSize: 15, lineHeight: 23 },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoCard: { flex: 1, minWidth: 0, minHeight: 132, justifyContent: 'center', alignItems: 'flex-start', gap: 7, borderWidth: 1, borderRadius: 20, padding: 15, elevation: 1 },
  metricIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  infoLabel: { flexShrink: 1, fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 17, fontWeight: '800' },
  price: { fontSize: 21 },
  statusCard: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 17, paddingHorizontal: 16 },
  statusIndicator: { width: 9, height: 9, borderRadius: 5 },
  statusText: { flex: 1, fontSize: 14, fontWeight: '700' },
  reserveButton: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 17, paddingHorizontal: 18, elevation: 3, shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 5 },
  reserveButtonText: { flexShrink: 1, textAlign: 'center', fontSize: 16, fontWeight: '800' },
});
