import { List, Datagrid, TextField, EmailField, DateField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const UserList = () => (
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

