
import React, {
  useCallback,
  useContext,
  useState,
} from 'react'

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
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
import LanguageSelector from '../../../components/profile/LanguageSelector'

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

  const fullName =
    `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()

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
      {/* HEADER DEL PERFIL */}

      <View
        style={[
          styles.headerCard,
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
            styles.avatarBorder,
            {
              borderColor:
                theme.primary,
            },
          ]}
        >
          <Image
            source={currentAvatar}
            accessibilityLabel={t('editProfile.profilePhoto')}
            style={[
              styles.avatar,
              {
                width:
                  isSmallScreen
                    ? 95
                    : 115,
                height:
                  isSmallScreen
                    ? 95
                    : 115,
                borderRadius:
                  isSmallScreen
                    ? 48
                    : 58,
              },
            ]}
            resizeMode="cover"
          />

          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  theme.success,
                borderColor:
                  theme.card,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.name,
            {
              color:
                theme.text,
              fontSize:
                isSmallScreen
                  ? 21
                  : 24,
            },
          ]}
          numberOfLines={2}
        >
          {fullName || t('operator.profile.operator')}
        </Text>

        <Text
          style={[
            styles.email,
            {
              color:
                theme.textSecondary,
            },
          ]}
          numberOfLines={1}
        >
          {profile.email ||
            t('operator.profile.noEmail')}
        </Text>

        <View
          style={[
            styles.profileBadge,
            {
              backgroundColor:
                theme.primaryContainer,
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={theme.primary}
          />

          <Text
            style={[
              styles.profileBadgeText,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            {t('operator.profile.operator').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* INFORMACIÓN PERSONAL */}

      <View
        style={[
          styles.card,
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

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {t('operator.profile.personalInfo')}
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
              {t('operator.profile.personalDescription')}
            </Text>
          </View>
        </View>

        <InfoItem
          icon="person-outline"
          label={t('operator.profile.firstName')}
          value={profile.firstName}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="person-outline"
          label={t('operator.profile.lastName')}
          value={profile.lastName}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="mail-outline"
          label={t('operator.profile.email')}
          value={profile.email}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="call-outline"
          label={t('operator.profile.phone')}
          value={profile.phoneNumber}
          theme={theme}
          darkMode={darkMode}
          last
        />
      </View>

      {/* CAMBIAR AVATAR */}

      <View
        style={[
          styles.card,
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
              name="image-outline"
              size={20}
              color={theme.primary}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {t('operator.profile.photoTitle')}
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
              {t('operator.profile.photoDescription')}
            </Text>
          </View>
        </View>

        <View
          style={styles.avatarGrid}
        >
          {AVATARS.map(
            (avatar, index) => {
              const isSelected =
                selectedAvatar ===
                avatar.key

              return (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityLabel={t('accessibility.avatarOption', { number: index + 1 })}
                  accessibilityState={{ selected: isSelected, disabled: savingAvatar }}
                  key={
                    avatar.key
                  }
                  activeOpacity={0.8}
                  disabled={
                    savingAvatar
                  }
                  onPress={() =>
                    handleChangeAvatar(
                      avatar.key
                    )
                  }
                  style={[
                    styles.avatarOption,
                    {
                      borderColor:
                        isSelected
                          ? theme.primary
                          : darkMode
                            ? theme.border
                            : theme.border,
                      backgroundColor:
                        theme.interactiveSurface,
                    },
                    isSelected && {
                      borderWidth: 3,
                    },
                  ]}
                >
                  <Image
                    source={
                      avatar.image
                    }
                    style={
                      styles.avatarOptionImage
                    }
                    resizeMode="cover"
                  />

                  {isSelected && (
                    <View
                      style={[
                        styles.avatarCheck,
                        {
                          backgroundColor:
                            theme.primary,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={theme.onPrimary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )
            }
          )}
        </View>

        {savingAvatar && (
          <View
            style={
              styles.avatarSaving
            }
          >
            <ActivityIndicator
              size="small"
              color={
                theme.primary
              }
            />

            <Text
              style={[
                styles.avatarSavingText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {t('operator.profile.savingAvatar')}
            </Text>
          </View>
        )}
      </View>

      {/* INFORMACIÓN DEL ROL */}

      <View
        style={[
          styles.card,
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
              name="briefcase-outline"
              size={20}
              color={theme.primary}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {t('operator.profile.accountInfo')}
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
              {t('operator.profile.accountDescription')}
            </Text>
          </View>
        </View>

        <InfoItem
          icon="shield-checkmark-outline"
          label={t('operator.profile.role')}
          value={t('operator.profile.operator')}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="checkmark-circle-outline"
          label={t('operator.profile.status')}
          value={t('vehicles.status.active')}
          theme={theme}
          darkMode={darkMode}
          last
        />
      </View>

      {/* AVISO */}

      <View
        style={[
          styles.readOnlyCard,
          {
            backgroundColor: theme.interactiveSurface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.readOnlyIcon,
            {
              backgroundColor: theme.primarySoft,
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={theme.primary}
          />
        </View>

        <View
          style={
            styles.readOnlyContent
          }
        >
          <Text
            style={[
              styles.readOnlyTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {t('operator.profile.protectedTitle')}
          </Text>

          <Text
            style={[
              styles.readOnlyText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {t('operator.profile.protectedMessage')}
          </Text>
        </View>
      </View>

      {/* APARIENCIA */}

      <View
        style={[
          styles.card,
          styles.menuCard,
          {
            backgroundColor:
              theme.card,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={styles.avatarTitleRow}
        >
          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              {t('operator.profile.appearance')}
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
              {t('operator.profile.appearanceDescription')}
            </Text>
          </View>
        </View>

        <LanguageSelector
          theme={theme}
          darkMode={darkMode}
        />

        <View
          style={[
            styles.switchRow,
            {
              borderBottomWidth: 0,
            },
          ]}
        >
          <View
            style={styles.switchLeft}
          >
            <View
              style={[
                styles.menuIcon,
                {
                  backgroundColor:
                    theme.primaryContainer,
                },
              ]}
            >
              <Ionicons
                name={
                  darkMode
                    ? 'moon-outline'
                    : 'sunny-outline'
                }
                size={20}
                color={theme.primary}
              />
            </View>

            <View
              style={
                styles.menuTextContainer
              }
            >
              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {t('operator.profile.darkMode')}
              </Text>

              <Text
                style={[
                  styles.menuDescription,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                {darkMode
                  ? t('operator.profile.enabled')
                  : t('operator.profile.disabled')}
              </Text>
            </View>
          </View>

          <Switch
            accessibilityLabel={t('operator.profile.darkMode')}
            value={darkMode}
            onValueChange={
              setDarkMode
            }
            trackColor={{
              false: theme.border,
              true: theme.primary,
            }}
            thumbColor={darkMode ? theme.onPrimary : theme.card}
          />
        </View>
      </View>

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

function InfoItem({
  icon,
  label,
  value,
  theme,
  darkMode,
  last = false,
}: any) {
  const { t } = useTranslation()

  return (
    <View
      style={[
        styles.infoRow,
        {
          borderColor:
            theme.border,
        },
        last && {
          borderBottomWidth: 0,
        },
      ]}
    >
      <View
        style={[
          styles.infoIcon,
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

      <View
        style={styles.infoContent}
      >
        <Text
          style={[
            styles.infoLabel,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.infoValue,
            {
              color:
                theme.text,
            },
          ]}
        >
          {value || t('operator.profile.notRegistered')}
        </Text>
      </View>
    </View>
  )
}

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
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 18,
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
    borderRadius: 65,
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
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: -0.2,
  },

  email: {
    fontSize: 13,
    marginTop: 5,
    maxWidth: '90%',
    textAlign: 'center',
  },

  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },

  profileBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    marginLeft: 5,
    letterSpacing: 0.3,
  },

  card: {
    borderRadius: 22,
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
    fontSize: 17,
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

  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },

  avatarOption: {
    width: 66,
    height: 66,
    borderRadius: 20,
    borderWidth: 2,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  avatarOptionImage: {
    width: 54,
    height: 54,
    borderRadius: 17,
  },

  avatarCheck: {
    position: 'absolute',
    right: -4,
    top: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },

  avatarSaving: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  avatarSavingText: {
    fontSize: 12,
    marginLeft: 7,
    fontWeight: '600',
  },

  readOnlyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 16,
  },

  readOnlyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  readOnlyContent: {
    flex: 1,
  },

  readOnlyTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  readOnlyText: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 4,
  },

  menuCard: {
    paddingVertical: 3,
  },

  avatarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
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
    marginTop: 3,
  },

  logout: {
    height: 57,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },

  logoutIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
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
