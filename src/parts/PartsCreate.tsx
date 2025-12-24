import { useState, useRef } from 'react';
import { 
  Create, 
  SimpleForm, 
  TextInput, 
  NumberInput, 
  BooleanInput,
  required,
  useNotify,
  useRedirect,
  useRefresh,
  SaveButton,
  Toolbar,
  Button
} from 'react-admin';
import { API_URL, API_KEY } from '../config';

export const PartsCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const generateQRRef = useRef(false);

  const getAuthToken = (): string => {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      return API_KEY;
    }
    try {
      const authData = JSON.parse(auth);
      return authData.access_token || API_KEY;
    } catch {
      return API_KEY;
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const fullUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      
      const a = document.createElement('a');
      a.href = fullUrl;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Ошибка открытия ${filename}:`, error);
      throw error;
    }
  };

  const handleGenerateQR = async (partId: string) => {
    try {
      const token = getAuthToken();
      
      const requestBody = {
        spare_parts: [
          {
            spare_part_id: partId,
          },
        ],
      };

      const response = await fetch(`${API_URL}/qr-codes/generate-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Ошибка генерации QR-кода');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Ошибка генерации QR-кода');
      }

      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map((err: any) => err.error).join('; ');
        throw new Error(`Ошибки генерации: ${errorMessages}`);
      }

      if (data.failed > 0) {
        notify(`Ошибка генерации QR-кода (failed: ${data.failed})`, { type: 'error' });
        return;
      }

      if (data.qr_codes && data.qr_codes.length > 0) {
        const qrCode = data.qr_codes[0];
        const filename = `qr-${qrCode.spare_part_sku || partId}-${qrCode.qr_id}.png`;
        await downloadImage(qrCode.image_url, filename);
        notify('QR-код успешно сгенерирован и скачан', { type: 'success' });
      } else {
        throw new Error('QR-код не был сгенерирован');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка генерации QR-кода';
      notify(errorMessage, { type: 'error' });
    }
  };

  const CustomToolbar = (props: any) => {
    return (
      <Toolbar {...props}>
        <SaveButton />
        <Button label="Отмена" onClick={() => redirect('/parts')} />
      </Toolbar>
    );
  };

  return (
    <Create 
      redirect={false}
      mutationOptions={{
        onSuccess: async (data: any) => {
          if (generateQRRef.current && data?.id) {
            await handleGenerateQR(data.id);
          }
          refresh();
          setTimeout(() => {
            redirect('/parts');
          }, 100);
        },
      }}
      transform={(data: any) => {
        generateQRRef.current = data?.generateQRCode || false;
        const { generateQRCode, ...rest } = data;
        return rest;
      }}
    >
      <SimpleForm toolbar={<CustomToolbar />}>
        <TextInput 
          source="productName" 
          label="SKU" 
          validate={required()} 
          fullWidth 
        />
        <TextInput 
          source="productCategory" 
          label="Категория продукта" 
          validate={required()} 
          fullWidth 
        />
        <NumberInput 
          source="pointsEarned" 
          label="Баллы" 
          validate={required()} 
        />
        <BooleanInput 
          source="generateQRCode" 
          label="Сразу сгенерировать QR-код"
          defaultValue={false}
        />
      </SimpleForm>
    </Create>
  );
};

