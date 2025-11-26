import { Create, SimpleForm, TextInput, NumberInput, required } from 'react-admin';

export const CarCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="brand" label="Марка" validate={required()} fullWidth />
      <TextInput source="model" label="Модель" validate={required()} fullWidth />
      <NumberInput source="year" label="Год" validate={required()} />
      <NumberInput source="price" label="Цена" validate={required()} />
    </SimpleForm>
  </Create>
);

