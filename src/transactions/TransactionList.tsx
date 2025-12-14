import { List, Datagrid, TextField, NumberField, FunctionField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const TransactionList = () => (
  <List actions={<ListActions />}>
    <Datagrid>
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
      <TextField source="type" label="Тип" />
      <NumberField source="amount" label="Сумма" />
      <TextField source="description" label="Описание" />
      <FunctionField
        source="timestamp"
        label="Дата и время"
        render={(record: any) => {
          const date = record?.timestamp;
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

