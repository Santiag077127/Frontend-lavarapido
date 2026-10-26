import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingTop: 18,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '700',
  },

  loadingSubtext: {
    marginTop: 5,
    fontSize: 13,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorTitle: {
    marginTop: 17,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorSubtitle: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 300,
  },

  retryButton: {
    marginTop: 22,
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
  },

  headerCard: {
    flexDirection: 'row',
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  avatarBorder: {
    borderWidth: 3,
    borderRadius: 57,
    padding: 3,
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  avatar: {
    overflow: 'hidden',
  },

  statusDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    right: 1,
    bottom: 2,
    borderWidth: 3,
  },

  name: {
    fontWeight: '800',
    textAlign: 'left',
    marginTop: 7,
  },

  email: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'left',
    flexShrink: 1,
  },

  profileIdentity: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },

  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 0,
  },

  profileBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    marginLeft: 5,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 17,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11.5,
    marginBottom: 3,
    fontWeight: '500',
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },

  avatarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  avatarMini: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  check: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },

  menuCard: {
    paddingVertical: 3,
  },

  menuItem: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderBottomWidth: 0.5,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },

  menuDescription: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 3,
  },

  switchRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 2,
  },

  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logout: {
    minHeight: 60,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1,
    elevation: 1,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  legalLink: {
    minHeight: 60,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 12,
  },

  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoutIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    fontWeight: '800',
    fontSize: 15.5,
    marginLeft: 8,
  },

  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },

  securityText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    marginLeft: 6,
    textAlign: 'center',
  },

  bottomSpace: {
    height: 15,
  },
})

export default styles
