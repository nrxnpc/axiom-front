import { AuthProvider } from 'react-admin';
import { API_URL, API_KEY } from './config';
import { LoginParams, ApiError } from './types';

interface AuthData {
  success: boolean;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    userType?: string;
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
  localStorage.setItem('auth', JSON.stringify(newAuthData));
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

    localStorage.setItem('auth', JSON.stringify(authData));
    window.location.replace('/');
    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem('auth');
    window.location.replace('/login');
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
          localStorage.removeItem('auth');
          window.location.replace('/login');
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
      
      localStorage.removeItem('auth');
      window.location.replace('/login');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    const authData = getAuthData();
    if (!authData?.user) {
      return Promise.reject();
    }
    return Promise.resolve({
      id: authData.user.id,
      fullName: authData.user.name || authData.user.email,
    });
  },

  getPermissions: () => Promise.resolve(''),
};

