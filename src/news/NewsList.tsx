import { List, Datagrid, TextField, BooleanField, DateField, ImageField, FunctionField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const NewsList = () => (
  <List actions={<ListActions />}>
    <Datagrid rowClick="edit">
      <FunctionField
        source="id"
        label="ID"
        render={(record: any) => {
          const id = record?.id || '';
          if (id.length <= 12) {
            return id;
          }
          return `${id.substring(0, 6)}...${id.substring(id.length - 6)}`;
        }}
      />
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
      <DateField source="createdAt" label="Создана" showTime />
      <DateField source="publishedAt" label="Опубликована" showTime />
    </Datagrid>
  </List>
);

