import { useState, useEffect } from 'react';
import { useInput, useNotify } from 'react-admin';
import { Box, Button, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_URL, API_KEY } from '../config';

interface ImageUploadInputProps {
  source: string;
  label?: string;
}

export const ImageUploadInput = ({ source, label = 'Фотография' }: ImageUploadInputProps) => {
  const { field } = useInput({ source });
  const notify = useNotify();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (field.value) {
      const previewUrl = field.value.startsWith('http') 
        ? field.value 
        : field.value.startsWith('/')
        ? `${API_URL.replace('/api/v1', '')}${field.value}`
        : field.value;
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
  }, [field.value]);

  const getAuthToken = (): string => {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      return API_KEY;
    }
    try {
      const authData = JSON.parse(auth);
      return authData.access_token || API_KEY;
    } catch {
      return API_KEY;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size === 0) {
      setError('Выбранный файл пуст');
      notify('Выбранный файл пуст', { type: 'error' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите файл изображения');
      notify('Пожалуйста, выберите файл изображения', { type: 'error' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Размер файла не должен превышать 10MB');
      notify('Размер файла не должен превышать 10MB', { type: 'error' });
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (!formData.has('file')) {
        throw new Error('Ошибка при подготовке файла к загрузке');
      }
      
      if (file.size === 0) {
        throw new Error('Файл пуст и не может быть загружен');
      }

      const token = getAuthToken();
      
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Ошибка загрузки файла');
      }

      const result = await response.json();
      
      const imageUrl = result.file_url || result.image_url || result.url || result.imageURL;
      
      if (result.success && imageUrl) {
        field.onChange(imageUrl);
        notify('Фотография успешно загружена', { type: 'success' });
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки файла';
      setError(errorMessage);
      notify(errorMessage, { type: 'error' });
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemove = () => {
    field.onChange('');
    setPreview(null);
    setError(null);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {preview ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                maxWidth: 200,
                maxHeight: 200,
                objectFit: 'contain',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
              }}
              onError={() => {
                setPreview(null);
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                URL: {field.value}
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={handleRemove}
                sx={{ mt: 1 }}
              >
                Удалить
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            cursor: uploading ? 'wait' : 'pointer',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderColor: '#999',
            },
          }}
        >
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={`file-upload-${source}`}
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor={`file-upload-${source}`}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                cursor: uploading ? 'wait' : 'pointer',
              }}
            >
              {uploading ? (
                <>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary">
                    Загрузка...
                  </Typography>
                </>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#999' }} />
                  <Typography variant="body2" color="text.secondary">
                    Нажмите для выбора файла или перетащите изображение
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Поддерживаются форматы: JPG, PNG, GIF (макс. 10MB)
                  </Typography>
                </>
              )}
            </Box>
          </label>
        </Box>
      )}

      <input type="hidden" {...field} />
    </Box>
  );
};

