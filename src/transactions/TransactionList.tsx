import { List, Datagrid, TextField, NumberField, DateField } from 'react-admin';

export const TransactionList = () => (
  <List>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="type" label="Тип" />
      <NumberField source="amount" label="Сумма" />
      <NumberField source="points" label="Баллы" />
      <TextField source="description" label="Описание" />
      <DateField source="created_at" label="Дата" showTime />
    </Datagrid>
  </List>
);

