import React, { useContext } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemeContext } from '../../../theme/ThemeContext';
import type { ReservationResponse, ReservationStatus } from '../types/reservation.types';

type Props = {
  reservation: ReservationResponse;
  cancelling: boolean;
  cancellable: boolean;
  onCancel: (reservation: ReservationResponse) => void;
  onOpenDetails: (reservation: ReservationResponse) => void;
};

function formatDate(date: string) {
  if (!date) return '--';
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatTime(time: string) {
  if (!time) return '--';
  return time.substring(0, 5);
}

function formatPrice(price: number) {
  return `$${Number(price || 0).toLocaleString('es-CO')}`;
}

export default function ReservationCard({
  reservation,
  cancelling,
  cancellable,
  onCancel,
  onOpenDetails,
}: Props) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const getStatusConfig = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return {
          label: t('mobile.reservationDetail.status.pending'),
          color: theme.warningText,
          background: theme.warningBackground,
          icon: 'time-outline' as const,
        };
      case 'ASIGNADA':
        return {
          label: t('mobile.reservationDetail.status.assigned'),
          color: theme.infoText,
          background: theme.infoBackground,
          icon: 'checkmark-circle-outline' as const,
        };
      case 'EN_PROCESO':
        return {
          label: t('mobile.reservationDetail.status.inProcess'),
          color: theme.inProgressText,
          background: theme.processBackground,
          icon: 'water-outline' as const,
        };
      case 'FINALIZADA':
        return {
          label: t('mobile.reservationDetail.status.finished'),
          color: theme.successText,
          background: theme.successBackground,
          icon: 'checkmark-done-circle-outline' as const,
        };
      case 'CANCELADA':
        return {
          label: t('mobile.reservationDetail.status.cancelled'),
          color: theme.errorText,
          background: theme.errorBackground,
          icon: 'close-circle-outline' as const,
        };
      default:
        return {
          label: t('mobile.reservations.unknown'),
          color: theme.textSecondary,
          background: theme.interactiveSurface,
          icon: 'help-circle-outline' as const,
        };
    }
  };

  const status = getStatusConfig(reservation.estado);
  const primaryColor = theme.primary;
  const textColor = theme.text;
  const mutedColor = theme.textSecondary;
  const showCancellation = cancellable && reservation.estado === 'PENDIENTE';

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceTitleContainer}>
          <View style={[styles.serviceIcon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="car-sport-outline" size={24} color={primaryColor} />
          </View>
          <View style={styles.serviceTitleContent}>
            <Text style={[styles.serviceTitle, { color: textColor }]} numberOfLines={2}>
              {reservation.nombreServicio || t('mobile.reservations.serviceFallback')}
            </Text>
            <Text style={[styles.reservationId, { color: mutedColor }]} numberOfLines={1}>
              {t('mobile.reservationDetail.reservation')} #{reservation.idReserva
                ? reservation.idReserva.slice(0, 8)
                : '--------'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
          <Ionicons name={status.icon} size={15} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {!!reservation.descripcionServicio && (
        <Text style={[styles.description, { color: mutedColor }]} numberOfLines={2}>
          {reservation.descripcionServicio}
        </Text>
      )}

      <View style={[styles.infoGrid, { backgroundColor: theme.primarySoft }]}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={19} color={primaryColor} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: mutedColor }]}>{t('mobile.reservations.date')}</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {formatDate(reservation.fechaReserva)}
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={19} color={primaryColor} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: mutedColor }]}>{t('mobile.reservations.time')}</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {formatTime(reservation.horaReserva)}
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="car-outline" size={19} color={primaryColor} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: mutedColor }]}>{t('mobile.reservations.vehicle')}</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {reservation.placaVehiculo || '--'}
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="car-sport-outline" size={19} color={primaryColor} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: mutedColor }]}>{t('mobile.reservations.type')}</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {reservation.tipoVehiculo || '--'}
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="hourglass-outline" size={19} color={primaryColor} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: mutedColor }]}>{t('mobile.reservations.duration')}</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {reservation.duracionServicio || 0}{' '}{t('mobile.home.minutes')}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <View style={[styles.priceBlock, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.priceLabel, { color: mutedColor }]}>{t('mobile.reservations.total')}</Text>
          <Text style={[styles.price, { color: primaryColor }]}>
            {formatPrice(reservation.precioServicio)}
          </Text>
        </View>
        {showCancellation && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelling
              ? `${t('mobile.reservations.cancelTitle')}: ${reservation.nombreServicio}, ${t('accessibility.inProgress')}`
              : `${t('mobile.reservations.cancelTitle')}: ${reservation.nombreServicio}`}
            accessibilityState={{ disabled: cancelling, busy: cancelling }}
            disabled={cancelling}
            onPress={() => onCancel(reservation)}
            style={[
              styles.cancelButton,
              {
                borderColor: theme.errorText,
                backgroundColor: theme.errorBackground,
                opacity: cancelling ? 0.6 : 1,
              },
            ]}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color={theme.errorText} />
            ) : (
              <>
                <Ionicons name="close-outline" size={18} color={theme.errorText} />
                <Text accessibilityLiveRegion="polite" style={[styles.cancelButtonText, { color: theme.errorText }]}>
                  {t('mobile.reservations.cancel')}
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      <Pressable
        style={[styles.detailButton, { backgroundColor: primaryColor }]}
        onPress={() => onOpenDetails(reservation)}
        accessibilityRole="button"
      >
        <Ionicons name="information-circle-outline" size={18} color={theme.onPrimary} />
        <Text style={[styles.detailButtonText, { color: theme.onPrimary }]}>
          {t('mobile.services.detail')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  serviceTitleContent: { flex: 1, minWidth: 0 },
  serviceTitle: { fontSize: 18, fontWeight: '800', lineHeight: 21 },
  reservationId: { fontSize: 11, marginTop: 3 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 19, marginTop: 13 },
  infoGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    padding: 10,
    borderRadius: 18,
  },
  infoItem: {
    width: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 4,
  },
  infoContent: { marginLeft: 8, flex: 1, minWidth: 0 },
  infoLabel: { fontSize: 11, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  cardFooter: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  priceBlock: { borderRadius: 15, paddingHorizontal: 13, paddingVertical: 9 },
  priceLabel: { fontSize: 11, marginBottom: 2 },
  price: { fontSize: 20, fontWeight: '800' },
  cancelButton: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  cancelButtonText: { fontSize: 13, fontWeight: '700' },
  detailButton: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 14,
  },
  detailButtonText: { fontSize: 13, fontWeight: '700' },
});
