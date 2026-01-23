import { Create, SimpleForm, TextInput, SelectInput, required, useNotify, useRedirect } from 'react-admin';
import { Alert } from '@mui/material';
import { API_URL, API_KEY } from '../config';

const validateUserId = (value: string) => {
  if (!value || value.trim() === '') {
    return 'Обязательное поле';
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value.trim())) {
    return 'Неверный формат UUID';
  }
  return undefined;
};

const validateContent = (value: string) => {
  if (value && value.length > 5000) {
    return 'Максимальная длина сообщения 5000 символов';
  }
  return undefined;
};

export const SupportCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  const handleSave = async (data: any) => {
    try {
      const requestData: any = {
        userId: data.userId.trim(),
        subject: data.subject,
        priority: data.priority || 'medium',
      };
      
      if (data.content) {
        requestData.content = data.content;
      }
      
      if (data.attachments) {
        if (typeof data.attachments === 'string') {
          const urls = data.attachments.split(',').map((url: string) => url.trim()).filter((url: string) => url);
          if (urls.length > 0) {
            requestData.attachments = urls;
          }
        } else if (Array.isArray(data.attachments)) {
          requestData.attachments = data.attachments;
        }
      }

      const auth = localStorage.getItem('auth');
      const token = auth ? JSON.parse(auth).access_token : '';
      
      const response = await fetch(`${API_URL}/admin/support/tickets`, {
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
        throw new Error(result.message || result.error || 'Ошибка создания тикета');
      }

      if (result.success) {
        if (result.isNew) {
          notify('Новый тикет успешно создан', { type: 'success' });
        } else {
          notify('Найден существующий открытый тикет. Сообщение добавлено.', { type: 'info' });
        }
        redirect(`/support/tickets/${result.ticket.id}`);
      } else {
        throw new Error(result.message || 'Ошибка создания тикета');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка создания тикета';
      notify(errorMessage, { type: 'error' });
      throw error;
    }
  };

  return (
    <Create redirect={false}>
      <SimpleForm onSubmit={handleSave}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Если у пользователя уже есть открытый тикет, будет возвращен существующий тикет. 
          Если указано сообщение, оно будет добавлено в существующий тикет.
        </Alert>
        <TextInput 
          source="userId" 
          label="ID пользователя (UUID)" 
          validate={[required(), validateUserId]} 
          fullWidth 
          helperText="Введите UUID пользователя"
        />
        <TextInput 
          source="subject" 
          label="Тема тикета" 
          validate={required()} 
          fullWidth 
        />
        <SelectInput 
          source="priority" 
          label="Приоритет" 
          choices={[
            { id: 'low', name: 'Низкий' },
            { id: 'medium', name: 'Средний' },
            { id: 'high', name: 'Высокий' },
          ]}
          defaultValue="medium"
          fullWidth
        />
        <TextInput 
          source="content" 
          label="Сообщение (необязательно)" 
          multiline 
          rows={6} 
          fullWidth 
          validate={validateContent}
          helperText="Максимум 5000 символов. Если указано, сообщение будет добавлено в тикет."
        />
        <TextInput 
          source="attachments" 
          label="Вложения (необязательно)" 
          fullWidth 
          helperText="URL-адреса файлов через запятую"
        />
      </SimpleForm>
    </Create>
  );
};
