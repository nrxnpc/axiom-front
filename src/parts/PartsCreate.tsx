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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Grid,
  Box,
  Paper,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { API_URL, API_KEY } from '../config';

interface QRCode {
  spare_part_id: string;
  spare_part_sku?: string;
  qr_id: string;
  image_url: string;
}

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  qrCodes: QRCode[];
}

const QRCodeModal = ({ open, onClose, qrCodes }: QRCodeModalProps) => {
  const handlePrint = () => {
    window.print();
  };

  const getImageUrl = (imageUrl: string): string => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .qr-modal-print, .qr-modal-print * {
              visibility: visible;
            }
            .qr-modal-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              overflow: visible;
            }
            .MuiDialog-container {
              position: static !important;
            }
            .MuiDialog-paper {
              margin: 0 !important;
              max-width: 100% !important;
              height: 100% !important;
              box-shadow: none !important;
            }
            .MuiDialogTitle-root {
              padding: 16px !important;
            }
            .MuiDialogContent-root {
              padding: 16px !important;
              overflow: visible !important;
            }
            .MuiDialogActions-root {
              display: none !important;
            }
          }
        `}
      </style>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth className="qr-modal-print">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Сгенерированные QR-коды ({qrCodes.length})
          </Typography>
          <IconButton onClick={handlePrint} color="primary" sx={{ mr: 1 }}>
            <PrintIcon />
            <Typography variant="body2" sx={{ ml: 1 }}>
              Печать
            </Typography>
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {qrCodes.map((qrCode, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={getImageUrl(qrCode.image_url)}
                  alt={`QR Code ${qrCode.qr_id}`}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: '200px',
                    objectFit: 'contain',
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {qrCode.spare_part_sku || qrCode.spare_part_id}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export const PartsCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const generateQRRef = useRef(false);
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [qrModalOpen, setQRModalOpen] = useState(false);

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
        setQRCodes(data.qr_codes);
        setQRModalOpen(true);
        notify('QR-код успешно сгенерирован', { type: 'success' });
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
    <>
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
      <QRCodeModal
        open={qrModalOpen}
        onClose={() => setQRModalOpen(false)}
        qrCodes={qrCodes}
      />
    </>
  );
};

