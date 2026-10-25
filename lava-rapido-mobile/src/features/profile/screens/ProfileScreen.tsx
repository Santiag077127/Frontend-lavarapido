import React, {
  useCallback,
  useContext,
  useState,
} from 'react'

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { ThemeContext } from '../../../theme/ThemeContext'
import ConfirmationModal from '../../../components/notifications/ConfirmationModal'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'
import api, { classifyApiError, setToken } from '../../../services/api'
import styles from '../components/profileStyles'
import { ProfileIdentity, ProfileInformation, ProfileAvatarSelector, ProfilePreferences, type AvatarKey } from '../components/ProfileSections'

type Props = {
  setIsLoggedIn: (value: boolean) => void
}

type UserProfile = {
  userId: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  profilePicture: string | null
}

const AVATARS: {
  key: AvatarKey
  image: ImageSourcePropType
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

export default function ProfileScreen({
  setIsLoggedIn,
}: Props) {
  const navigation = useNavigation<any>()
  const { t } = useTranslation()

  const [logoutConfirmationVisible, setLogoutConfirmationVisible] = useState(false)
  const { theme, darkMode, setDarkMode } = useContext(ThemeContext)

  const { width } = useWindowDimensions()

  const [profile, setProfile] =
    useState<UserProfile | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [changingAvatar, setChangingAvatar] =
    useState(false)

  const isSmallScreen = width < 360

  const logoutUser = useCallback(() => {
    setToken(null)
    setIsLoggedIn(false)
  }, [setIsLoggedIn])

  const loadProfile = useCallback(
    async () => {
      try {
        const response =
          await api.get<UserProfile>(
            '/api/users/profile'
          )

        setProfile(response.data)
      } catch (error: any) {
        console.log(
          'ERROR PERFIL:',
          error?.response?.status ||
            error?.message
        )

        if (
          error?.response?.status === 401
        ) {
          Alert.alert(
            t('profile.sessionExpired'),
            t('profile.loginAgain'),
            [
              {
                text: t('profile.accept'),
                onPress: logoutUser,
              },
            ],
            'error',
          )

          return
        }

        const kind = classifyApiError(error)
        Alert.alert(
          t('profile.errorTitle'),
          ['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
            ? t(`apiErrors.${kind}`)
            : error?.response?.status === 404
              ? t('profile.notFound')
              : t('profile.loadError'),
          undefined,
          'error',
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [logoutUser]
  )

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      loadProfile()
    }, [loadProfile])
  )

  const handleRefresh = () => {
    if (refreshing) {
      return
    }

    setRefreshing(true)
    loadProfile()
  }

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

    const exists = AVATARS.some(
      item =>
        item.key === normalized
    )

    return exists
      ? (normalized as AvatarKey)
      : 'avatar_1'
  }

  const getAvatarImage = (
    profilePicture:
      | string
      | null
      | undefined
  ) => {
    const normalized =
      normalizeAvatar(profilePicture)

    const found = AVATARS.find(
      item =>
        item.key === normalized
    )

    return found?.image ?? images.avatar1
  }

  const handleChangeAvatar = async (
    avatar: AvatarKey
  ) => {
    if (
      !profile ||
      changingAvatar
    ) {
      return
    }

    const currentAvatar =
      normalizeAvatar(
        profile.profilePicture
      )

    if (
      currentAvatar === avatar
    ) {
      return
    }

    try {
      setChangingAvatar(true)

      const response =
        await api.put<UserProfile>(
          '/api/users/profile',
          {
            firstName:
              profile.firstName,

            lastName:
              profile.lastName,

            phoneNumber:
              profile.phoneNumber,

            profilePicture:
              avatar,
          }
        )

      setProfile(response.data)

      Alert.alert(
        t('profile.avatarUpdatedTitle'),
        t('profile.avatarUpdatedMessage'),
        undefined,
        'success',
      )
    } catch (error: any) {
      console.log(
        'ERROR AVATAR:',
        error?.response?.status ||
          error?.message
      )

      const status = error?.response?.status
      const kind = classifyApiError(error)
      const message = ['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
        ? t(`apiErrors.${kind}`)
        : status === 400 || status === 422
          ? t('profile.badRequest')
          : status === 401
            ? t('profile.unauthorized')
            : t('profile.avatarError')

      Alert.alert(
        t('profile.errorTitle'),
        message,
        undefined,
        'error',
      )
    } finally {
      setChangingAvatar(false)
    }
  }

  const handleLogout = () => {
    setLogoutConfirmationVisible(true);
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
              styles.loadingText,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {t('profile.loading')}
          </Text>

          <Text
            style={[
              styles.loadingSubtext,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {t('profile.loadingMessage')}
          </Text>
        </View>
      </View>
    )
  }

  if (!profile) {
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
            styles.emptyIcon,
            {
              backgroundColor:
                theme.primaryContainer,
            },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={42}
            color={theme.primary}
          />
        </View>

        <Text
          style={[
            styles.errorTitle,
            {
              color:
                theme.text,
            },
          ]}
        >
          {t('profile.emptyTitle')}
        </Text>

        <Text
          style={[
            styles.errorSubtitle,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {t('profile.emptyMessage')}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          style={[
            styles.retryButton,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
          onPress={() => {
            setLoading(true)
            loadProfile()
          }}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color={theme.onPrimary}
          />

          <Text
            style={[styles.retryText, { color: theme.onPrimary }]}
          >
            {t('profile.retry')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const currentAvatar =
    getAvatarImage(
      profile.profilePicture
    )

  const selectedAvatar =
    normalizeAvatar(
      profile.profilePicture
    )

  return (
    <>
      <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal:
            isSmallScreen
              ? 14
              : 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      <ProfileIdentity
        firstName={profile.firstName}
        lastName={profile.lastName}
        email={profile.email}
        avatarImage={currentAvatar}
        isSmallScreen={isSmallScreen}
        theme={theme}
      />
      <ProfileInformation
        firstName={profile.firstName}
        lastName={profile.lastName}
        email={profile.email}
        phoneNumber={profile.phoneNumber}
        theme={theme}
      />
      <ProfileAvatarSelector
        avatars={AVATARS}
        selectedAvatar={selectedAvatar}
        changingAvatar={changingAvatar}
        onChangeAvatar={handleChangeAvatar}
        theme={theme}
      />
      <ProfilePreferences
        theme={theme}
        darkMode={darkMode}
        onToggleDarkMode={setDarkMode}
        onEditProfile={() => navigation.navigate('EditProfile')}
        onOpenVehicles={() => navigation.navigate('MyVehicles')}
      />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t('profile.logout')}
        activeOpacity={0.8}
        style={[styles.logout, { backgroundColor: theme.errorBackground, borderColor: theme.errorBorder, shadowColor: theme.errorAction }]}
        onPress={handleLogout}
      >
        <View style={styles.logoutContent}>
          <View style={[styles.logoutIcon, { backgroundColor: theme.errorAction }]}>
            <Ionicons name="log-out-outline" size={21} color={theme.errorOnAction} />
          </View>
          <Text style={[styles.logoutText, { color: theme.errorText }]}>{t('profile.logout')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={21} color={theme.errorText} />
      </TouchableOpacity>

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
          {t('profile.privacy')}
        </Text>
      </View>

      <View
        style={styles.bottomSpace}
      />
    </ScrollView>
      <ConfirmationModal
        visible={logoutConfirmationVisible}
        title={t('profile.logoutTitle')}
        message={t('profile.logoutMessage')}
        confirmLabel={t('profile.logout')}
        cancelLabel={t('profile.cancel')}
        variant="danger"
        onConfirm={() => {
          setLogoutConfirmationVisible(false);
          logoutUser();
        }}
        onCancel={() => setLogoutConfirmationVisible(false)}
      />
    </>
  )
}
