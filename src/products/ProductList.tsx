import { List, Datagrid, TextField, NumberField, DateField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const ProductList = () => (
  <List actions={<ListActions />}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="name" label="Название" />
      <TextField source="category" label="Категория" />
      <NumberField source="pointsCost" label="Стоимость в баллах" />
      <TextField source="description" label="Описание" />
      <DateField source="created_at" label="Создан" showTime />
    </Datagrid>
  </List>
);

