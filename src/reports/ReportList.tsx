import { List, Datagrid, TextField, DateField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const ReportList = () => (
  <List actions={<ListActions />}>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="contentType" label="Тип контента" />
      <TextField source="contentId" label="ID контента" />
      <TextField source="reason" label="Причина" />
      <TextField source="description" label="Описание" />
      <DateField source="created_at" label="Создан" showTime />
    </Datagrid>
  </List>
);

