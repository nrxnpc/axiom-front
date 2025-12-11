import { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress, Alert, Paper } from '@mui/material';
import { API_URL, API_KEY } from '../config';

export const UserMeTest = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserMe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const auth = localStorage.getItem('auth');
      let token = API_KEY;
      
      if (auth) {
        try {
          const authData = JSON.parse(auth);
          token = authData.access_token || API_KEY;
        } catch {
        }
      }

      const response = await fetch(`${API_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Тест эндпоинта user/me
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={fetchUserMe} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        Запросить user/me
      </Button>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {data && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ответ от сервера:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', overflow: 'auto' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

