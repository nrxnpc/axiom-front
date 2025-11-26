import { List, Datagrid, TextField, BooleanField, DateField, ImageField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const NewsList = () => (
  <List actions={<ListActions />}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Заголовок" />
      <TextField source="content" label="Содержание" />
      <ImageField source="imageURL" label="Изображение" />
      <BooleanField source="isImportant" label="Важная" />
      <TextField source="tags" label="Теги" />
      <DateField source="created_at" label="Создана" showTime />
    </Datagrid>
  </List>
);

