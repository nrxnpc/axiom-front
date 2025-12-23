import { useState } from 'react';
import { 
  List, 
  Datagrid, 
  TextField, 
  NumberField, 
  useNotify,
  useRefresh,
  BulkActionProps,
  Button,
  ListActions
} from 'react-admin';
import { API_URL, API_KEY } from '../config';

const GenerateQRBulkAction = (props: BulkActionProps) => {
  const { selectedIds } = props;
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

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
      const token = getAuthToken();
      const fullUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      
      const response = await fetch(fullUrl, {
        headers: {
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки изображения: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Ошибка скачивания ${filename}:`, error);
      throw error;
    }
  };

  const generateQR = async (ids: string[]) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      
      if (ids.length === 0) {
        throw new Error('Не выбрано ни одной запчасти');
      }
      if (ids.length > 100) {
        throw new Error('Максимум 100 запчастей за один запрос');
      }

      const requestBody = {
        spare_parts: ids.map(id => ({
          spare_part_id: id,
        })),
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
        throw new Error(errorData.message || errorData.error || 'Ошибка генерации QR-кодов');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Ошибка генерации QR-кодов');
      }

      if (data.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map((err: any) => err.error).join('; ');
        if (data.generated === 0) {
          notify(`Ошибки генерации: ${errorMessages}`, { type: 'error' });
          return;
        } else {
          notify(`Сгенерировано: ${data.generated}, ошибок: ${data.failed}. ${errorMessages}`, { 
            type: 'warning' 
          });
        }
      }

      if (data.qr_codes && data.qr_codes.length > 0) {
        for (const qrCode of data.qr_codes) {
          const filename = `qr-${qrCode.spare_part_sku || qrCode.spare_part_id}-${qrCode.qr_id}.png`;
          try {
            await downloadImage(qrCode.image_url, filename);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Не удалось скачать QR-код для ${qrCode.spare_part_id}:`, error);
          }
        }
        
        const message = data.failed > 0 
          ? `Скачано: ${data.generated} QR-кодов, ошибок: ${data.failed}`
          : `Успешно скачано ${data.generated} QR-кодов`;
        notify(message, { type: 'success' });
      } else {
        notify('QR-коды не были сгенерированы', { type: 'warning' });
      }
      
      refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка генерации QR-кода';
      notify(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = () => {
    if (selectedIds && selectedIds.length > 0) {
      generateQR(selectedIds);
    }
  };

  return (
    <Button
      label="Создать QR"
      onClick={handleGenerateQR}
      disabled={loading}
      variant="contained"
      color="primary"
    />
  );
};

export const PartsList = () => (
  <List 
    actions={<ListActions />}
    bulkActionButtons={<GenerateQRBulkAction />}
    resource="parts"
  >
    <Datagrid rowClick={false}>
      <TextField source="productName" label="SKU" />
      <TextField source="productCategory" label="Категория продукта" />
      <NumberField source="pointsEarned" label="Баллы" />
    </Datagrid>
  </List>
);

