import { useState, useEffect } from 'react';
import { List, Datagrid, TextField, NumberField, DateField, BooleanField, useRedirect, BulkDeleteButton } from 'react-admin';
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

interface Product {
  id: string;
  name?: string;
  category?: string;
  pointsCost?: number;
  stockQuantity?: number;
  isActive?: boolean;
  imageURL?: string;
  description?: string;
  createdAt?: string;
}

interface ProductDetailsModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetailsModal = ({ open, onClose, product }: ProductDetailsModalProps) => {
  const [imageError, setImageError] = useState(false);
  const redirect = useRedirect();

  useEffect(() => {
    if (open && product) {
      setImageError(false);
    }
  }, [open, product]);

  const handleEdit = () => {
    if (product?.id) {
      redirect(`/products/${product.id}`, undefined, undefined, { record: product });
      onClose();
    }
  };

  if (!product) {
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

  const imageUrl = product.imageURL ? getImageUrl(product.imageURL) : '';
  const showPlaceholder = !imageUrl || imageError;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Детали товара</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {product.name && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Название
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
              </Box>
            )}
            {product.category && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Категория
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {product.category}
                </Typography>
              </Box>
            )}
            {product.stockQuantity !== undefined && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Количество
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {product.stockQuantity}
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
                    alt={product.name || 'Товар'}
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
              {product.id || '-'}
            </Typography>
          </Grid>
          {product.pointsCost !== undefined && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Стоимость в баллах
              </Typography>
              <Typography variant="body1" gutterBottom>
                {product.pointsCost}
              </Typography>
            </Grid>
          )}
          {product.isActive !== undefined && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Активен
              </Typography>
              <Typography variant="body1" gutterBottom>
                {product.isActive ? 'Да' : 'Нет'}
              </Typography>
            </Grid>
          )}
          {product.description && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Описание
              </Typography>
              <Typography variant="body1" gutterBottom>
                {product.description}
              </Typography>
            </Grid>
          )}
          {product.createdAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Дата создания
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(product.createdAt).toLocaleString('ru-RU', {
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
        <Button onClick={handleEdit} variant="contained" color="primary">
          Редактировать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ProductList = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (id: string, resource: string, record: Product) => {
    setSelectedProduct(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <List actions={<ListActions />} bulkActionButtons={<BulkDeleteButton />}>
        <Datagrid rowClick={handleRowClick}>
          <TextField source="name" label="Название" />
          <TextField source="category" label="Категория" />
          <NumberField source="pointsCost" label="Стоимость в баллах" />
          <NumberField source="stockQuantity" label="Остаток" />
          <BooleanField source="isActive" label="Активен" />
          <DateField source="createdAt" label="Создан" />
        </Datagrid>
      </List>
      <ProductDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </>
  );
};

