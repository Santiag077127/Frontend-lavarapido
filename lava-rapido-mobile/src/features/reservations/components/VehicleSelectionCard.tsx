import React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import type { Vehicle } from '../../vehicles/types/vehicle.types'
import type { ApiErrorKind } from '../../../services/api'
import type { ReservationColors, ReservationSectionTheme } from './reservationFormTypes'
import styles from './reservationFormStyles'

const vehicleTypeKeys: Record<string, string> = {
  CARRO: 'vehicles.types.car',
  CAMIONETA: 'vehicles.types.pickup',
  MOTO: 'vehicles.types.motorcycle',
  MOTOCARRO: 'vehicles.types.motortricycle',
  FURGONETA: 'vehicles.types.van',
  PESADO: 'vehicles.types.heavy',
}

type Props = {
  activeVehicles: Vehicle[]
  selectedVehicleId: string
  vehicleLoadError: ApiErrorKind | null
  loadingVehicles: boolean
  onRetry: () => void
  onAddVehicle: () => void
  onSelectVehicle: (id: string) => void
  colors: ReservationColors
  theme: ReservationSectionTheme
}

export default function VehicleSelectionCard({ activeVehicles, selectedVehicleId, vehicleLoadError, loadingVehicles, onRetry, onAddVehicle, onSelectVehicle, colors, theme }: Props) {
  const { t } = useTranslation()
  return (
        <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftColor: colors.primary,
              },
            ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {t('mobile.reservation.selectVehicle')}
          </Text>

          {vehicleLoadError && activeVehicles.length > 0 ? (
            <View style={[styles.loadErrorBanner, { backgroundColor: theme.errorBackground, borderColor: theme.errorBorder }]}>
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={[styles.loadErrorText, { color: colors.danger }]}
              >
                {vehicleLoadError === 'unknown'
                  ? t('mobile.reservation.vehicleLoadError')
                  : t(`apiErrors.${vehicleLoadError}`)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: loadingVehicles, busy: loadingVehicles }}
                disabled={loadingVehicles}
                onPress={onRetry}
              >
                {loadingVehicles ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                    {t('common.retry')}
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {activeVehicles.length === 0 ? (
            vehicleLoadError ? (
            <View style={styles.emptyVehicle}>
              <Ionicons
                name="cloud-offline-outline"
                size={42}
                color={colors.danger}
              />
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={[styles.emptyText, { color: colors.danger }]}
              >
                {vehicleLoadError === 'unknown'
                  ? t('mobile.reservation.vehicleLoadError')
                  : t(`apiErrors.${vehicleLoadError}`)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: loadingVehicles, busy: loadingVehicles }}
                disabled={loadingVehicles}
                style={[styles.secondaryButton, { borderColor: colors.primary, opacity: loadingVehicles ? 0.65 : 1 }]}
                onPress={onRetry}
              >
                {loadingVehicles ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                    {t('common.retry')}
                  </Text>
                )}
              </Pressable>
            </View>
            ) : (
            <View
              style={
                styles.emptyVehicle
              }
            >
              <Text
                style={[
                  styles.emptyText,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {t('mobile.reservation.noVehicles')}
              </Text>

              <Pressable
                style={[
                  styles.secondaryButton,
                  {
                    borderColor:
                      colors.primary,
                  },
                ]}
                onPress={onAddVehicle
                }
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {t('mobile.reservation.registerVehicle')}
                </Text>
              </Pressable>
            </View>
            )
          ) : (
            <View style={styles.vehicleOptions}>
              {activeVehicles.map((vehicle) => {
                const selected = vehicle.idVehiculo === selectedVehicleId;
                const typeKey = vehicleTypeKeys[vehicle.tipoVehiculo];

                return (
                  <Pressable
                    key={vehicle.idVehiculo}
                    accessibilityRole="radio"
                    accessibilityLabel={`${vehicle.nombreMarca || ''} ${vehicle.placa || ''}`.trim()}
                    accessibilityState={{ selected }}
                    onPress={() => onSelectVehicle(vehicle.idVehiculo)}
                    style={[
                      styles.vehicleOption,
                      {
                        backgroundColor: selected ? theme.primarySoft : colors.inputBackground,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.vehicleIcon,
                        { backgroundColor: selected ? colors.primary : theme.primarySoft },
                      ]}
                    >
                      <Ionicons name="car-outline" size={24} color={selected ? colors.onPrimary : colors.primary} />
                    </View>
                    <View style={styles.vehicleDetails}>
                      <Text style={[styles.vehiclePlate, { color: colors.text }]}>{vehicle.placa || t('vehicles.fields.plate')}</Text>
                      <Text style={[styles.vehicleMeta, { color: colors.secondaryText }]} numberOfLines={1}>
                        {[vehicle.nombreMarca, typeKey ? t(typeKey) : vehicle.tipoVehiculo].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={selected ? colors.primary : colors.secondaryText}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
  )
}
