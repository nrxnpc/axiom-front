import { Edit, SimpleForm, TextInput, NumberInput, required, BooleanInput, SaveButton, Toolbar, Button, useRedirect, useRecordContext } from 'react-admin';
import { ImageUploadInput } from '../components/ImageUploadInput';
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const CustomToolbar = (props: any) => {
  const redirect = useRedirect();
  return (
    <Toolbar {...props}>
      <SaveButton />
      <Button label="Отмена" onClick={() => redirect('/products')} />
    </Toolbar>
  );
};

const validateNumberRequired = (value: any) => {
  if (value === undefined || value === null || value === '') {
    return 'Обязательное поле';
  }
  return undefined;
};

const normalizeProductData = (data: any) => {
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name || '',
    category: data.category || '',
    pointsCost: data.pointsCost ?? data.points_cost ?? 0,
    stockQuantity: data.stockQuantity ?? data.stock_quantity ?? 0,
    imageURL: data.imageURL ?? data.image_url ?? '',
    description: data.description || '',
    isActive: data.isActive ?? data.is_active ?? false,
  };
};

const ProductEditForm = () => {
  const location = useLocation();
  const state = location.state as any;
  const recordFromState = state?.record;
  const recordFromContext = useRecordContext();
  
  const normalizedDefaultValues = useMemo(() => {
    const sourceData = recordFromState || recordFromContext;
    return normalizeProductData(sourceData);
  }, [recordFromState, recordFromContext]);

  return (
    <SimpleForm 
      toolbar={<CustomToolbar />}
      defaultValues={normalizedDefaultValues || undefined}
    >
      <TextInput source="id" label="ID" disabled />
      <TextInput source="name" label="Название" validate={required()} fullWidth />
      <TextInput source="category" label="Категория" validate={required()} fullWidth />
      <NumberInput source="pointsCost" label="Стоимость в баллах" validate={validateNumberRequired} />
      <NumberInput source="stockQuantity" label="Количество" validate={validateNumberRequired} />
      <ImageUploadInput source="imageURL" label="Изображение товара" />
      <TextInput source="description" label="Описание" multiline rows={4} fullWidth />
      <BooleanInput source="isActive" label="Активен" />
    </SimpleForm>
  );
};

export const ProductEdit = () => {
  const location = useLocation();
  const state = location.state as any;
  const recordFromState = state?.record;

  return (
    <Edit
      mutationMode="pessimistic"
      queryOptions={{ enabled: false }}
      transform={(data: any, { record }: any) => {
        const baseRecord = recordFromState || record || {};
        
        const normalizedBase = normalizeProductData(baseRecord) || {};
        
        const result = {
          ...normalizedBase,
          ...data,
        };
        
        
        return {
          id: result.id,
          name: result.name || '',
          category: result.category || '',
          points_cost: result.pointsCost ?? 0,
          stock_quantity: result.stockQuantity ?? 0,
          image_url: result.imageURL || '',
          description: result.description || '',
          is_active: result.isActive ?? false,
        };
      }}
    >
      <ProductEditForm />
    </Edit>
  );
};

