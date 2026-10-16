import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import axios from 'axios'

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native'

import {
  Ionicons,
} from '@expo/vector-icons'

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'

import {
  ThemeContext,
} from '../../../theme/ThemeContext'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { useTranslation } from 'react-i18next'
import BackButton from '../../../components/common/BackButton'
import { userService, type UserProfile } from '../../../services/userService'
import { invalidateSession } from '../../../services/api'
import { classifyApiError } from '../../../services/apiErrors'

import {
  images,
} from '../../../assets/images'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type AvatarKey =
  | 'avatar_1'
  | 'avatar_2'
  | 'avatar_3'
  | 'avatar_4'
  | 'avatar_5'

const AVATARS: {
  key: AvatarKey
  image: any
}[] = [
  {
    key: 'avatar_1',
    image: images.avatar1,
  },
  {
    key: 'avatar_2',
    image: images.avatar2,
  },
  {
    key: 'avatar_3',
    image: images.avatar3,
  },
  {
    key: 'avatar_4',
    image: images.avatar4,
  },
  {
    key: 'avatar_5',
    image: images.avatar5,
  },
]

export default function EditProfileScreen() {
  const navigation =
    useNavigation<any>()

  const { theme, darkMode } = useContext(ThemeContext)

  const { t } = useTranslation()

  const [profile, setProfile] =
    useState<UserProfile | null>(null)

  const [firstName, setFirstName] =
    useState('')

  const [lastName, setLastName] =
    useState('')

  const [phoneNumber, setPhoneNumber] =
    useState('')

  const [newEmail, setNewEmail] =
    useState('')

  const [currentPassword, setCurrentPassword] =
    useState('')

  const [profilePicture, setProfilePicture] =
    useState<AvatarKey>('avatar_1')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [savingEmail, setSavingEmail] =
    useState(false)

  const emailChangeInProgress = useRef(false)

  const [selectedAvatar, setSelectedAvatar] =
    useState<AvatarKey>('avatar_1')

  const normalizeAvatar = (
    value:
      | string
      | null
      | undefined
  ): AvatarKey => {
    if (!value) {
      return 'avatar_1'
    }

    const normalized =
      value
        .toLowerCase()
        .trim()
        .replace('.png', '')

    const exists =
      AVATARS.some(
        item =>
          item.key === normalized
      )

    return exists
      ? (normalized as AvatarKey)
      : 'avatar_1'
  }

  const getAvatarImage = (
    avatar: AvatarKey
  ) => {
    return (
      AVATARS.find(
        item =>
          item.key === avatar
      )?.image ??
      images.avatar1
    )
  }

  const loadProfile =
    useCallback(
      async () => {
        try {
          setLoading(true)

          const data = await userService.getProfile()

          setProfile(data)

          setFirstName(
            data.firstName ?? ''
          )

          setLastName(
            data.lastName ?? ''
          )

          setPhoneNumber(
            data.phoneNumber ?? ''
          )

          const avatar =
            normalizeAvatar(
              data.profilePicture
            )

          setProfilePicture(
            avatar
          )

          setSelectedAvatar(
            avatar
          )
        } catch (error: any) {
          const kind = classifyApiError(error)
          Alert.alert(
            t('editProfile.errorTitle'),
            ['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
              ? t(`apiErrors.${kind}`)
              : error?.response?.status === 401
                ? t('editProfile.unauthorized')
                : error?.response?.status === 404
                  ? t('editProfile.notFound')
                  : t('editProfile.loadError'),
            undefined,
            'error',
          )
        } finally {
          setLoading(false)
        }
      },
      []
    )

  useFocusEffect(
    useCallback(() => {
      loadProfile()
    }, [loadProfile])
  )

  useEffect(() => {
    if (profile) {
      setFirstName(
        profile.firstName ?? ''
      )

      setLastName(
        profile.lastName ?? ''
      )

      setPhoneNumber(
        profile.phoneNumber ?? ''
      )

      const avatar =
        normalizeAvatar(
          profile.profilePicture
        )

      setProfilePicture(
        avatar
      )

      setSelectedAvatar(
        avatar
      )
    }
  }, [profile])

  const handleSelectAvatar = (
    avatar: AvatarKey
  ) => {
    if (saving || savingEmail) {
      return
    }

    setSelectedAvatar(avatar)
    setProfilePicture(avatar)
  }

  const validateForm = () => {
    const cleanFirstName =
      firstName.trim()

    const cleanLastName =
      lastName.trim()

    const cleanPhone =
      phoneNumber.trim()

    if (!cleanFirstName) {
      Alert.alert(
        t('editProfile.requiredTitle'),
        t('editProfile.firstNameRequired'),
        undefined,
        'warning',
      )

      return false
    }

    if (!cleanLastName) {
      Alert.alert(
        t('editProfile.requiredTitle'),
        t('editProfile.lastNameRequired'),
        undefined,
        'warning',
      )

      return false
    }

    if (!cleanPhone) {
      Alert.alert(
        t('editProfile.requiredTitle'),
        t('editProfile.phoneRequired'),
        undefined,
        'warning',
      )

      return false
    }

    if (
      cleanPhone.length < 7
    ) {
      Alert.alert(
        t('editProfile.invalidPhoneTitle'),
        t('editProfile.invalidPhone'),
        undefined,
        'warning',
      )

      return false
    }

    return true
  }

  const handleSave = async () => {
    if (saving || savingEmail || emailChangeInProgress.current) {
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)

      const data = await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        profilePicture,
      })

      setProfile(data)

      Alert.alert(
        t('editProfile.savedTitle'),
        t('editProfile.savedMessage'),
        [
          {
            text: t('editProfile.accept'),
            onPress: () =>
              navigation.goBack(),
          },
        ],
        'success',
      )
    } catch (error: any) {
      const status = error?.response?.status
      const kind = classifyApiError(error)
      const message = ['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
        ? t(`apiErrors.${kind}`)
        : status === 400 || status === 422
          ? t('editProfile.badRequest')
          : status === 401
            ? t('editProfile.unauthorized')
            : status === 404
              ? t('editProfile.notFound')
              : status === 409
                ? t('editProfile.conflict')
                : t('editProfile.saveError')

      Alert.alert(
        t('editProfile.errorTitle'),
        message,
        undefined,
        'error',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleChangeEmail = async () => {
    if (saving || savingEmail || emailChangeInProgress.current) {
      return
    }

    const normalizedEmail = newEmail.trim().toLowerCase()
    if (!normalizedEmail || !currentPassword) {
      Alert.alert(
        t('emailChange.errorTitle'),
        t('emailChange.required'),
        undefined,
        'warning',
      )
      return
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      Alert.alert(
        t('emailChange.errorTitle'),
        t('emailChange.invalidEmail'),
        undefined,
        'warning',
      )
      return
    }

    if (normalizedEmail === profile?.email.trim().toLowerCase()) {
      Alert.alert(
        t('emailChange.errorTitle'),
        t('emailChange.sameEmail'),
        undefined,
        'warning',
      )
      return
    }

    emailChangeInProgress.current = true
    setSavingEmail(true)

    try {
      const updatedProfile = await userService.changeEmail({
        currentPassword,
        newEmail: normalizedEmail,
      })

      setProfile(updatedProfile)
      setNewEmail('')
      setCurrentPassword('')

      // The backend validates JWT email claims against the updated account email.
      invalidateSession()
      Alert.alert(
        t('emailChange.successTitle'),
        t('emailChange.successMessage', { email: updatedProfile.email }),
        [{ text: t('common.accept') }],
        'success',
      )
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return
      }

      const kind = classifyApiError(error)
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined
      const responseData: unknown = axios.isAxiosError(error)
        ? error.response?.data
        : undefined
      const errorCode = responseData && typeof responseData === 'object'
        && 'error' in responseData && typeof responseData.error === 'string'
        ? responseData.error
        : undefined
      const message = kind === 'timeout'
        ? t('emailChange.timeout')
        : ['network', 'server_unavailable', 'server'].includes(kind)
          ? t(`apiErrors.${kind}`)
        : status === 400 && errorCode === 'CURRENT_PASSWORD_INVALID'
          ? t('emailChange.incorrectPassword')
          : status === 400
            ? t('emailChange.invalidRequest')
            : status === 403
              ? t('emailChange.forbidden')
              : status === 404
                ? t('emailChange.notFound')
                : status === 409
                  ? t('emailChange.conflict')
                  : t('emailChange.genericError')

      Alert.alert(
        t('emailChange.errorTitle'),
        message,
        undefined,
        'error',
      )
    } finally {
      emailChangeInProgress.current = false
      setSavingEmail(false)
    }
  }

  const handleCancel = () => {
    if (saving || savingEmail) {
      return
    }

    navigation.goBack()
  }

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.loadingCard,
            {
              backgroundColor:
                theme.card,
            },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />

          <Text
            style={[
              styles.loadingTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {t('editProfile.loadingTitle')}
          </Text>

          <Text
            style={[
              styles.loadingSubtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {t('editProfile.loadingMessage')}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View
          style={[
            styles.header,
            {
              backgroundColor:
                theme.card,
              borderColor:
                theme.border,
            },
          ]}
        >
          <BackButton
            accessibilityLabel={t('mobile.serviceDetail.back')}
            onPress={handleCancel}
          />

          <View
            style={styles.headerText}
          >
            <Text
              style={[
                styles.headerTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {t('editProfile.title')}
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {t('editProfile.subtitle')}
            </Text>
          </View>
        </View>

        {/* AVATAR */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                theme.card,
              borderColor:
                theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatarWrapper,
              {
                borderColor:
                  theme.primary,
              },
            ]}
          >
            <Image
              source={getAvatarImage(
                selectedAvatar
              )}
              style={styles.mainAvatar}
              resizeMode="cover"
            />
          </View>

          <Text
            style={[
              styles.avatarTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {t('editProfile.profilePhoto')}
          </Text>

          <Text
            style={[
              styles.avatarSubtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {t('editProfile.chooseAvatar')}
          </Text>

          <View
            style={styles.avatarGrid}
          >
            {AVATARS.map((item, index) => {
              const selected =
                selectedAvatar ===
                item.key

              return (
                <TouchableOpacity
                  key={item.key}
                  accessibilityRole="radio"
                  accessibilityLabel={t('accessibility.avatarOption', { number: index + 1 })}
                  accessibilityState={{ selected }}
                  activeOpacity={0.75}
                  disabled={saving || savingEmail}
                  onPress={() =>
                    handleSelectAvatar(
                      item.key
                    )
                  }
                  style={[
                    styles.avatarOption,
                    {
                      borderColor:
                        selected
                          ? theme.primary
                          : 'transparent',

                      backgroundColor:
                        selected
                          ? theme.primaryContainer
                          : 'transparent',
                    },
                  ]}
                >
                  <Image
                    source={item.image}
                    style={
                      styles.smallAvatar
                    }
                    resizeMode="cover"
                  />

                  {selected && (
                    <View
                      style={[
                        styles.avatarCheck,
                        {
                          backgroundColor:
                            theme.primary,
                          borderColor:
                            theme.card,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={theme.onPrimary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* DATOS */}

        <View
          style={[
            styles.formCard,
            {
              backgroundColor:
                theme.card,
              borderColor:
                theme.border,
            },
          ]}
        >
          <View
            style={styles.sectionHeader}
          >
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    theme.primaryContainer,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.primary}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {t('editProfile.personalInfo')}
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                {t('editProfile.modifyData')}
              </Text>
            </View>
          </View>

          <FormInput
            label={t('editProfile.firstName')}
            value={firstName}
            onChangeText={
              setFirstName
            }
            placeholder={t('editProfile.firstNamePlaceholder')}
            icon="person-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
          />

          <FormInput
            label={t('editProfile.lastName')}
            value={lastName}
            onChangeText={
              setLastName
            }
            placeholder={t('editProfile.lastNamePlaceholder')}
            icon="person-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
          />

          <FormInput
            label={t('editProfile.phone')}
            value={phoneNumber}
            onChangeText={
              setPhoneNumber
            }
            placeholder={t('editProfile.phonePlaceholder')}
            icon="call-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
            keyboardType="phone-pad"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              disabled={saving || savingEmail}
              onPress={handleCancel}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  opacity: saving || savingEmail ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="close-outline" size={20} color={theme.text} />
              <Text style={[styles.cancelText, { color: theme.text }]}>
                {t('editProfile.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving || savingEmail, busy: saving }}
              accessibilityLiveRegion="polite"
              disabled={saving || savingEmail}
              onPress={handleSave}
              accessibilityLabel={saving ? `${t('editProfile.save')}, ${t('accessibility.inProgress')}` : t('editProfile.save')}
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.primary,
                  opacity: saving || savingEmail ? 0.75 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.onPrimary} />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.onPrimary} />
              )}
              <Text style={[styles.saveText, { color: theme.onPrimary }]}>
                {saving ? t('editProfile.saving') : t('editProfile.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="mail-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.emailHeaderText}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('emailChange.title')}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {t('emailChange.subtitle')}
              </Text>
            </View>
          </View>

          <Text style={[styles.helperText, styles.currentEmail, { color: theme.textSecondary }]}>
            {t('emailChange.currentEmail', {
              email: profile?.email || t('editProfile.noEmail'),
            })}
          </Text>

          <FormInput
            label={t('emailChange.newEmail')}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder={t('emailChange.newEmailPlaceholder')}
            icon="mail-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />

          <FormInput
            label={t('emailChange.currentPassword')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t('emailChange.currentPassword')}
            icon="lock-closed-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving && !savingEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            secureTextEntry
          />

          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: saving || savingEmail, busy: savingEmail }}
            accessibilityLiveRegion="polite"
            accessibilityLabel={t('emailChange.submit')}
            disabled={saving || savingEmail}
            onPress={handleChangeEmail}
            style={[
              styles.saveButton,
              styles.emailSubmitButton,
              {
                backgroundColor: theme.primary,
                opacity: saving || savingEmail ? 0.75 : 1,
              },
            ]}
          >
            {savingEmail
              ? <ActivityIndicator size="small" color={theme.onPrimary} />
              : <Ionicons name="mail-outline" size={20} color={theme.onPrimary} />}
            <Text style={[styles.saveText, { color: theme.onPrimary }]}>
              {savingEmail ? t('emailChange.saving') : t('emailChange.submit')}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.emailHeaderText}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t('changePassword.title')}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {t('changePassword.subtitle')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('changePassword.menuTitle')}
            accessibilityHint={t('changePassword.menuDescription')}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ChangePassword')}
            style={[styles.securityAction, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}
          >
            <View style={[styles.securityActionIcon, { backgroundColor: theme.primaryContainer }]}>
              <Ionicons name="key-outline" size={19} color={theme.primary} />
            </View>
            <View style={styles.securityActionText}>
              <Text style={[styles.securityActionTitle, { color: theme.text }]}>
                {t('changePassword.menuTitle')}
              </Text>
              <Text style={[styles.securityActionDescription, { color: theme.textSecondary }]}>
                {t('changePassword.menuDescription')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View
          style={styles.securityInfo}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={
              theme.textSecondary
            }
          />

          <Text
            style={[
              styles.securityText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {t('editProfile.securityInfo')}
          </Text>
        </View>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  theme,
  darkMode,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'words',
  autoCorrect,
  autoComplete,
  secureTextEntry = false,
}: any) {
  return (
    <View
      style={styles.fieldContainer}
    >
      <Text
        style={[
          styles.label,
          {
            color:
              theme.text,
          },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor:
              theme.inputBackground,

            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.inputIcon,
            {
              backgroundColor:
                theme.primaryContainer,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={19}
            color={theme.primary}
          />
        </View>

        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={
            onChangeText
          }
          placeholder={
            placeholder
          }
          placeholderTextColor={
            theme.textSecondary
          }
          editable={editable}
          keyboardType={
            keyboardType
          }
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          style={[
            styles.input,
            {
              color:
                theme.text,
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
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
