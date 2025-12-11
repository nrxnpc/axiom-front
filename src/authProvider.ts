import { AuthProvider } from 'react-admin';
import { API_URL, API_KEY } from './config';
import { LoginParams, ApiError } from './types';
import { userStore } from './userStore';

interface AuthData {
  success: boolean;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

interface UserMeResponse {
  user: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    userType?: string;
    points?: number;
    role?: string;
    registrationDate?: string;
    lastLogin?: string;
    isActive?: boolean;
  };
}

const getAuthData = (): AuthData | null => {
  const auth = localStorage.getItem('auth');
  if (!auth) return null;
  try {
    return JSON.parse(auth) as AuthData;
  } catch {
    return null;
  }
};

const fetchUserMe = async (accessToken: string): Promise<UserMeResponse> => {
  const response = await fetch(`${API_URL}/user/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to fetch user data');
  }

  return await response.json() as UserMeResponse;
};

const refreshAccessToken = async (): Promise<AuthData> => {
  const authData = getAuthData();
  if (!authData?.refresh_token) {
    throw new Error('No refresh token');
  }

  const response = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ refresh_token: authData.refresh_token }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const newAuthData = await response.json() as AuthData;
  if (!newAuthData.success || !newAuthData.access_token) {
    throw new Error('Invalid refresh token response');
  }
  
  localStorage.setItem('auth', JSON.stringify({
    success: newAuthData.success,
    access_token: newAuthData.access_token,
    refresh_token: newAuthData.refresh_token,
    expires_in: newAuthData.expires_in,
  }));

  try {
    const userMeData = await fetchUserMe(newAuthData.access_token);
    userStore.setUser(userMeData.user);
  } catch (error) {
    console.error('Failed to fetch user data after token refresh:', error);
  }

  return newAuthData;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const authProvider: AuthProvider = {
  login: async (params: LoginParams) => {
    const email = params.email || params.username || '';
    const password = params.password || '';

    if (!email || !validateEmail(email)) {
      throw new Error('Введите корректный email');
    }

    if (!password || password.length === 0) {
      throw new Error('Введите пароль');
    }

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Неверный email или пароль');
    }

    const authData = await response.json() as AuthData;
    
    if (!authData.success || !authData.access_token) {
      throw new Error('Ошибка авторизации');
    }

    localStorage.setItem('auth', JSON.stringify({
      success: authData.success,
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_in: authData.expires_in,
    }));

    try {
      const userMeData = await fetchUserMe(authData.access_token);
      userStore.setUser(userMeData.user);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }

    return Promise.resolve();
  },

  logout: () => {
    userStore.clearUser();
    localStorage.removeItem('auth');
    return Promise.resolve();
  },

  checkAuth: () => {
    const authData = getAuthData();
    if (!authData?.access_token) {
      return Promise.reject(new Error('No access token'));
    }
    if (authData.access_token.trim() === '') {
      return Promise.reject(new Error('Empty access token'));
    }
    return Promise.resolve();
  },

  checkError: (error) => {
    const apiError = error as ApiError;
    const status = apiError.status;
    const isPermissionError = apiError.isPermissionError;
    
    if (isPermissionError) {
      return Promise.resolve();
    }
    
    if (status === 401) {
      return refreshAccessToken()
        .then(() => Promise.resolve())
        .catch(() => {
          userStore.clearUser();
          localStorage.removeItem('auth');
          return Promise.reject();
        });
    }
    if (status === 403) {
      const errorBody = apiError.body;
      if (errorBody?.error && typeof errorBody.error === 'string' && 
          (errorBody.error.includes('Only companies') || 
           errorBody.error.includes('access') || 
           errorBody.error.includes('permission'))) {
        return Promise.resolve();
      }
      
      userStore.clearUser();
      localStorage.removeItem('auth');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: async () => {
    let user = userStore.getUser();
    
    if (!user) {
      const authData = getAuthData();
      if (authData?.access_token) {
        try {
          const userMeData = await fetchUserMe(authData.access_token);
          user = userMeData.user;
          userStore.setUser(user);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          return Promise.reject();
        }
      } else {
        return Promise.reject();
      }
    }

    if (!user) {
      return Promise.reject();
    }

    return Promise.resolve({
      id: user.id,
      fullName: user.name || user.email,
    });
  },

  getPermissions: async () => {
    const user = userStore.getUser();
    return user?.role || '';
  },
};

