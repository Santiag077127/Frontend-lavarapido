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

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { ThemeContext } from '../../../theme/ThemeContext'
import ConfirmationModal from '../../../components/notifications/ConfirmationModal'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'
import api, { setToken } from '../../../services/api'
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

        Alert.alert(
          t('profile.errorTitle'),
          !error?.response
            ? t('profile.connectionError')
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
      const message = !error?.response
        ? t('profile.connectionError')
        : status === 400
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

  const fullName =
    `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()

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

        <View style={styles.profileIdentity}>
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
              name="person-circle-outline"
              size={15}
              color={theme.primary}
            />

            <Text
              style={[
                styles.profileBadgeText,
                {
                  color: theme.primary,
                },
              ]}
            >
              {t('profile.title')}
            </Text>
          </View>

          <Text
            style={[
              styles.name,
              {
                color: theme.text,
                fontSize: isSmallScreen ? 20 : 23,
              },
            ]}
            numberOfLines={2}
          >
            {fullName || t('profile.defaultUser')}
          </Text>

          <Text
            style={[
              styles.email,
              {
                color: theme.textSecondary,
              },
            ]}
            numberOfLines={2}
          >
            {profile.email || t('profile.noEmail')}
          </Text>
        </View>
      </View>

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
            style={styles.sectionHeaderText}
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
              {t('profile.personalInfo')}
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
              {t('profile.registeredData')}
            </Text>
          </View>
        </View>

        <InfoItem
          icon="person-outline"
          label={t('profile.firstName')}
          value={profile.firstName}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="person-outline"
          label={t('profile.lastName')}
          value={profile.lastName}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="mail-outline"
          label={t('profile.email')}
          value={profile.email}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="call-outline"
          label={t('profile.phone')}
          value={profile.phoneNumber}
          theme={theme}
          darkMode={darkMode}
          last
        />
      </View>

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
              {t('profile.chooseAvatar')}
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
              {t('profile.avatarDescription')}
            </Text>
          </View>

          {changingAvatar && (
            <ActivityIndicator
              size="small"
              color={theme.primary}
            />
          )}
        </View>

        <View
          style={[
            styles.avatarGrid,
            {
              backgroundColor:
                theme.inputBackground,
              borderColor:
                theme.border,
            },
          ]}
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
                accessibilityState={{ selected, disabled: changingAvatar }}
                activeOpacity={0.75}
                disabled={
                  changingAvatar
                }
                onPress={() =>
                  handleChangeAvatar(
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
                    styles.avatarMini
                  }
                  resizeMode="cover"
                />

                {selected && (
                  <View
                    style={[
                      styles.check,
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
                      size={13}
                      color={theme.onPrimary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

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
        <MenuItem
          icon="create-outline"
          title={t('profile.edit')}
          description={t('profile.editDescription')}
          onPress={() =>
            navigation.navigate(
              'EditProfile'
            )
          }
          theme={theme}
          darkMode={darkMode}
        />

        <MenuItem
          icon="key-outline"
          title={t('changePassword.menuTitle')}
          description={t('changePassword.menuDescription')}
          onPress={() => navigation.navigate('ChangePassword')}
          theme={theme}
          darkMode={darkMode}
        />

        <MenuItem
          icon="car-outline"
          title={t('profile.vehicles')}
          description={t('profile.vehiclesDescription')}
          onPress={() =>
            navigation.navigate(
              'MyVehicles'
            )
          }
          theme={theme}
          darkMode={darkMode}
        />

        <MenuItem
          icon="settings-outline"
          title={t('profile.settings')}
          description={t('profile.settingsDescription')}
          onPress={() => {}}
          theme={theme}
          darkMode={darkMode}
        />

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

            <View>
              <Text
                style={[
                  styles.menuTitle,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                {t('profile.darkMode')}
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
                  ? t('profile.enabled')
                  : t('profile.disabled')}
              </Text>
            </View>
          </View>

          <Switch
            accessibilityLabel={t('profile.darkMode')}
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
          {t('profile.logout')}
        </Text>
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
          {value || t('profile.notRegistered')}
        </Text>
      </View>
    </View>
  )
}

function MenuItem({
  icon,
  title,
  description,
  onPress,
  theme,
  darkMode,
}: any) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[
        styles.menuItem,
        {
          borderColor:
            theme.border,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={styles.menuLeft}
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
            name={icon}
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
            {title}
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
            {description}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.icon}
      />
    </TouchableOpacity>
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
