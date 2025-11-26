import { Create, SimpleForm, TextInput, required } from 'react-admin';

export const ReportCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="contentType" label="Тип контента" validate={required()} fullWidth />
      <TextInput source="contentId" label="ID контента" validate={required()} fullWidth />
      <TextInput source="reason" label="Причина" validate={required()} fullWidth />
      <TextInput source="description" label="Описание" multiline rows={4} fullWidth />
    </SimpleForm>
  </Create>
);

