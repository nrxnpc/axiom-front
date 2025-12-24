import { List, Datagrid, TextField, BooleanField, DateField, ImageField, FunctionField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const NewsList = () => (
  <List actions={<ListActions />}>
    <Datagrid rowClick="edit">
      <TextField source="title" label="Заголовок" />
      <TextField source="content" label="Содержание" />
      <ImageField source="imageURL" label="Изображение" />
      <BooleanField source="isImportant" label="Важная" />
      <BooleanField source="isPublished" label="Опубликована" />
      <FunctionField
        source="tags"
        label="Теги"
        render={(record: any) => {
          const tags = record?.tags;
          if (!tags || !Array.isArray(tags)) return '';
          return tags.join(', ');
        }}
      />
      <FunctionField
        source="createdAt"
        label="Создана"
        render={(record: any) => {
          const date = record?.createdAt;
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
      <FunctionField
        source="publishedAt"
        label="Опубликована"
        render={(record: any) => {
          const date = record?.publishedAt;
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

