import { Create, SimpleForm, TextInput, BooleanInput, required } from 'react-admin';

export const NewsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" label="Заголовок" validate={required()} fullWidth />
      <TextInput source="content" label="Содержание" multiline rows={6} validate={required()} fullWidth />
      <TextInput source="imageURL" label="URL изображения" fullWidth />
      <BooleanInput source="isImportant" label="Важная новость" />
      <TextInput source="tags" label="Теги (через запятую)" fullWidth />
    </SimpleForm>
  </Create>
);

