import type { ImageSourcePropType } from 'react-native'

export type UserProfile = {
  userId: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  profilePicture: string | null
}

export type AvatarKey = 'avatar_1' | 'avatar_2' | 'avatar_3' | 'avatar_4' | 'avatar_5'

export type AvatarOption = { key: AvatarKey; image: ImageSourcePropType }
