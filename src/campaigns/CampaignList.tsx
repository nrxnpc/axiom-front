import { List, Datagrid, TextField, NumberField, DateField, ImageField } from 'react-admin';
import { ListActions } from '../components/ListActions';

export const CampaignList = () => (
  <List actions={<ListActions />}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="title" label="Название" />
      <TextField source="description" label="Описание" />
      <TextField source="prize" label="Приз" />
      <NumberField source="minPointsRequired" label="Минимум баллов" />
      <DateField source="startDate" label="Дата начала" />
      <DateField source="endDate" label="Дата окончания" />
      <ImageField source="imageURL" label="Изображение" />
      <DateField source="created_at" label="Создана" showTime />
    </Datagrid>
  </List>
);

