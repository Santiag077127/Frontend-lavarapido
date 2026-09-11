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

import { ThemeContext } from '../../../theme/ThemeContext'
import { appAlert as Alert } from '../../../components/notifications/NotificationProvider'
import { images } from '../../../assets/images'
import api, { setToken } from '../../../services/api'

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

const PRIMARY_COLOR = '#2563EB'

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

  const themeContext = useContext(ThemeContext)

  const darkMode =
    themeContext?.darkMode ?? false

  const setDarkMode =
    themeContext?.setDarkMode ?? (() => {})

  const theme =
    themeContext?.theme ?? {
      background: '#BFD0DB',
      card: '#FFFFFF',
      text: '#000000',
      textSecondary: '#555555',
    }

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
          error?.response?.data ||
            error?.message
        )

        if (
          error?.response?.status === 401
        ) {
          Alert.alert(
            'Sesión expirada',
            'Debes iniciar sesión nuevamente.',
            [
              {
                text: 'Aceptar',
                onPress: logoutUser,
              },
            ]
          )

          return
        }

        Alert.alert(
          'Error',
          'No fue posible cargar tu perfil.'
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
        'Avatar actualizado',
        'Tu avatar se actualizó correctamente.'
      )
    } catch (error: any) {
      console.log(
        'ERROR AVATAR:',
        error?.response?.data ||
          error?.message
      )

      const message =
        error?.response?.data?.message ||
        (
          typeof error?.response?.data ===
          'string'
            ? error.response.data
            : 'No fue posible actualizar el avatar.'
        )

      Alert.alert(
        'Error',
        message
      )
    } finally {
      setChangingAvatar(false)
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas cerrar tu sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: logoutUser,
        },
      ]
    )
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
            color={PRIMARY_COLOR}
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
            Cargando perfil...
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
            Un momento, por favor
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
                darkMode
                  ? '#263241'
                  : '#EEF4FF',
            },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={42}
            color={PRIMARY_COLOR}
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
          No se pudo cargar el perfil
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
          Comprueba tu conexión e
          inténtalo nuevamente.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.retryButton,
            {
              backgroundColor:
                PRIMARY_COLOR,
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
            color="#FFFFFF"
          />

          <Text
            style={styles.retryText}
          >
            Intentar nuevamente
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
          tintColor={PRIMARY_COLOR}
          colors={[PRIMARY_COLOR]}
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
              darkMode
                ? '#303B4A'
                : '#E2E8F0',
          },
        ]}
      >
        <View
          style={[
            styles.avatarBorder,
            {
              borderColor:
                PRIMARY_COLOR,
            },
          ]}
        >
          <Image
            source={currentAvatar}
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
                  '#22C55E',
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
          {fullName || 'Usuario'}
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
          {profile.email || 'Sin correo'}
        </Text>

        <View
          style={[
            styles.profileBadge,
            {
              backgroundColor:
                darkMode
                  ? '#263241'
                  : '#EEF4FF',
            },
          ]}
        >
          <Ionicons
            name="person-circle-outline"
            size={15}
            color={PRIMARY_COLOR}
          />

          <Text
            style={[
              styles.profileBadgeText,
              {
                color:
                  PRIMARY_COLOR,
              },
            ]}
          >
            Mi perfil
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
              darkMode
                ? '#303B4A'
                : '#E2E8F0',
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
                  darkMode
                    ? '#263241'
                    : '#EEF4FF',
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={PRIMARY_COLOR}
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
              Información personal
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
              Tus datos registrados
            </Text>
          </View>
        </View>

        <InfoItem
          icon="person-outline"
          label="Nombre"
          value={profile.firstName}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="person-outline"
          label="Apellido"
          value={profile.lastName}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="mail-outline"
          label="Correo electrónico"
          value={profile.email}
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="call-outline"
          label="Teléfono"
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
              darkMode
                ? '#303B4A'
                : '#E2E8F0',
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
              Elegir avatar
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
              Personaliza tu imagen de perfil
            </Text>
          </View>

          {changingAvatar && (
            <ActivityIndicator
              size="small"
              color={PRIMARY_COLOR}
            />
          )}
        </View>

        <View
          style={[
            styles.avatarGrid,
            {
              backgroundColor:
                darkMode
                  ? '#171E27'
                  : '#F8FAFC',
              borderColor:
                darkMode
                  ? '#303B4A'
                  : '#E2E8F0',
            },
          ]}
        >
          {AVATARS.map(item => {
            const selected =
              selectedAvatar ===
              item.key

            return (
              <TouchableOpacity
                key={item.key}
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
                        ? PRIMARY_COLOR
                        : 'transparent',
                    backgroundColor:
                      selected
                        ? darkMode
                          ? '#263241'
                          : '#EEF4FF'
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
                          PRIMARY_COLOR,
                        borderColor:
                          theme.card,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color="#FFFFFF"
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
              darkMode
                ? '#303B4A'
                : '#E2E8F0',
          },
        ]}
      >
        <MenuItem
          icon="create-outline"
          title="Editar perfil"
          description="Actualiza tus datos"
          onPress={() =>
            navigation.navigate(
              'EditProfile'
            )
          }
          theme={theme}
          darkMode={darkMode}
        />

        <MenuItem
          icon="car-outline"
          title="Mis servicios"
          description="Consulta tus servicios"
          onPress={() =>
            navigation.navigate(
              'MyServices'
            )
          }
          theme={theme}
          darkMode={darkMode}
        />

        <MenuItem
          icon="settings-outline"
          title="Configuración"
          description="Preferencias de la aplicación"
          onPress={() => {}}
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
                    darkMode
                      ? '#263241'
                      : '#EEF4FF',
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
                color={PRIMARY_COLOR}
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
                Modo oscuro
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
                  ? 'Activado'
                  : 'Desactivado'}
              </Text>
            </View>
          </View>

          <Switch
            value={darkMode}
            onValueChange={
              setDarkMode
            }
            trackColor={{
              false: '#CBD5E1',
              true: PRIMARY_COLOR,
            }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.logout}
        onPress={handleLogout}
      >
        <View
          style={styles.logoutIcon}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#FFFFFF"
          />
        </View>

        <Text
          style={styles.logoutText}
        >
          Cerrar sesión
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
          Tu información está protegida y se mantiene privada.
        </Text>
      </View>

      <View
        style={styles.bottomSpace}
      />
    </ScrollView>
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
  return (
    <View
      style={[
        styles.infoRow,
        {
          borderColor:
            darkMode
              ? '#303B4A'
              : '#E5E7EB',
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
              darkMode
                ? '#263241'
                : '#EEF4FF',
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={PRIMARY_COLOR}
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
          {value || 'No registrado'}
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
      style={[
        styles.menuItem,
        {
          borderColor:
            darkMode
              ? '#303B4A'
              : '#E5E7EB',
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
                darkMode
                  ? '#263241'
                  : '#EEF4FF',
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={PRIMARY_COLOR}
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
        color={
          darkMode
            ? '#667085'
            : '#94A3B8'
        }
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
    color: '#FFFFFF',
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
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },

  profileBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    marginLeft: 5,
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

  avatarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
    minHeight: 72,
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
    backgroundColor: '#DC3F35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#DC3F35',
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
    backgroundColor:
      'rgba(255,255,255,0.14)',
  },

  logoutText: {
    color: '#FFFFFF',
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
