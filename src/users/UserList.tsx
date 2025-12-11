import { useEffect, useState } from 'react';
import { useRedirect, List, Datagrid, TextField, EmailField, DateField, Filter, SelectInput, BooleanInput, TextInput, useNotify, useRefresh, Button, BulkActionProps, FunctionField } from 'react-admin';
import { Box, MenuItem, Select, FormControl, InputLabel, Tooltip } from '@mui/material';
import { ListActions } from '../components/ListActions';
import { userStore } from '../userStore';
import { API_URL, API_KEY } from '../config';

const TruncatedIdCell = ({ id }: { id: string }) => {
  const notify = useNotify();
  
  const truncateId = (id: string) => {
    if (id.length <= 12) {
      return id;
    }
    return `${id.substring(0, 6)}...${id.substring(id.length - 6)}`;
  };

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(id);
      notify('ID скопирован в буфер обмена', { type: 'success' });
    } catch (error) {
      notify('Ошибка копирования ID', { type: 'error' });
    }
  };

  return (
    <Tooltip title={`Нажмите, чтобы скопировать: ${id}`} arrow>
      <Box
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {truncateId(id)}
      </Box>
    </Tooltip>
  );
};


const UserFilter = (props: any) => (
  <Filter {...props}>
    <TextInput source="name" label="Имя" />
    <TextInput source="email" label="Email" />
    <TextInput source="phone" label="Телефон" />
    <SelectInput 
      source="role" 
      label="Роль" 
      choices={[
        { id: 'user', name: 'Пользователь' },
        { id: 'superuser', name: 'Суперпользователь' },
      ]}
    />
    <SelectInput 
      source="userType" 
      label="Тип пользователя" 
      choices={[
        { id: 'individual', name: 'Физическое лицо' },
        { id: 'company', name: 'Компания' },
      ]}
    />
    <BooleanInput source="isActive" label="Активен" />
  </Filter>
);

const MakeAdminBulkAction = (props: BulkActionProps) => {
  const { selectedIds } = props;
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('admin');

  const roleChoices = [
    { id: 'user', name: 'Пользователь' },
    { id: 'admin', name: 'Администратор' },
    { id: 'operator', name: 'Оператор' },
    { id: 'company', name: 'Компания' },
    { id: 'superuser', name: 'Суперпользователь' },
  ];

  const handleChangeRole = async () => {
    if (selectedIds?.length !== 1 || !selectedRole) {
      return;
    }

    const userId = selectedIds[0];
    setLoading(true);

    try {
      const auth = localStorage.getItem('auth');
      let token = API_KEY;
      
      if (auth) {
        try {
          const authData = JSON.parse(auth);
          token = authData.access_token || API_KEY;
        } catch {
        }
      }

      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Ошибка изменения роли');
      }

      notify('Роль пользователя успешно изменена', { type: 'success' });
      refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка изменения роли';
      notify(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds?.length !== 1) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Роль</InputLabel>
        <Select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          label="Роль"
        >
          {roleChoices.map((choice) => (
            <MenuItem key={choice.id} value={choice.id}>
              {choice.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        label="Изменить роль"
        onClick={handleChangeRole}
        disabled={loading || !selectedRole}
        variant="contained"
        color="primary"
      />
    </Box>
  );
};

const UserListContent = () => (
  <List 
    actions={<ListActions />} 
    filters={<UserFilter />} 
    bulkActionButtons={<MakeAdminBulkAction />}
  >
      <Datagrid rowClick={false}>
      <FunctionField
        source="id"
        label="ID"
        render={(record: any) => <TruncatedIdCell id={record?.id || ''} />}
      />
      <TextField source="name" label="Имя" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Телефон" />
      <TextField source="role" label="Роль" />
      <TextField source="userType" label="Тип пользователя" />
      <TextField source="points" label="Баллы" />
      <DateField source="registrationDate" label="Дата регистрации" />
      <FunctionField
        source="lastLogin"
        label="Последний вход"
        render={(record: any) => {
          const date = record?.lastLogin;
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
);

export const UserList = () => {
  const redirect = useRedirect();
  const user = userStore.getUser();

  useEffect(() => {
    if (!user || user.role !== 'superuser') {
      redirect('/');
    }
  }, [user, redirect]);

  if (!user || user.role !== 'superuser') {
    return null;
  }

  return <UserListContent />;
};

