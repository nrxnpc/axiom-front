import { Edit, SimpleForm, TextInput, NumberInput, required } from 'react-admin';

export const ProductEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="name" label="Название" validate={required()} fullWidth />
      <TextInput source="category" label="Категория" validate={required()} fullWidth />
      <NumberInput source="pointsCost" label="Стоимость в баллах" validate={required()} />
      <TextInput source="description" label="Описание" multiline rows={4} fullWidth />
    </SimpleForm>
  </Edit>
);

