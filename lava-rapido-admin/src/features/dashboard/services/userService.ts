import { api } from "@/services/api";
import type { UserProfile } from "@/features/dashboard/types";

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/profile");
  return response.data;
};

export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put<UserProfile>("/users/profile", {
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    profilePicture: data.profilePicture,
  });
  return response.data;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const changePassword = async (data: ChangePasswordPayload): Promise<void> => {
  await api.put("/users/password", data);
};
