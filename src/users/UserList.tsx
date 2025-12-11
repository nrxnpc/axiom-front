import { useEffect } from 'react';
import { useRedirect } from 'react-admin';
import { List, Datagrid, TextField, EmailField, DateField } from 'react-admin';
import { ListActions } from '../components/ListActions';
import { userStore } from '../userStore';

const UserListContent = () => (
  <List actions={<ListActions />}>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Имя" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Телефон" />
      <TextField source="userType" label="Тип пользователя" />
      <DateField source="created_at" label="Создан" showTime />
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

