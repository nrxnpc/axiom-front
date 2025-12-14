import { useGetList } from 'react-admin';
import { Card, CardContent, Typography, Box, CircularProgress, Alert, Grid, Divider } from '@mui/material';
import { useMemo } from 'react';

export const StatisticsList = () => {
  const queryOptions = useMemo(() => ({
    pagination: { page: 1, perPage: 1 },
  }), []);
  
  const { data, isLoading, error } = useGetList('statistics', queryOptions);

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
        <Alert severity="error">
          Ошибка загрузки статистики: {error instanceof Error ? error.message : String(error)}
        </Alert>
      </Box>
    );
  }

  const statisticsData = data && data.length > 0 ? data[0] : null;

  if (!statisticsData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Статистика
        </Typography>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography>Данные статистики отсутствуют</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Статистика
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                QR-коды
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Всего:</Typography>
                  <Typography fontWeight="bold">{statisticsData.qr_codes?.total || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Неиспользованные:</Typography>
                  <Typography fontWeight="bold">{statisticsData.qr_codes?.unused || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Использованные:</Typography>
                  <Typography fontWeight="bold">{statisticsData.qr_codes?.used || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Всего сканирований:</Typography>
                  <Typography fontWeight="bold">{statisticsData.qr_codes?.total_scans || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Пользователи
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Всего:</Typography>
                  <Typography fontWeight="bold">{statisticsData.users?.total || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Активных:</Typography>
                  <Typography fontWeight="bold">{statisticsData.users?.active || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Сканирования
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Всего:</Typography>
                  <Typography fontWeight="bold">{statisticsData.scans?.total || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Уникальных сканеров:</Typography>
                  <Typography fontWeight="bold">{statisticsData.scans?.unique_scanners || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Всего заработано баллов:</Typography>
                  <Typography fontWeight="bold">{statisticsData.scans?.total_points_earned || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {statisticsData.timestamp && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Обновлено: {formatDate(statisticsData.timestamp)}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

