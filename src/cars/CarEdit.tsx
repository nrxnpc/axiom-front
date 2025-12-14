import { Edit, SimpleForm, TextInput, NumberInput, required } from 'react-admin';

export const CarEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" label="ID" disabled />
      <TextInput source="brand" label="Марка" validate={required()} fullWidth />
      <TextInput source="model" label="Модель" validate={required()} fullWidth />
      <NumberInput source="year" label="Год" validate={required()} />
      <NumberInput source="price" label="Цена" validate={required()} />
      <TextInput source="description" label="Описание" fullWidth multiline rows={3} />
      <TextInput source="engine" label="Двигатель" fullWidth />
      <TextInput source="transmission" label="Коробка передач" fullWidth />
      <TextInput source="fuelType" label="Тип топлива" fullWidth />
      <TextInput source="bodyType" label="Тип кузова" fullWidth />
      <TextInput source="drivetrain" label="Привод" fullWidth />
      <TextInput source="color" label="Цвет" fullWidth />
    </SimpleForm>
  </Edit>
);

