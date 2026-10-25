import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: '800',
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 13,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },

  headerText: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  profileCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },

  avatarWrapper: {
    borderWidth: 3,
    borderRadius: 70,
    padding: 3,
  },

  mainAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  avatarTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },

  avatarSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  avatarGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 17,
    paddingVertical: 10,
    borderRadius: 18,
  },

  avatarOption: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  smallAvatar: {
    width: 49,
    height: 49,
    borderRadius: 25,
  },

  avatarCheck: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },

  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  emailHeaderText: {
    flex: 1,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  fieldContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  inputIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  input: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    paddingVertical: 10,
  },

  helperText: {
    fontSize: 10.5,
    marginTop: 5,
    marginLeft: 2,
  },

  fieldError: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 5,
    marginLeft: 2,
  },

  currentEmail: {
    marginTop: -8,
    marginBottom: 16,
  },

  emailSubmitButton: {
    flex: 0,
    marginTop: 2,
  },

  securityAction: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  securityActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  securityActionText: {
    flex: 1,
    marginRight: 8,
  },

  securityActionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  securityActionDescription: {
    fontSize: 11.5,
    marginTop: 3,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  cancelButton: {
    flex: 0.9,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
  },

  saveButton: {
    flex: 1.4,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },

  saveText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 7,
  },

  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  securityText: {
    fontSize: 11,
    marginLeft: 6,
    textAlign: 'center',
  },

  bottomSpace: {
    height: 15,
  },
})

export default styles
