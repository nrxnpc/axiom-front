import { useState, useEffect } from 'react';
import { List, Datagrid, TextField, NumberField, DateField } from 'react-admin';
import { ListActions } from '../components/ListActions';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { API_URL } from '../config';

interface Car {
  id: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: string;
  imageURL?: string;
  description?: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  bodyType?: string;
  drivetrain?: string;
  color?: string;
  createdAt?: string;
}

interface CarDetailsModalProps {
  open: boolean;
  onClose: () => void;
  car: Car | null;
}

const CarDetailsModal = ({ open, onClose, car }: CarDetailsModalProps) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (open && car) {
      setImageError(false);
    }
  }, [open, car]);

  if (!car) {
    return null;
  }

  const getImageUrl = (imageURL?: string): string => {
    if (!imageURL) return '';
    if (imageURL.startsWith('http')) {
      return imageURL;
    }
    if (imageURL.startsWith('/')) {
      return `${API_URL.replace('/api/v1', '')}${imageURL}`;
    }
    return `${API_URL.replace('/api/v1', '')}/${imageURL}`;
  };

  const imageUrl = car.imageURL ? getImageUrl(car.imageURL) : '';
  const showPlaceholder = !imageUrl || imageError;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Детали автомобиля</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {car.brand && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Марка
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {car.brand}
                </Typography>
              </Box>
            )}
            {car.model && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Модель
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {car.model}
                </Typography>
              </Box>
            )}
            {car.year && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Год
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {car.year}
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {showPlaceholder ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    aspectRatio: '4/3',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                  }}
                >
                  <CameraAltIcon sx={{ fontSize: 48, color: '#999', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Изображение отсутствует
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '400px',
                    aspectRatio: '4/3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`${car.brand || ''} ${car.model || ''}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1" gutterBottom>
              {car.id || '-'}
            </Typography>
          </Grid>
          {car.price && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Цена
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.price}
              </Typography>
            </Grid>
          )}
          {car.description && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Описание
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.description}
              </Typography>
            </Grid>
          )}
          {car.engine && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Двигатель
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.engine}
              </Typography>
            </Grid>
          )}
          {car.transmission && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Коробка передач
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.transmission}
              </Typography>
            </Grid>
          )}
          {car.fuelType && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Тип топлива
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.fuelType}
              </Typography>
            </Grid>
          )}
          {car.bodyType && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Тип кузова
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.bodyType}
              </Typography>
            </Grid>
          )}
          {car.drivetrain && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Привод
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.drivetrain}
              </Typography>
            </Grid>
          )}
          {car.color && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Цвет
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.color}
              </Typography>
            </Grid>
          )}
          {car.createdAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Дата создания
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(car.createdAt).toLocaleString('ru-RU', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export const CarList = () => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (id: string, resource: string, record: Car) => {
    setSelectedCar(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCar(null);
  };

  return (
    <>
      <List actions={<ListActions />}>
        <Datagrid
          rowClick={handleRowClick}
        >
          <TextField source="brand" label="Марка" />
          <TextField source="model" label="Модель" />
          <NumberField source="year" label="Год" />
          <TextField source="price" label="Цена" />
          <DateField source="createdAt" label="Создан" showTime />
        </Datagrid>
      </List>
      <CarDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        car={selectedCar}
      />
    </>
  );
};
