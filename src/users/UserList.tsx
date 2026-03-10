import { useEffect, useState } from 'react';
import { useRedirect, List, Datagrid, TextField, DateField, Filter, SelectInput, BooleanInput, TextInput, useNotify, useRefresh, Button, BulkActionProps, FunctionField, useListContext } from 'react-admin';
import { Box, MenuItem, Select, FormControl, InputLabel, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button as MuiButton } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { ListActions } from '../components/ListActions';
import { useRoleCheck } from '../hooks/useRoleCheck';
import { isAdminOrSuperuser } from '../utils/roleUtils';
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

const EmailCopyCell = ({ email }: { email: string }) => {
  const notify = useNotify();

  const handleClick = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      notify('Email скопирован в буфер обмена', { type: 'success' });
    } catch (error) {
      notify('Ошибка копирования email', { type: 'error' });
    }
  };

  return (
    <Tooltip title="Нажмите, чтобы скопировать" arrow>
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
        {email}
      </Box>
    </Tooltip>
  );
};

const getAuthToken = (): string => {
  const auth = localStorage.getItem('auth');
  if (auth) {
    try {
      const authData = JSON.parse(auth);
      return authData.access_token || API_KEY;
    } catch {
      return API_KEY;
    }
  }
  return API_KEY;
};

const BanBulkButton = () => {
  const { selectedIds, data, onUnselectItems } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const { user: currentUser } = useRoleCheck();
  const [banLoading, setBanLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!selectedIds?.length || selectedIds.length !== 1) return null;

  const userId = selectedIds[0];
  const record = data?.find((r: { id: string }) => r.id === userId) as { id: string; name?: string; email?: string; role?: string } | undefined;
  const isSelf = currentUser?.id === userId;
  const recordIsAdminOrSuperuser = isAdminOrSuperuser(record?.role);
  const canAct = !isSelf && !recordIsAdminOrSuperuser;
  const displayName = record?.name || record?.email || userId;

  const handleBanConfirm = async () => {
    if (!canAct) return;
    setBanLoading(true);
    setConfirmOpen(false);
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Ошибка блокировки');
      }
      notify('Пользователь заблокирован', { type: 'success' });
      onUnselectItems();
      refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Ошибка блокировки', { type: 'error' });
    } finally {
      setBanLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mr: 2 }}>
        {canAct ? (
          <Button
            label="Заблокировать"
            onClick={() => setConfirmOpen(true)}
            disabled={banLoading}
            startIcon={<BlockIcon />}
            size="small"
            color="error"
            variant="outlined"
          />
        ) : (
          <Tooltip title={isSelf ? 'Нельзя заблокировать себя' : 'Нельзя заблокировать администратора'}>
            <Box component="span">
              <Button label="Заблокировать" startIcon={<BlockIcon />} size="small" color="error" variant="outlined" disabled />
            </Box>
          </Tooltip>
        )}
      </Box>
      <Dialog open={confirmOpen} onClose={() => !banLoading && setConfirmOpen(false)}>
        <DialogTitle>Подтверждение блокировки</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Заблокировать пользователя {displayName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setConfirmOpen(false)} disabled={banLoading}>
            Отмена
          </MuiButton>
          <MuiButton onClick={handleBanConfirm} color="error" variant="contained" disabled={banLoading} autoFocus>
            Заблокировать
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
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
  const { isSuperuser: canChangeRole } = useRoleCheck();

  if (!canChangeRole) {
    return null;
  }

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
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${getAuthToken()}`,
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
    bulkActionButtons={
      <>
        <BanBulkButton />
        <MakeAdminBulkAction />
      </>
    }
  >
    <Datagrid rowClick={false}>
      <FunctionField
        source="id"
        label="ID"
        render={(record: any) => <TruncatedIdCell id={record?.id || ''} />}
      />
      <TextField source="name" label="Имя" />
      <FunctionField
        source="email"
        label="Email"
        render={(record: any) => <EmailCopyCell email={record?.email || ''} />}
      />
      <TextField source="role" label="Роль" />
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
  const { canAccessUsers: canAccess } = useRoleCheck();

  useEffect(() => {
    if (!canAccess) {
      redirect('/');
    }
  }, [canAccess, redirect]);

  if (!canAccess) {
    return null;
  }

  return <UserListContent />;
};

