import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Link,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import { AdminContext, SimpleForm, TextInput, PasswordInput, required, email, minLength } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { i18nProvider } from './i18nProvider';
import { API_URL, API_KEY } from './config';

const MAX_CODE_ATTEMPTS = 3;

type Step = 1 | 2;

interface RequestData {
  name: string;
  email: string;
  phone: string;
  password: string;
  userType: string;
}

const RegisterForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [requestData, setRequestData] = useState<RequestData | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_CODE_ATTEMPTS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [code, setCode] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const handleRequestSubmit = async (data: Record<string, unknown>) => {
    setError(null);
    setLoading(true);
    setLoadingStep('Отправка запроса...');

    try {
      const response = await fetch(`${API_URL}/register/request`, {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Ошибка отправки запроса');
      }

      setRequestData({
        name: String(data.name),
        email: String(data.email),
        phone: String(data.phone),
        password: String(data.password),
        userType: 'individual',
      });
      setStep(2);
      setAttemptsLeft(MAX_CODE_ATTEMPTS);
      setCode('');
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestData || !code.trim()) return;
    if (attemptsLeft <= 0) return;

    setError(null);
    setLoading(true);
    setLoadingStep('Проверка кода...');

    try {
      const response = await fetch(`${API_URL}/register/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({
          email: requestData.email,
          code: code.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const newAttempts = attemptsLeft - 1;
        setAttemptsLeft(newAttempts);
        if (newAttempts <= 0) {
          setError('Попытки исчерпаны. Запросите новый код.');
        } else {
          setError(errorData.message || errorData.error || `Неверный код. Осталось попыток: ${newAttempts}`);
        }
        return;
      }

      setConfirmSuccess(true);
      setLoadingStep('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const e = err as Error;
      setError(e.message || 'Ошибка подтверждения');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleRequestNewCode = () => {
    setStep(1);
    setRequestData(null);
    setAttemptsLeft(MAX_CODE_ATTEMPTS);
    setCode('');
    setError(null);
  };

  if (confirmSuccess) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
        Регистрация завершена. Перенаправление на страницу входа...
      </Alert>
    );
  }

  if (step === 2 && requestData) {
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
            <Box sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography>{loadingStep || 'Обработка...'}</Typography>
            </Box>
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Код отправлен на {requestData.email}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Осталось попыток: {attemptsLeft}
        </Typography>
        <Box component="form" onSubmit={handleConfirmSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            label="Код из письма"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Введите 6 цифр"
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            disabled={loading || attemptsLeft <= 0}
            fullWidth
            required
          />
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Button type="submit" variant="contained" disabled={loading || attemptsLeft <= 0 || !code.trim()} fullWidth>
              {loading ? 'Проверка...' : 'Подтвердить'}
            </Button>
            {attemptsLeft <= 0 && (
              <Button type="button" variant="outlined" onClick={handleRequestNewCode} fullWidth>
                Запросить новый код
              </Button>
            )}
            <Button type="button" variant="text" onClick={handleRequestNewCode} fullWidth sx={{ mt: 1 }}>
              Изменить email
            </Button>
          </Box>
        </Box>
      </>
    );
  }

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
          <Box sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>{loadingStep || 'Обработка...'}</Typography>
          </Box>
        </Box>
      )}
      <SimpleForm onSubmit={handleRequestSubmit} toolbar={<RegisterToolbar loading={loading} />}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextInput source="name" label="Имя" validate={[required()]} fullWidth disabled={loading} />
        <TextInput source="email" label="Email" type="email" validate={[required(), email()]} fullWidth disabled={loading} />
        <TextInput source="phone" label="Телефон" validate={[required()]} fullWidth disabled={loading} />
        <PasswordInput source="password" label="Пароль" validate={[required(), minLength(6)]} fullWidth disabled={loading} />
      </SimpleForm>
    </>
  );
};

const RegisterToolbar = ({ loading }: { loading: boolean }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
    <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: 120 }}>
      {loading ? 'Отправка...' : 'Получить код'}
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
      <AdminContext dataProvider={dataProvider} authProvider={authProvider} i18nProvider={i18nProvider}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
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
