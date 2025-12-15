import { Edit, SimpleForm, TextInput, BooleanInput, required, FunctionField } from 'react-admin';

export const NewsEdit = () => (
  <Edit
    transform={(data: any) => {
      if (data.tags) {
        if (typeof data.tags === 'string') {
          data.tags = data.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0);
        } else if (Array.isArray(data.tags)) {
          data.tags = data.tags.join(', ');
        }
      }
      return data;
    }}
  >
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="title" label="Заголовок" validate={required()} fullWidth />
      <TextInput source="content" label="Содержание" multiline rows={6} validate={required()} fullWidth />
      <TextInput source="imageURL" label="URL изображения" fullWidth />
      <BooleanInput source="isImportant" label="Важная новость" />
      <TextInput source="tags" label="Теги (через запятую)" fullWidth />
    </SimpleForm>
  </Edit>
);

