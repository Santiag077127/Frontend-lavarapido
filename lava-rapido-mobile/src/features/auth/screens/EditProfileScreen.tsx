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
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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
import ScreenHeader from '../../../components/common/ScreenHeader'
import { userService, type UserProfile } from '../../../services/userService'
import { invalidateSession } from '../../../services/api'
import { classifyApiError } from '../../../services/apiErrors'
import { isValidHumanText, sanitizeHumanText } from '../../../services/inputSanitizers'
import { isValidEmail } from '../../../services/validators'
import styles from '../components/editProfileStyles'
import ProfileAvatarPicker from '../components/ProfileAvatarPicker'
import PersonalInformationForm from '../components/PersonalInformationForm'
import EmailChangeForm from '../components/EmailChangeForm'
import ProfileSecuritySection from '../components/ProfileSecuritySection'
import type { AvatarKey, AvatarOption } from '../components/editProfileTypes'

import {
  images,
} from '../../../assets/images'

const AVATARS: AvatarOption[] = [
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

  const [emailTouched, setEmailTouched] =
    useState(false)

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

    if (!isValidHumanText(cleanFirstName) || !isValidHumanText(cleanLastName)) {
      Alert.alert(t('editProfile.requiredTitle'), t('editProfile.invalidName', 'Usa solo letras, espacios, tildes y ñ.'), undefined, 'warning')
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

    setEmailTouched(true)
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

    if (!isValidEmail(normalizedEmail)) {
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
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
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
          : 'height'
      }
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <ScreenHeader
          accessibilityLabel={t('mobile.serviceDetail.back')}
          onBack={handleCancel}
          subtitle={t('editProfile.subtitle')}
          title={t('editProfile.title')}
        />

        {/* AVATAR */}

        <ProfileAvatarPicker
          avatars={AVATARS}
          selectedAvatar={selectedAvatar}
          getAvatarImage={getAvatarImage}
          onSelectAvatar={handleSelectAvatar}
          saving={saving}
          savingEmail={savingEmail}
          theme={theme}
        />
        <PersonalInformationForm
          firstName={firstName}
          lastName={lastName}
          phoneNumber={phoneNumber}
          onFirstNameChange={(value) => setFirstName(sanitizeHumanText(value))}
          onLastNameChange={(value) => setLastName(sanitizeHumanText(value))}
          onPhoneChange={setPhoneNumber}
          onCancel={handleCancel}
          onSave={handleSave}
          saving={saving}
          savingEmail={savingEmail}
          theme={theme}
          darkMode={darkMode}
        />
        <EmailChangeForm
          currentEmail={profile?.email}
          newEmail={newEmail}
          currentPassword={currentPassword}
          emailTouched={emailTouched}
          onEmailChange={setNewEmail}
          onEmailBlur={() => setEmailTouched(true)}
          onPasswordChange={setCurrentPassword}
          onSubmit={handleChangeEmail}
          saving={saving}
          savingEmail={savingEmail}
          theme={theme}
          darkMode={darkMode}
        />
        <ProfileSecuritySection
          onChangePassword={() => navigation.navigate('ChangePassword')}
          theme={theme}
        />

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
    </SafeAreaView>
  )
}
