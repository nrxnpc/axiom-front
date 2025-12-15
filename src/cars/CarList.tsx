import { List, Datagrid, TextField, NumberField, DateField, FunctionField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const CarList = () => (
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
      <TextField source="brand" label="Марка" />
      <TextField source="model" label="Модель" />
      <NumberField source="year" label="Год" />
      <TextField source="price" label="Цена" />
      <DateField source="createdAt" label="Создан" showTime />
    </Datagrid>
  </List>
);

