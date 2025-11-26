import { Edit, SimpleForm, TextInput, NumberInput, DateInput, required } from 'react-admin';

export const CampaignEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="title" label="Название" validate={required()} fullWidth />
      <TextInput source="description" label="Описание" multiline rows={4} validate={required()} fullWidth />
      <TextInput source="prize" label="Приз" validate={required()} fullWidth />
      <DateInput source="startDate" label="Дата начала" validate={required()} />
      <DateInput source="endDate" label="Дата окончания" validate={required()} />
      <NumberInput source="minPointsRequired" label="Минимум баллов" />
      <TextInput source="imageURL" label="URL изображения" fullWidth />
    </SimpleForm>
  </Edit>
);

