import {
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  SaveButton,
  Toolbar,
  Button,
  useRedirect,
} from 'react-admin';
import { Box } from '@mui/material';

const UserEditToolbar = (props: Record<string, unknown>) => {
  const redirect = useRedirect();
  return (
    <Toolbar {...props}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 2 }}>
        <SaveButton />
        <Button label="Отмена" onClick={() => redirect('list', 'admin/users')} />
      </Box>
    </Toolbar>
  );
};

export const UserEdit = () => (
  <Edit
    mutationMode="pessimistic"
    transform={(data: Record<string, unknown>, { record }: { record?: Record<string, unknown> }) => ({
      ...(record || {}),
      ...data,
    })}
  >
    <SimpleForm toolbar={<UserEditToolbar />}>
      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
        <TextInput source="id" label="ID" disabled sx={{ flex: 1, minWidth: 0 }} />
        <TextInput source="email" label="Email" disabled sx={{ flex: 1, minWidth: 0 }} />
      </Box>
      <TextInput source="name" label="Имя" fullWidth />
      <TextInput source="phone" label="Телефон" fullWidth />
      <TextInput source="about" label="О себе" multiline rows={4} fullWidth />
      <TextInput source="address" label="Адрес" multiline rows={2} fullWidth />
      <TextInput source="car" label="Автомобиль" fullWidth />
      <DateInput source="date_of_birth" label="Дата рождения" />
    </SimpleForm>
  </Edit>
);
