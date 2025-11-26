import { useGetList } from 'react-admin';
import { Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';

export const AnalyticsList = () => {
  const { data, isLoading, error } = useGetList('company/analytics', {
    pagination: { page: 1, perPage: 1 },
    sort: { field: 'id', order: 'ASC' },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Ошибка загрузки аналитики</Alert>
      </Box>
    );
  }

  const analyticsData = data && data.length > 0 ? data[0] : null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Аналитика компании
      </Typography>
      {analyticsData ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(analyticsData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography>Данные аналитики отсутствуют</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

