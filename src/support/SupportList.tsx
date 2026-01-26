import { List, Datagrid, TextField, useListContext, FunctionField, Identifier } from 'react-admin';
import { ListActions } from '../components/ListActions';
import { Box, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StatusChip = ({ record }: { record: any }) => {
  const status = record?.status;
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

const PriorityChip = ({ record }: { record: any }) => {
  const priority = record?.priority;
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

const SupportFilters = () => {
  const { filterValues, setFilters } = useListContext();

  const handleStatusChange = (event: any) => {
    setFilters({ ...filterValues, status: event.target.value || undefined }, {});
  };

  const handlePriorityChange = (event: any) => {
    setFilters({ ...filterValues, priority: event.target.value || undefined }, {});
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Статус</InputLabel>
        <Select
          value={filterValues?.status || 'all'}
          label="Статус"
          onChange={handleStatusChange}
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="open">Открыт</MenuItem>
          <MenuItem value="pending">В ожидании</MenuItem>
          <MenuItem value="closed">Закрыт</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Приоритет</InputLabel>
        <Select
          value={filterValues?.priority || 'all'}
          label="Приоритет"
          onChange={handlePriorityChange}
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="high">Высокий</MenuItem>
          <MenuItem value="medium">Средний</MenuItem>
          <MenuItem value="low">Низкий</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export const SupportList = () => {
  const navigate = useNavigate();

  const handleRowClick = (id: Identifier, _resource: string, record: any): string => {
    navigate(`/support/tickets/${id}`, { state: { record } });
    return `/support/tickets/${id}`;
  };

  return (
    <List actions={<ListActions />} filters={<SupportFilters />}>
      <Datagrid rowClick={handleRowClick}>
        <TextField source="subject" label="Тема" />
        <TextField source="userName" label="Пользователь" />
        <TextField source="userEmail" label="Email" />
        <FunctionField label="Статус" render={(record: any) => <StatusChip record={record} />} />
        <FunctionField label="Приоритет" render={(record: any) => <PriorityChip record={record} />} />
        <TextField source="messageCount" label="Сообщений" />
        <FunctionField
          label="Создан"
          render={(record: any) => {
            if (!record.createdAt) return '-';
            return new Date(record.createdAt).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
          }}
        />
        <FunctionField
          label="Обновлен"
          render={(record: any) => {
            if (!record.updatedAt) return '-';
            return new Date(record.updatedAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          }}
        />
      </Datagrid>
    </List>
  );
};
