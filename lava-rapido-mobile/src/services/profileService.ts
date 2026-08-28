import api from './api';

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string | null;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture?: string;
}

export const profileService = {
  getProfile: () =>
    api.get<UserProfile>('/api/users/profile'),

  update: (data: UpdateProfileData) =>
    api.put<UserProfile>('/api/users/profile', data),
};