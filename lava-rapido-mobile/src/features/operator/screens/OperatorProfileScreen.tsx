
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
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

import {
  useFocusEffect,
} from '@react-navigation/native'

import { ThemeContext } from '../../../theme/ThemeContext'
import ConfirmationModal from '../../../components/notifications/ConfirmationModal'

import {
  appAlert as Alert,
} from '../../../components/notifications/NotificationProvider'

import {
  images,
} from '../../../assets/images'

import api, {
  setToken,
} from '../../../services/api'
import styles from '../components/operatorProfileStyles'
import OperatorIdentity from '../components/OperatorIdentity'
import OperatorInformation from '../components/OperatorInformation'
import OperatorAvatarSelector from '../components/OperatorAvatarSelector'
import OperatorRoleInformation from '../components/OperatorRoleInformation'
import OperatorAppearance from '../components/OperatorAppearance'
import type { UserProfile, AvatarKey, AvatarOption } from '../components/operatorProfileTypes'

type Props = {
  setIsLoggedIn: (value: boolean) => void
}

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

export default function OperatorProfileScreen({
  setIsLoggedIn,
}: Props) {
  const themeContext =
    useContext(ThemeContext)

  const { t } = useTranslation()

  const [logoutConfirmationVisible, setLogoutConfirmationVisible] = useState(false)
  const { darkMode, setDarkMode, theme } = themeContext

  const { width } =
    useWindowDimensions()

  const [
    profile,
    setProfile,
  ] = useState<UserProfile | null>(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    refreshing,
    setRefreshing,
  ] = useState(false)

  const [
    savingAvatar,
    setSavingAvatar,
  ] = useState(false)

  const [
    selectedAvatar,
    setSelectedAvatar,
  ] = useState<AvatarKey>(
    'avatar_1'
  )

  const isSmallScreen =
    width < 360

  const logoutUser =
    useCallback(() => {
      setToken(null)
      setIsLoggedIn(false)
    }, [setIsLoggedIn])

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
    profilePicture:
      | string
      | null
      | undefined
  ) => {
    const normalized =
      normalizeAvatar(profilePicture)

    const found =
      AVATARS.find(
        item =>
          item.key === normalized
      )

    return (
      found?.image ??
      images.avatar1
    )
  }

  const loadProfile =
    useCallback(async () => {
      try {
        const response =
          await api.get<UserProfile>(
            '/api/users/profile'
          )

        const userProfile =
          response.data

        setProfile(userProfile)

        setSelectedAvatar(
          normalizeAvatar(
            userProfile.profilePicture
          )
        )
      } catch (error: any) {
        console.log(
          'ERROR PERFIL OPERADOR:',
          error?.response?.status ||
            error?.message
        )

        if (
          error?.response?.status === 401
        ) {
          Alert.alert(
            t('operator.profile.sessionExpired'),
            t('operator.profile.loginAgain'),
            [
              {
                text: t('common.accept'),
                onPress: logoutUser,
              },
            ],
            'error',
          )

          return
        }

        Alert.alert(
          t('operator.profile.errorTitle'),
          t('operator.profile.loadError'),
          undefined,
          'error',
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }, [logoutUser])

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

  /**
   * Cambiar únicamente el avatar.
   *
   * Los demás datos del usuario se envían
   * exactamente como están registrados.
   */
  const handleChangeAvatar = async (
    avatar: AvatarKey
  ) => {
    if (
      savingAvatar ||
      !profile ||
      avatar ===
        selectedAvatar
    ) {
      return
    }

    try {
      setSavingAvatar(true)

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

      setProfile(
        response.data
      )

      setSelectedAvatar(
        normalizeAvatar(
          response.data.profilePicture
        )
      )

      Alert.alert(
        t('operator.profile.avatarUpdatedTitle'),
        t('operator.profile.avatarUpdatedMessage'),
        undefined,
        'success',
      )
    } catch (error: any) {
      console.log(
        'ERROR CAMBIANDO AVATAR:',
        error?.response?.status ||
          error?.message
      )

      if (
        error?.response?.status === 401
      ) {
        Alert.alert(
          t('operator.profile.sessionExpired'),
          t('operator.profile.loginAgain'),
          [
            {
              text: t('common.accept'),
              onPress: logoutUser,
            },
          ],
          'error',
        )

        return
      }

      Alert.alert(
        t('operator.profile.errorTitle'),
        error?.response?.status === 400
          ? t('operator.profile.badRequest')
          : t('operator.profile.avatarError'),
        undefined,
        'error',
      )
    } finally {
      setSavingAvatar(false)
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
            {t('operator.profile.loading')}
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
            {t('operator.profile.loadingMessage')}
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
          {t('operator.profile.loadErrorTitle')}
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
          {t('operator.profile.retryMessage')}
        </Text>

        <TouchableOpacity
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
            {t('common.retry')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const currentAvatar =
    getAvatarImage(
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
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
          colors={[
            theme.primary,
          ]}
        />
      }
    >
      <OperatorIdentity profile={profile} currentAvatar={currentAvatar} isSmallScreen={isSmallScreen} theme={theme} />
      <OperatorInformation profile={profile} theme={theme} />
      <OperatorAvatarSelector avatars={AVATARS} selectedAvatar={selectedAvatar} savingAvatar={savingAvatar} onChangeAvatar={handleChangeAvatar} theme={theme} />
      <OperatorRoleInformation theme={theme} />
      <OperatorAppearance theme={theme} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* CERRAR SESIÓN */}

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.8}
        style={[styles.logout, { backgroundColor: theme.errorAction, shadowColor: theme.errorAction }]}
        onPress={handleLogout}
      >
        <View
          style={[styles.logoutIcon, { backgroundColor: theme.errorBackground }]}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.errorOnAction}
          />
        </View>

        <Text
          style={[styles.logoutText, { color: theme.errorOnAction }]}
        >
          {t('operator.profile.logout')}
        </Text>
      </TouchableOpacity>

      {/* SEGURIDAD */}

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
          {t('operator.profile.privacy')}
        </Text>
      </View>

      <View
        style={styles.bottomSpace}
      />
    </ScrollView>
      <ConfirmationModal
        visible={logoutConfirmationVisible}
        title={t('operator.profile.logoutTitle')}
        message={t('operator.profile.logoutMessage')}
        confirmLabel={t('operator.profile.logout')}
        cancelLabel={t('common.cancel')}
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
