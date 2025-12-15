import { Create, SimpleForm, TextInput, BooleanInput, required } from 'react-admin';

export const NewsCreate = () => (
  <Create
    transform={(data: any) => {
      if (data.tags && typeof data.tags === 'string') {
        data.tags = data.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
      }
      return data;
    }}
  >
    <SimpleForm>
      <TextInput source="title" label="Заголовок" validate={required()} fullWidth />
      <TextInput source="content" label="Содержание" multiline rows={6} validate={required()} fullWidth />
      <TextInput source="imageURL" label="URL изображения" fullWidth />
      <BooleanInput source="isImportant" label="Важная новость" />
      <TextInput source="tags" label="Теги (через запятую)" fullWidth />
    </SimpleForm>
  </Create>
);

