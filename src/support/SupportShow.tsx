import { useState, useEffect, useRef } from 'react';
import { useNotify } from 'react-admin';
import { useLocation, useParams } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField as MuiTextField, 
  Alert, 
  CircularProgress, 
  Button as MuiButton, 
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { API_URL, API_KEY } from '../config';
import { SupportMessageWithSender, GetMessagesParams } from '../types';

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

const MessageBubble = ({ message }: { message: SupportMessageWithSender }) => {
  const isOperator = message.senderRole === 'admin' || message.senderRole === 'operator';
  
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
              {message.attachments.map((url, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'block',
                    color: isOperator ? 'white' : 'primary.main',
                    textDecoration: 'underline',
                    mb: 0.5,
                  }}
                >
                  📎 Вложение {index + 1}
                </Typography>
              ))}
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

const MessageList = ({ ticketId, refreshKey }: { ticketId: string; refreshKey: number }) => {
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
        
        console.log('Fetching messages from:', url);
        
        const response = await fetch(url, {
          headers: {
            'X-API-Key': API_KEY,
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Ошибка загрузки сообщений: ${response.status}`);
        }

        const data = await response.json();
        console.log('Messages loaded:', data);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
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

const SendMessageForm = ({ ticketId, onMessageSent }: { ticketId: string; onMessageSent: () => void }) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState('');
  const [sending, setSending] = useState(false);
  const notify = useNotify();

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

      if (attachments) {
        const urls = attachments.split(',').map((url: string) => url.trim()).filter((url: string) => url);
        if (urls.length > 0) {
          requestData.attachments = urls;
        }
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
        setAttachments('');
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
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <MuiTextField
            size="small"
            fullWidth
            placeholder="Вложения (URL через запятую)"
            value={attachments}
            onChange={(e) => setAttachments(e.target.value)}
            disabled={sending}
            sx={{ flex: 1 }}
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
    </Paper>
  );
};

export const SupportShow = () => {
  const location = useLocation();
  const params = useParams();
  const state = location.state as any;
  const record = state?.record;
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('SupportShow mounted');
    console.log('SupportShow - params:', params);
    console.log('SupportShow - location.state:', location.state);
    console.log('SupportShow - record:', record);
    if (record) {
      console.log('SupportShow - ticketId:', record.id);
    }
  }, [params, location.state, record]);

  if (!record || !record.id) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">
          {!record ? 'Загрузка данных тикета...' : 'ID тикета не найден'}
        </Typography>
        {record && (
          <Typography variant="caption" color="error">
            Record data: {JSON.stringify(record, null, 2)}
          </Typography>
        )}
      </Box>
    );
  }

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
