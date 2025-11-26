import { useGetList } from 'react-admin';
import { Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';

export const StatisticsList = () => {
  const { data, isLoading, error } = useGetList('statistics', {
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
        <Alert severity="error">Ошибка загрузки статистики</Alert>
      </Box>
    );
  }

  const statisticsData = data && data.length > 0 ? data[0] : null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Статистика
      </Typography>
      {statisticsData ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(statisticsData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography>Данные статистики отсутствуют</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

