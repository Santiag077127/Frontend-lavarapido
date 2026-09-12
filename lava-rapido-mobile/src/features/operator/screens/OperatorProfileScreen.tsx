
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
} from '@react-navigation/native'

import { ThemeContext } from '../../../theme/ThemeContext'

import {
  appAlert as Alert,
} from '../../../components/notifications/NotificationProvider'

import {
  images,
} from '../../../assets/images'

import api, {
  setToken,
} from '../../../services/api'

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

export default function OperatorProfileScreen({
  setIsLoggedIn,
}: Props) {
  const themeContext =
    useContext(ThemeContext)

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
        'Avatar actualizado',
        'Tu foto de perfil se actualizó correctamente.'
      )
    } catch (error: any) {
      console.log(
        'ERROR CAMBIANDO AVATAR:',
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
        error?.response?.data?.message ||
          'No fue posible actualizar tu avatar.'
      )
    } finally {
      setSavingAvatar(false)
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
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={PRIMARY_COLOR}
          colors={[
            PRIMARY_COLOR,
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
          {fullName || 'Operador'}
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
            'Sin correo'}
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
            name="shield-checkmark-outline"
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
            OPERADOR
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
              Datos registrados de tu cuenta
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

      {/* CAMBIAR AVATAR */}

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
              name="image-outline"
              size={20}
              color={PRIMARY_COLOR}
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
              Foto de perfil
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
              Selecciona el avatar que quieras utilizar
            </Text>
          </View>
        </View>

        <View
          style={styles.avatarGrid}
        >
          {AVATARS.map(
            avatar => {
              const isSelected =
                selectedAvatar ===
                avatar.key

              return (
                <TouchableOpacity
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
                          ? PRIMARY_COLOR
                          : darkMode
                            ? '#3A4655'
                            : '#E2E8F0',
                      backgroundColor:
                        darkMode
                          ? '#202B38'
                          : '#F8FAFC',
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
                            PRIMARY_COLOR,
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
                PRIMARY_COLOR
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
              Guardando avatar...
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
              name="briefcase-outline"
              size={20}
              color={PRIMARY_COLOR}
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
              Información de cuenta
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
              Información asociada a tu rol
            </Text>
          </View>
        </View>

        <InfoItem
          icon="shield-checkmark-outline"
          label="Rol"
          value="Operador"
          theme={theme}
          darkMode={darkMode}
        />

        <InfoItem
          icon="checkmark-circle-outline"
          label="Estado"
          value="Activo"
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
            backgroundColor:
              darkMode
                ? '#1D2938'
                : '#F0F7FF',
            borderColor:
              darkMode
                ? '#334155'
                : '#D7E8FF',
          },
        ]}
      >
        <View
          style={[
            styles.readOnlyIcon,
            {
              backgroundColor:
                darkMode
                  ? '#263B56'
                  : '#E2EEFF',
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={PRIMARY_COLOR}
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
            Datos protegidos
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
            Tus datos personales son
            administrados por el sistema.
            Puedes cambiar únicamente tu
            avatar y la apariencia de la
            aplicación.
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
              Apariencia
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
              Personaliza la apariencia de la aplicación
            </Text>
          </View>
        </View>

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

      {/* CERRAR SESIÓN */}

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
    borderColor: '#FFFFFF',
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