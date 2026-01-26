import { useState } from 'react';
import { useNotify } from 'react-admin';
import { Box, IconButton, CircularProgress, Alert, Paper, Typography } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_URL, API_KEY } from '../config';

interface FileUploadButtonProps {
  onFileUploaded: (url: string) => void;
  disabled?: boolean;
}

export const FileUploadButton = ({ onFileUploaded, disabled = false }: FileUploadButtonProps) => {
  const notify = useNotify();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      const fileUrl = result.file_url || result.image_url || result.url || result.imageURL;
      
      if (result.success && fileUrl) {
        onFileUploaded(fileUrl);
        notify('Файл успешно загружен', { type: 'success' });
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

  return (
    <Box>
      <input
        accept="*/*"
        style={{ display: 'none' }}
        id="file-upload-button"
        type="file"
        onChange={handleFileSelect}
        disabled={uploading || disabled}
      />
      <label htmlFor="file-upload-button">
        <IconButton
          component="span"
          color="primary"
          disabled={uploading || disabled}
          sx={{ 
            bgcolor: uploading ? 'action.disabledBackground' : 'transparent',
            '&:hover': {
              bgcolor: uploading ? 'action.disabledBackground' : 'action.hover',
            }
          }}
        >
          {uploading ? (
            <CircularProgress size={20} />
          ) : (
            <AttachFileIcon />
          )}
        </IconButton>
      </label>
      {error && (
        <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

interface FilePreviewProps {
  url: string;
  onRemove: () => void;
}

export const FilePreview = ({ url, onRemove }: FilePreviewProps) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  const fileName = url.split('/').pop() || 'Файл';
  const truncatedFileName = fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'grey.50',
      }}
    >
      {isImage ? (
        <Box
          component="img"
          src={url}
          alt="Preview"
          sx={{
            width: 40,
            height: 40,
            objectFit: 'cover',
            borderRadius: 1,
            border: '1px solid #e0e0e0',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <AttachFileIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'text.secondary',
          }}
          title={fileName}
        >
          {truncatedFileName}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: '0.65rem',
            color: 'text.disabled',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={url}
        >
          {url.length > 40 ? url.substring(0, 40) + '...' : url}
        </Typography>
      </Box>
      <IconButton
        size="small"
        color="error"
        onClick={onRemove}
        sx={{ ml: 'auto' }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};
