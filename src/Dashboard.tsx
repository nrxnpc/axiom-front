import { Card, CardContent, Typography } from '@mui/material';

export const Dashboard = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Добро пожаловать
        </Typography>
        <Typography variant="body1">
          Панель управления Axiom
        </Typography>
      </CardContent>
    </Card>
  );
};

