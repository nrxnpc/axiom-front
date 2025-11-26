import { useState } from 'react';
import { useLogin, useNotify, AdminContext } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Link,
  Alert,
} from '@mui/material';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { i18nProvider } from './i18nProvider';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login({ email, password });
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || 'Неверный email или пароль';
      setError(errorMessage);
      notify(errorMessage, { type: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        autoFocus
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        required
        autoComplete="email"
      />
      <TextField
        fullWidth
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
        autoComplete="current-password"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Войти
      </Button>
    </form>
  );
};

export const LoginPage = () => {
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
          <Card sx={{ minWidth: 300, maxWidth: 400 }}>
            <CardContent sx={{ padding: 4 }}>
              <Typography variant="h5" component="h1" gutterBottom align="center">
                Вход в систему
              </Typography>
              <LoginForm />
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link 
                  href="/register" 
                  underline="hover" 
                  sx={{ 
                    fontSize: '0.875rem',
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark',
                    }
                  }}
                >
                  Нет аккаунта? Зарегистрироваться
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </AdminContext>
    </Box>
  );
};
