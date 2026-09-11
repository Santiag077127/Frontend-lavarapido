import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

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

import {
  images,
} from '../../../assets/images'

import api from '../../../services/api'

const PRIMARY_COLOR = '#2563EB'

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

export default function EditProfileScreen() {
  const navigation =
    useNavigation<any>()

  const themeContext =
    useContext(ThemeContext)

  const darkMode =
    themeContext?.darkMode ?? false

  const theme =
    themeContext?.theme ?? {
      background: '#BFD0DB',
      card: '#FFFFFF',
      text: '#000000',
      textSecondary: '#555555',
    }

  const [profile, setProfile] =
    useState<UserProfile | null>(null)

  const [firstName, setFirstName] =
    useState('')

  const [lastName, setLastName] =
    useState('')

  const [phoneNumber, setPhoneNumber] =
    useState('')

  const [profilePicture, setProfilePicture] =
    useState<AvatarKey>('avatar_1')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

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

          const response =
            await api.get<UserProfile>(
              '/api/users/profile'
            )

          const data =
            response.data

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
          console.log(
            'ERROR CARGANDO PERFIL:',
            error?.response?.data ||
              error?.message
          )

          Alert.alert(
            'Error',
            'No fue posible cargar tus datos.'
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
    if (saving) {
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
        'Dato requerido',
        'Ingresa tu nombre.'
      )

      return false
    }

    if (!cleanLastName) {
      Alert.alert(
        'Dato requerido',
        'Ingresa tu apellido.'
      )

      return false
    }

    if (!cleanPhone) {
      Alert.alert(
        'Dato requerido',
        'Ingresa tu número de teléfono.'
      )

      return false
    }

    if (
      cleanPhone.length < 7
    ) {
      Alert.alert(
        'Teléfono inválido',
        'Ingresa un número de teléfono válido.'
      )

      return false
    }

    return true
  }

  const handleSave = async () => {
    if (saving) {
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)

      const response =
        await api.put<UserProfile>(
          '/api/users/profile',
          {
            firstName:
              firstName.trim(),

            lastName:
              lastName.trim(),

            phoneNumber:
              phoneNumber.trim(),

            profilePicture:
              profilePicture,
          }
        )

      setProfile(
        response.data
      )

      Alert.alert(
        'Cambios guardados',
        'Tu perfil se actualizó correctamente.',
        [
          {
            text: 'Aceptar',
            onPress: () =>
              navigation.goBack(),
          },
        ]
      )
    } catch (error: any) {
      console.log(
        'ERROR ACTUALIZANDO PERFIL:',
        error?.response?.data ||
          error?.message
      )

      let message =
        'No fue posible actualizar tu perfil.'

      if (
        error?.response?.data?.message
      ) {
        message =
          error.response.data.message
      } else if (
        typeof error?.response?.data ===
        'string'
      ) {
        message =
          error.response.data
      }

      Alert.alert(
        'Error',
        message
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (saving) {
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
            color={PRIMARY_COLOR}
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
            Cargando perfil
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
            Un momento, por favor
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
                darkMode
                  ? '#303B4A'
                  : '#E2E8F0',
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleCancel}
            style={[
              styles.backButton,
              {
                backgroundColor:
                  darkMode
                    ? '#263241'
                    : '#F1F5F9',
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={theme.text}
            />
          </TouchableOpacity>

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
              Editar perfil
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
              Actualiza tu información personal
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
                darkMode
                  ? '#303B4A'
                  : '#E2E8F0',
            },
          ]}
        >
          <View
            style={[
              styles.avatarWrapper,
              {
                borderColor:
                  PRIMARY_COLOR,
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
            Foto de perfil
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
            Selecciona uno de los avatares
          </Text>

          <View
            style={styles.avatarGrid}
          >
            {AVATARS.map(item => {
              const selected =
                selectedAvatar ===
                item.key

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.75}
                  disabled={saving}
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
                            PRIMARY_COLOR,
                          borderColor:
                            theme.card,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="#FFFFFF"
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
                Modifica tus datos
              </Text>
            </View>
          </View>

          <FormInput
            label="Nombre"
            value={firstName}
            onChangeText={
              setFirstName
            }
            placeholder="Ingresa tu nombre"
            icon="person-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving}
          />

          <FormInput
            label="Apellido"
            value={lastName}
            onChangeText={
              setLastName
            }
            placeholder="Ingresa tu apellido"
            icon="person-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving}
          />

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
              Correo electrónico
            </Text>

            <View
              style={[
                styles.inputContainer,
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
              <View
                style={[
                  styles.inputIcon,
                  {
                    backgroundColor:
                      darkMode
                        ? '#263241'
                        : '#EEF4FF',
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={
                    theme.textSecondary
                  }
                />
              </View>

              <Text
                style={[
                  styles.disabledEmail,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {profile?.email ||
                  'Sin correo'}
              </Text>

              <Ionicons
                name="lock-closed-outline"
                size={17}
                color={
                  theme.textSecondary
                }
              />
            </View>

            <Text
              style={[
                styles.helperText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              El correo no puede modificarse desde aquí.
            </Text>
          </View>

          <FormInput
            label="Teléfono"
            value={phoneNumber}
            onChangeText={
              setPhoneNumber
            }
            placeholder="Ingresa tu teléfono"
            icon="call-outline"
            theme={theme}
            darkMode={darkMode}
            editable={!saving}
            keyboardType="phone-pad"
          />
        </View>

        {/* BOTONES */}

        <View
          style={styles.actions}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleCancel}
            style={[
              styles.cancelButton,
              {
                backgroundColor:
                  darkMode
                    ? '#263241'
                    : '#FFFFFF',

                borderColor:
                  darkMode
                    ? '#3A4655'
                    : '#CBD5E1',

                opacity:
                  saving ? 0.6 : 1,
              },
            ]}
          >
            <Ionicons
              name="close-outline"
              size={20}
              color={theme.text}
            />

            <Text
              style={[
                styles.cancelText,
                {
                  color:
                    theme.text,
                },
              ]}
            >
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSave}
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  PRIMARY_COLOR,
                opacity:
                  saving ? 0.75 : 1,
              },
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
              />
            )}

            <Text
              style={styles.saveText}
            >
              {saving
                ? 'Guardando...'
                : 'Guardar cambios'}
            </Text>
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
            Tus datos se mantienen protegidos.
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
        <View
          style={[
            styles.inputIcon,
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

        <TextInput
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
          style={[
            styles.input,
            {
              color:
                theme.text,
            },
          ]}
          autoCapitalize="words"
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
    paddingHorizontal: 18,
    paddingTop: 16,
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

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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

  disabledEmail: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },

  helperText: {
    fontSize: 10.5,
    marginTop: 5,
    marginLeft: 2,
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
    color: '#FFFFFF',
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

