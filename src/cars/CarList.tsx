import { useState } from 'react';
import { List, Datagrid, TextField, NumberField, DateField, FunctionField } from 'react-admin';
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
} from '@mui/material';

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
  if (!car) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Детали автомобиля</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {car.imageURL && (
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <img
                  src={car.imageURL}
                  alt={`${car.brand || ''} ${car.model || ''}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1" gutterBottom>
              {car.id || '-'}
            </Typography>
          </Grid>
          {car.brand && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Марка
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.brand}
              </Typography>
            </Grid>
          )}
          {car.model && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Модель
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.model}
              </Typography>
            </Grid>
          )}
          {car.year && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Год
              </Typography>
              <Typography variant="body1" gutterBottom>
                {car.year}
              </Typography>
            </Grid>
          )}
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
          <FunctionField
            source="id"
            label="ID"
            render={(record: any) => {
              const id = record?.id || '';
              if (id.length <= 12) {
                return id;
              }
              return `${id.substring(0, 6)}...${id.substring(id.length - 6)}`;
            }}
          />
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
