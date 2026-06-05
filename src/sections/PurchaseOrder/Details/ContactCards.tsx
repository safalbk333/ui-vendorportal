import React from 'react';
import {
  Box,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import type { PurchaseOrder } from 'src/redux/PurchaseOrder/PurchaseOrderSlice';

type contactCardProps = {
  purchaseOrder: PurchaseOrder
}

const ContactCard = ({purchaseOrder}:contactCardProps) => (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      mb={2}
      sx={{
        border: '1px solid #e2e2e8',
        borderRadius: 1,
        padding: '12px 16px',
      }}
    >
      {/* Email Section */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton
          size="small"
          sx={{
            backgroundColor: '#eef3ff',
            width: 34,
            height: 34,
            '&:hover': {
              backgroundColor: '#dfe8ff',
            },
          }}
        >
          <EmailOutlinedIcon
            sx={{
              fontSize: 18,
              color: '#3559d9',
            }}
          />
        </IconButton>

        <Box>
          <Typography
            sx={{
              fontSize: 11,
              color: '#7b7b88',
              lineHeight: 1.2,
            }}
          >
            Email
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: '#222',
            }}
          >
            vendor.support@company.com
          </Typography>
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* WhatsApp Section */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton
          size="small"
          sx={{
            backgroundColor: '#e8f8ee',
            width: 34,
            height: 34,
            '&:hover': {
              backgroundColor: '#d8f3e3',
            },
          }}
        >
          <WhatsAppIcon
            sx={{
              fontSize: 18,
              color: '#25D366',
            }}
          />
        </IconButton>

        <Box>
          <Typography
            sx={{
              fontSize: 11,
              color: '#7b7b88',
              lineHeight: 1.2,
            }}
          >
            WhatsApp
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: '#222',
            }}
          >
            +1 987 654 3210
          </Typography>
        </Box>
      </Box>
    </Box>
  );

export default ContactCard;