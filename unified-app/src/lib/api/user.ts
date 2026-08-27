import { apiClient } from './client';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface UserResponse {
  data: User;
  message: string;
}

export const updateUser = async (id: string, params: Partial<User>): Promise<UserResponse> => {
  const { _id, ...rest } = params;
  return apiClient<UserResponse>(`users/${id || _id}`, {
    method: 'PUT',
    body: rest,
  });
};

// Uploads a user's own profile picture directly to storage from the
// browser, bypassing this app's own API route entirely for the file bytes.
// Vercel caps a serverless function's request body around 4.5MB at the
// platform level — a real phone photo can exceed that.
export const uploadProfilePictureDirect = async (userId: string, file: File): Promise<{ key: string }> => {
  const { data } = await apiClient<{ data: { key: string; uploadUrl: string } }>(
    `users/${userId}/profile-picture-upload-url`,
    {
      method: 'POST',
      body: { filename: file.name, contentType: file.type, sizeBytes: file.size },
    },
  );
  const putResponse = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!putResponse.ok) {
    throw new Error('Failed to upload profile picture to storage');
  }
  return { key: data.key };
};

export interface Countdown {
  id: string;
  title: string;
  description?: string;
  launchDate: string;
  status: string;
  isActive: boolean;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  timezone?: string;
  customMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const getCountdown = async (): Promise<{ data: Countdown }> => {
  return apiClient(`countdown/active`, {
    method: 'GET',
  });
};
