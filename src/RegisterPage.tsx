import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AdminContext, SimpleForm, TextInput, PasswordInput, required, email, minLength } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { i18nProvider } from './i18nProvider';
import { API_URL, API_KEY } from './config';

const RegisterForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const handleSubmit = async (data: Record<string, unknown>) => {
    setError(null);
    setLoading(true);

    try {
      const registerAndLogin = async () => {
        setLoadingStep('Регистрация...');
        const registerResponse = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            userType: 'individual',
          }),
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Ошибка регистрации');
        }

        setLoadingStep('Авторизация...');
        const loginResponse = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        if (!loginResponse.ok) {
          const errorData = await loginResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Ошибка авторизации после регистрации');
        }

        const authData = await loginResponse.json();
        
        if (!authData.success || !authData.access_token) {
          throw new Error('Ошибка авторизации: не получены токены');
        }

        return authData;
      };

      const authData = await registerAndLogin();
      
      const authDataToSave = {
        success: authData.success,
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in: authData.expires_in,
        user: authData.user,
      };
      localStorage.setItem('auth', JSON.stringify(authDataToSave));
      
      const savedAuth = localStorage.getItem('auth');
      if (!savedAuth) {
        throw new Error('Не удалось сохранить токены');
      }
      
      window.location.replace('/');
        } catch (err) {
          const error = err as Error;
          setError(error.message || 'Ошибка регистрации');
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              padding: 4,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography>{loadingStep || 'Обработка...'}</Typography>
          </Box>
        </Box>
      )}
      <SimpleForm onSubmit={handleSubmit} toolbar={<RegisterToolbar loading={loading} />}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextInput
          source="name"
          label="Имя"
          validate={[required()]}
          fullWidth
          disabled={loading}
        />
        <TextInput
          source="email"
          label="Email"
          type="email"
          validate={[required(), email()]}
          fullWidth
          disabled={loading}
        />
        <TextInput
          source="phone"
          label="Телефон"
          validate={[required()]}
          fullWidth
          disabled={loading}
        />
        <PasswordInput
          source="password"
          label="Пароль"
          validate={[required(), minLength(6)]}
          fullWidth
          disabled={loading}
        />
      </SimpleForm>
    </>
  );
};

const RegisterToolbar = ({ loading }: { loading: boolean }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
    <Button
      type="submit"
      variant="contained"
      disabled={loading}
      sx={{ minWidth: 120 }}
    >
      {loading ? 'Регистрация...' : 'Зарегистрироваться'}
    </Button>
  </Box>
);

export const RegisterPage = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AdminContext
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
        <Card sx={{ minWidth: 400, maxWidth: 600 }}>
          <CardContent sx={{ padding: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom align="center">
              Регистрация
            </Typography>
            <RegisterForm />
            <Box sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
              <Link href="/login" underline="hover">
                Уже есть аккаунт? Войти
              </Link>
            </Box>
          </CardContent>
        </Card>
        </Box>
      </AdminContext>
    </Box>
  );
};

