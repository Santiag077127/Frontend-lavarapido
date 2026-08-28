import api from './api';

export type UserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string | null;
};

export const userService = {

  getProfile: async (): Promise<UserProfile> => {

    const response =
      await api.get<UserProfile>(
        '/api/users/profile'
      );

    return response.data;
  },


  updateProfile: async (data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profilePicture?: string;
  }): Promise<UserProfile> => {

    const response =
      await api.put<UserProfile>(
        '/api/users/profile',
        data
      );

    return response.data;
  },

};