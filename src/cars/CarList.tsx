import { List, Datagrid, TextField, NumberField, DateField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const CarList = () => (
  <List actions={<ListActions />}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="brand" label="Марка" />
      <TextField source="model" label="Модель" />
      <NumberField source="year" label="Год" />
      <NumberField source="price" label="Цена" />
      <DateField source="created_at" label="Создан" showTime />
    </Datagrid>
  </List>
);

