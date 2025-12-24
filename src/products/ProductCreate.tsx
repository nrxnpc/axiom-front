import { Create, SimpleForm, TextInput, NumberInput, required } from 'react-admin';
import { ImageUploadInput } from '../components/ImageUploadInput';

export const ProductCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="name" label="Название" validate={required()} fullWidth />
      <TextInput source="category" label="Категория" validate={required()} fullWidth />
      <NumberInput source="pointsCost" label="Стоимость в баллах" validate={required()} />
      <NumberInput source="stockQuantity" label="Количество" validate={required()} />
      <ImageUploadInput source="imageURL" label="Изображение товара" />
      <TextInput source="description" label="Описание" multiline rows={4} fullWidth />
    </SimpleForm>
  </Create>
);

