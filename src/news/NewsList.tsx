import { useState, useEffect } from 'react';
import { List, Datagrid, TextField, BooleanField, FunctionField } from 'react-admin';
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
  Chip,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { API_URL } from '../config';

interface News {
  id: string;
  title?: string;
  content?: string;
  imageURL?: string;
  isImportant?: boolean;
  isPublished?: boolean;
  tags?: string[];
  createdAt?: string;
  publishedAt?: string;
}

interface NewsDetailsModalProps {
  open: boolean;
  onClose: () => void;
  news: News | null;
}

const NewsDetailsModal = ({ open, onClose, news }: NewsDetailsModalProps) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (open && news) {
      setImageError(false);
    }
  }, [open, news]);

  if (!news) {
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

  const imageUrl = news.imageURL ? getImageUrl(news.imageURL) : '';
  const showPlaceholder = !imageUrl || imageError;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Детали новости</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {news.title && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Заголовок
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {news.title}
                </Typography>
              </Box>
            )}
            {news.isImportant !== undefined && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Важная
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {news.isImportant ? 'Да' : 'Нет'}
                </Typography>
              </Box>
            )}
            {news.isPublished !== undefined && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Опубликована
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {news.isPublished ? 'Да' : 'Нет'}
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
                    alt={news.title || 'Новость'}
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
          {news.content && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Содержание
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                {news.content}
              </Typography>
            </Grid>
          )}
          {news.tags && Array.isArray(news.tags) && news.tags.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Теги
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {news.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1" gutterBottom>
              {news.id || '-'}
            </Typography>
          </Grid>
          {news.createdAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Дата создания
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(news.createdAt).toLocaleString('ru-RU', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
          )}
          {news.publishedAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Дата публикации
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(news.publishedAt).toLocaleString('ru-RU', {
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

export const NewsList = () => {
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (id: string, resource: string, record: News) => {
    setSelectedNews(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNews(null);
  };

  return (
    <>
      <List actions={<ListActions />}>
        <Datagrid rowClick={handleRowClick}>
          <TextField source="title" label="Заголовок" />
          <TextField source="content" label="Содержание" />
          <BooleanField source="isImportant" label="Важная" />
          <BooleanField source="isPublished" label="Опубликована" />
          <FunctionField
            source="tags"
            label="Теги"
            render={(record: any) => {
              const tags = record?.tags;
              if (!tags || !Array.isArray(tags)) return '';
              return tags.join(', ');
            }}
          />
          <FunctionField
            source="createdAt"
            label="Создана"
            render={(record: any) => {
              const date = record?.createdAt;
              if (!date) return '';
              const dateObj = new Date(date);
              return dateObj.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });
            }}
          />
          <FunctionField
            source="publishedAt"
            label="Опубликована"
            render={(record: any) => {
              const date = record?.publishedAt;
              if (!date) return '';
              const dateObj = new Date(date);
              return dateObj.toLocaleString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });
            }}
          />
        </Datagrid>
      </List>
      <NewsDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        news={selectedNews}
      />
    </>
  );
};

