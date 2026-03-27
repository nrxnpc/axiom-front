import { Link } from 'react-router-dom';
import MuiLink from '@mui/material/Link';
import type { SxProps, Theme } from '@mui/material/styles';
import { buildMapOrderPath } from '../map/mapOrderNavigation';

type Props = {
  orderNumber: string;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function OrderNumberLink({ orderNumber, children, sx }: Props) {
  return (
    <MuiLink component={Link} to={buildMapOrderPath(orderNumber)} underline="hover" sx={sx}>
      {children ?? orderNumber}
    </MuiLink>
  );
}
