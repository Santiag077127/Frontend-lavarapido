import api from './api';

export type UserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string | null;
};

export type CurrentUser = {
  userId: string;
  firstName: string;
  email: string;
  role: 'USER' | 'OPERATOR' | 'ADMIN';
};

export const userService = {

  getCurrent: async (): Promise<CurrentUser> => {
    const response = await api.get<CurrentUser>('/api/users/me');
    return response.data;
  },

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
