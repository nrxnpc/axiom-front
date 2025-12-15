import { List, Datagrid, TextField, NumberField, DateField, BooleanField, ImageField, FunctionField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const ProductList = () => (
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
      <TextField source="name" label="Название" />
      <TextField source="category" label="Категория" />
      <NumberField source="pointsCost" label="Стоимость в баллах" />
      <NumberField source="stockQuantity" label="Остаток" />
      <BooleanField source="isActive" label="Активен" />
      <ImageField source="imageURL" label="Изображение" />
      <TextField source="description" label="Описание" />
      <DateField source="createdAt" label="Создан" showTime />
    </Datagrid>
  </List>
);

