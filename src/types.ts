export interface LoginParams {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  userType?: string;
}

export interface ApiError {
  status?: number;
  isPermissionError?: boolean;
  body?: {
    error?: string;
    message?: string;
  };
  message?: string;
}

