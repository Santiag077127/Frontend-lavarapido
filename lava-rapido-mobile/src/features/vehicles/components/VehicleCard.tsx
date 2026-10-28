import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Vehicle } from '../../../services/vehicleService';

type VehicleCardTheme = {
  card: string;
  border: string;
  primarySoft: string;
  primary: string;
  text: string;
  textSecondary: string;
  successBackground: string;
  errorBackground: string;
  successBorder: string;
  errorBorder: string;
  successText: string;
  errorText: string;
  background: string;
  onPrimary: string;
  infoBorder: string;
};

type Props = {
  vehicle: Vehicle;
  theme: VehicleCardTheme;
  translate: (key: string) => string;
  onEdit: (vehicle: Vehicle) => void;
  onChangeStatus: (vehicle: Vehicle) => void;
};

const vehicleTypeKeys: Record<string, string> = {
  CARRO: 'vehicles.types.car',
  CAMIONETA: 'vehicles.types.pickup',
  MOTO: 'vehicles.types.motorcycle',
  MOTOCARRO: 'vehicles.types.motortricycle',
  FURGONETA: 'vehicles.types.van',
  PESADO: 'vehicles.types.heavy',
};

export default function VehicleCard({ vehicle, theme, translate, onEdit, onChangeStatus }: Props) {
  const isActive = vehicle.estado;
  const vehicleTypeLabel = vehicleTypeKeys[vehicle.tipoVehiculo]
    ? translate(vehicleTypeKeys[vehicle.tipoVehiculo])
    : vehicle.tipoVehiculo;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.vehicleIcon, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name={vehicle.tipoVehiculo === 'MOTO' ? 'bicycle-outline' : 'car-sport-outline'} size={25} color={theme.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.brandName, { color: theme.text }]}>{vehicle.nombreMarca}</Text>
          <Text style={[styles.plate, { color: theme.textSecondary }]}>{vehicle.placa}</Text>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: isActive ? theme.successBackground : theme.errorBackground,
          borderColor: isActive ? theme.successBorder : theme.errorBorder,
        }]}>
          <Text style={[styles.statusText, { color: isActive ? theme.successText : theme.errorText }]}>
            {translate(isActive ? 'vehicles.status.active' : 'vehicles.status.inactive')}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.infoRow}>
        <View style={[styles.infoItem, { backgroundColor: theme.background }]}>
          <Ionicons name="car-outline" size={18} color={theme.primary} />
          <View style={styles.infoText}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{translate('vehicles.fields.type')}</Text>
            <Text style={[styles.value, { color: theme.text }]}>{vehicleTypeLabel}</Text>
          </View>
        </View>
        <View style={[styles.infoItem, { backgroundColor: theme.background }]}>
          <Ionicons name="color-palette-outline" size={18} color={theme.primary} />
          <View style={styles.infoText}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{translate('vehicles.fields.color')}</Text>
            <Text style={[styles.value, { color: theme.text }]}>{vehicle.color || translate('vehicles.fields.unspecified')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${translate('accessibility.editVehicle')}: ${vehicle.placa}`}
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => onEdit(vehicle)}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={19} color={theme.onPrimary} />
          <Text style={[styles.actionText, { color: theme.onPrimary }]}>{translate('vehicles.actions.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${isActive ? 'Eliminar' : translate('vehicles.status.activate')}: ${vehicle.placa}`}
          style={[styles.actionButton, {
            backgroundColor: isActive ? theme.errorBackground : theme.primarySoft,
            borderWidth: 1,
            borderColor: isActive ? theme.errorBorder : theme.infoBorder,
          }]}
          onPress={() => onChangeStatus(vehicle)}
          activeOpacity={0.8}
        >
          <Ionicons name={isActive ? 'eye-off-outline' : 'eye-outline'} size={19} color={isActive ? theme.errorText : theme.primary} />
          <Text accessibilityLiveRegion="polite" style={[styles.actionText, { color: isActive ? theme.errorText : theme.primary }]}>
            {isActive ? 'Eliminar' : translate('vehicles.status.activate')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 16, elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  vehicleIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, minWidth: 0, marginLeft: 14 },
  brandName: { fontSize: 17, fontWeight: '800', flexShrink: 1 },
  plate: { fontSize: 14, fontWeight: '700', letterSpacing: 1.4, marginTop: 4 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, marginVertical: 15 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoItem: { width: '48%', minWidth: 125, flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 15 },
  infoText: { flex: 1, minWidth: 0 },
  label: { fontSize: 11, marginBottom: 2 },
  value: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 14 },
  actionButton: { flexGrow: 1, flexBasis: '48%', minWidth: 125, minHeight: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  actionText: { flexShrink: 1, textAlign: 'center', fontSize: 13, fontWeight: '700' },
});
