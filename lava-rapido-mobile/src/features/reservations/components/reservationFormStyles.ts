import { StyleSheet } from 'react-native'

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      width: '100%',
      maxWidth: 540,
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 24,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 12,
    },

    loadingText: {
      fontSize: 15,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 50,
      marginBottom: 22,
    },

    pageTitle: { flex: 1, minWidth: 0, fontSize: 24, lineHeight: 29, fontWeight: '800', letterSpacing: -0.4 },

    card: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      elevation: 1,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 12,
    },

    serviceName: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 6,
    },

    description: {
      fontSize: 14,
      lineHeight: 21,
      marginBottom: 16,
    },

    serviceInfoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },

    infoItem: {
      flexBasis: '48%',
      flexGrow: 1,
      minWidth: 125,
      borderRadius: 12,
      padding: 12,
    },

    infoLabel: {
      fontSize: 13,
      marginBottom: 4,
    },

    infoValue: {
      fontSize: 16,
      fontWeight: '700',
    },

    vehicleOptions: {
      gap: 10,
    },

    vehicleOption: {
      minHeight: 62,
      borderWidth: 1.5,
      borderRadius: 12,
      padding: 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    vehicleIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    vehicleDetails: {
      flex: 1,
      minWidth: 0,
    },

    vehiclePlate: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    vehicleMeta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '600',
    },

    emptyVehicle: {
      alignItems: 'center',
      paddingVertical: 10,
    },

    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 14,
    },

    loadErrorBanner: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    loadErrorText: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      lineHeight: 18,
    },

    secondaryButton: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 18,
      paddingVertical: 11,
    },

    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },

    selector: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 17,
      paddingVertical: 12,
      minHeight: 62,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    selectorText: {
      flex: 1,
      minWidth: 0,
      fontSize: 15,
      fontWeight: '600',
    },

    scheduleHint: {
      fontSize: 13,
      marginTop: 10,
    },

    summaryCard: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      elevation: 1,
    },

    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingVertical: 10,
      gap: 12,
    },

    summaryLabel: {
      flexShrink: 1,
      fontSize: 14,
    },

    summaryValue: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'right',
      marginLeft: 20,
    },

    summaryPrice: {
      fontSize: 18,
      fontWeight: '800',
    },

    policyNotice: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      gap: 7,
    },

    policyText: {
      fontSize: 12,
      lineHeight: 18,
    },

    policyLink: {
      fontSize: 13,
      fontWeight: '700',
    },

    createButton: {
      minHeight: 58,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 20,
      elevation: 4,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },

    createButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },

    cancelButton: {
      minHeight: 48,
      borderWidth: 1,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 10,
    },

    cancelButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });

export default styles
