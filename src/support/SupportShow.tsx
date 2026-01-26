import { useState, useEffect, useRef } from 'react';
import { useNotify, useRecordContext } from 'react-admin';
import { useLocation, useParams } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField as MuiTextField, 
  Alert, 
  CircularProgress, 
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { API_URL, API_KEY } from '../config';
import { SupportMessageWithSender, GetMessagesParams } from '../types';
import { FileUploadButton, FilePreview } from '../components/FileUploadButton';

const StatusChip = ({ status }: { status: string }) => {
  const getColor = () => {
    switch (status) {
      case 'open':
        return 'error';
      case 'pending':
        return 'warning';
      case 'closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'open':
        return 'Открыт';
      case 'pending':
        return 'В ожидании';
      case 'closed':
        return 'Закрыт';
      default:
        return status;
    }
  };

  return <Chip label={getLabel()} color={getColor()} size="small" />;
};

const PriorityChip = ({ priority }: { priority: string }) => {
  const getColor = () => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getLabel = () => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
      default:
        return priority;
    }
  };

  return <Chip label={getLabel()} color={getColor()} size="small" />;
};

const AuthorizedImage = ({ 
  url, 
  alt, 
  onClick, 
  sx 
}: { 
  url: string; 
  alt: string; 
  onClick: () => void;
  sx?: any;
}) => {
  const getFullUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/api/v1')) {
      return `${API_URL.replace('/api/v1', '')}${url}`;
    }
    if (url.startsWith('/')) {
      return `${API_URL.replace('/api/v1', '')}${url}`;
    }
    return `${API_URL.replace('/api/v1', '')}/api/v1${url.startsWith('/') ? url : `/${url}`}`;
  };

  const fullUrl = getFullUrl(url);

  return (
    <Box
      component="img"
      src={fullUrl}
      alt={alt}
      onClick={onClick}
      sx={sx}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

const MessageBubble = ({ message }: { message: SupportMessageWithSender }) => {
  const isOperator = message.senderRole === 'admin' || message.senderRole === 'operator';
  
  const getFullUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/api/v1')) {
      return `${API_URL.replace('/api/v1', '')}${url}`;
    }
    if (url.startsWith('/')) {
      return `${API_URL.replace('/api/v1', '')}${url}`;
    }
    return `${API_URL.replace('/api/v1', '')}/api/v1${url.startsWith('/') ? url : `/${url}`}`;
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const fullUrl = getFullUrl(url);
      const response = await fetch(fullUrl);

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      window.open(getFullUrl(url), '_blank');
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOperator ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isOperator ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 1,
          maxWidth: '70%',
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: isOperator ? 'primary.main' : 'grey.500',
          }}
        >
          {message.senderName?.[0]?.toUpperCase() || (isOperator ? 'О' : 'П')}
        </Avatar>
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            bgcolor: isOperator ? 'primary.main' : 'grey.100',
            color: isOperator ? 'white' : 'text.primary',
            borderRadius: 2,
            position: 'relative',
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
            {message.senderName || (isOperator ? 'Оператор' : 'Пользователь')}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content}
          </Typography>
          {message.attachments && message.attachments.length > 0 && (
            <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${isOperator ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` }}>
              {message.attachments.map((url, index) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                const fileName = url.split('/').pop() || `Вложение ${index + 1}`;
                const truncatedFileName = fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName;
                
                return (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    {isImage ? (
                      <Box
                        onClick={() => handleDownload(url, fileName)}
                        sx={{
                          display: 'block',
                          cursor: 'pointer',
                        }}
                      >
                        <AuthorizedImage
                          url={url}
                          alt={fileName}
                          onClick={() => handleDownload(url, fileName)}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            borderRadius: 1,
                            border: `1px solid ${isOperator ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`,
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.9,
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        onClick={() => handleDownload(url, fileName)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: isOperator ? 'white' : 'primary.main',
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        <AttachFileIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                          {truncatedFileName}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              opacity: 0.7,
              fontSize: '0.7rem',
            }}
          >
            {message.timestamp
              ? new Date(message.timestamp).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

const MessageList = ({ ticketId, refreshKey }: { ticketId: string | number; refreshKey: number }) => {
  const [messages, setMessages] = useState<SupportMessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ticketId) {
      setError('ID тикета не указан');
      setLoading(false);
      return;
    }

    const fetchMessages = async (params?: GetMessagesParams) => {
      try {
        setLoading(true);
        setError(null);
        const auth = localStorage.getItem('auth');
        const token = auth ? JSON.parse(auth).access_token : '';
        
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.offset) queryParams.set('offset', params.offset.toString());
        if (params?.since) queryParams.set('since', params.since);
        if (params?.since_id) queryParams.set('since_id', params.since_id);
        
        const queryString = queryParams.toString();
        const url = `${API_URL}/admin/support/tickets/${ticketId}/messages${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
          headers: {
            'X-API-Key': API_KEY,
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка загрузки сообщений: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки сообщений');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages({ limit: 100, offset: 0 });
  }, [ticketId, refreshKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (messages.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography color="text.secondary">Нет сообщений</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        maxHeight: '60vh',
        overflowY: 'auto',
      }}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};

const SendMessageForm = ({ ticketId, onMessageSent }: { ticketId: string | number; onMessageSent: () => void }) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const notify = useNotify();

  const handleFileUploaded = (url: string) => {
    setAttachments((prev) => [...prev, url]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!content.trim()) {
      notify('Введите текст сообщения', { type: 'error' });
      return;
    }

    if (content.length > 5000) {
      notify('Максимальная длина сообщения 5000 символов', { type: 'error' });
      return;
    }

    try {
      setSending(true);
      const auth = localStorage.getItem('auth');
      const token = auth ? JSON.parse(auth).access_token : '';
      
      const requestData: any = {
        content: content.trim(),
      };

      if (attachments.length > 0) {
        requestData.attachments = attachments;
      }

      const response = await fetch(`${API_URL}/admin/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Ошибка отправки сообщения');
      }

      if (result.success) {
        setContent('');
        setAttachments([]);
        onMessageSent();
      } else {
        throw new Error(result.message || 'Ошибка отправки сообщения');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка отправки сообщения';
      notify(errorMessage, { type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {attachments.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {attachments.map((url, index) => (
              <FilePreview
                key={index}
                url={url}
                onRemove={() => handleRemoveAttachment(index)}
              />
            ))}
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <MuiTextField
            fullWidth
            multiline
            rows={3}
            placeholder="Введите сообщение..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            helperText={`${content.length}/5000 символов. Ctrl+Enter для отправки`}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <FileUploadButton
              onFileUploaded={handleFileUploaded}
              disabled={sending}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={sending || !content.trim()}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export const SupportShow = () => {
  const location = useLocation();
  const params = useParams();
  const recordFromContext = useRecordContext();
  const state = location.state as any;
  const recordFromState = state?.record;
  const initialRecord = recordFromContext || recordFromState;
  const [ticketData, setTicketData] = useState<any>(initialRecord);
  const [loading, setLoading] = useState(!initialRecord);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadTicket = async () => {
      if (initialRecord && initialRecord.id) {
        setTicketData(initialRecord);
        setLoading(false);
        return;
      }

      const ticketId = params.id;
      if (!ticketId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const auth = localStorage.getItem('auth');
        const token = auth ? JSON.parse(auth).access_token : '';
        
        const response = await fetch(`${API_URL}/admin/support/tickets/${ticketId}`, {
          headers: {
            'X-API-Key': API_KEY,
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка загрузки тикета: ${response.status}`);
        }

        const data = await response.json();
        setTicketData(data.ticket || data);
      } catch (err) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [params.id, initialRecord]);

  if (loading || !ticketData || !ticketData.id) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">
          {loading ? 'Загрузка данных тикета...' : 'ID тикета не найден'}
        </Typography>
      </Box>
    );
  }

  const record = ticketData;

  const handleMessageSent = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">{record.subject}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <StatusChip status={record.status} />
              <PriorityChip priority={record.priority} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Пользователь: {record.userName || record.userEmail}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {record.userId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Создан: {record.createdAt ? new Date(record.createdAt).toLocaleString('ru-RU') : '-'}
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'grey.50' }}>
          <MessageList ticketId={record.id} refreshKey={refreshKey} />
        </Box>

        <SendMessageForm ticketId={record.id} onMessageSent={handleMessageSent} />
      </Box>
  );
};
