'use client';

import { Box, Paper, Avatar, IconButton, Typography } from '@mui/material';

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import React from 'react';

import type { GoodsReceipt } from 'src/redux/GoodsReceiptService/GoodsReceiptSlice';

type WarehouseLocationCardProps = {
  goodsReceipt: GoodsReceipt;
};

// ==================== HELPER: Generate initials from a name string ====================
function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function WarehouseLocationCard({ goodsReceipt }: WarehouseLocationCardProps) {
  // ==================== DATA: Extract created_by ID for display ====================
  // The API provides fk_chr_created_id (creator ID) and fk_chr_modified_id (modifier ID)
  // We use fk_chr_created_id as the responsible person reference.
  // If a full user object is not nested, fallback gracefully.
  const createdAt = goodsReceipt.tim_created.split('T')[0] ?? '—';

  // ==================== DATA: Purchase order reference for location context ====================
  const poNumber = goodsReceipt.purchase_order?.chr_po_number ?? '—';

  // ==================== DATA: Document & Receipt metadata ====================
  const grnCode = goodsReceipt.chr_grn_code ?? '—';
  const deliveryNote = goodsReceipt.chr_delivery_note_no ?? '—';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0.5,
        overflow: 'hidden',
        border: '1px solid #DDE3EA',
      }}
    >
      {/* ==================== Top Section: Receipt Reference ==================== */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 0.2,
            }}
          >
            <BusinessOutlinedIcon
              sx={{
                fontSize: 16,
                color: '#1E1B8F',
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 12,
                color: '#6B7280',
                lineHeight: 1.2,
              }}
            >
              Receipt Reference
            </Typography>

            {/* GRN Code — from API: chr_grn_code */}
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: '#111827',
                mt: 0.3,
              }}
            >
              {grnCode}
            </Typography>
          </Box>
        </Box>

        {/* PO Number — from API: purchase_order.chr_po_number */}
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              PO Reference
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mt: 0.2 }}>
              {poNumber}
            </Typography>
          </Box>

          {/* Delivery Note — from API: chr_delivery_note_no */}
          <Box>
            <Typography sx={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Delivery Note
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mt: 0.2 }}>
              {deliveryNote}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ==================== User Section: Created By ==================== */}
      <Box
        sx={{
          px: 2,
          py: 1.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* <Avatar
            sx={{
              width: 30,
              height: 30,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: '#E0E7FF',
              color: '#4F46E5',
            }}
          >
            {getInitials(creatorId)}
          </Avatar> */}

          <Box>
            <Typography
              sx={{
                fontSize: 11,
                color: '#6B7280',
                mt: 0.2,
              }}
            >
              Created On
            </Typography>

            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#111827',
                lineHeight: 1.2,
              }}
            >
              {createdAt}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          sx={{
            color: '#1E1B8F',
          }}
        >
          <MailOutlineOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* ==================== Location / Map Section ==================== */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            bgcolor: '#F3F4F6',
            borderRadius: 1.5,
            p: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.7,
              mb: 1,
            }}
          >
            <LocationOnOutlinedIcon
              sx={{
                fontSize: 15,
                color: '#6B7280',
                mt: 0.1,
              }}
            />

            {/* Document Status — from API: chr_document_status */}
            <Typography
              sx={{
                fontSize: 11.5,
                color: '#4B5563',
                lineHeight: 1.4,
              }}
            >
              Document Status:
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  ml: 0.5,
                  textTransform: 'capitalize',
                  color: '#111827',
                }}
              >
                {goodsReceipt.chr_document_status || '—'}
              </Box>
            </Typography>
          </Box>

          <Box
            component="img"
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop"
            alt="map"
            sx={{
              width: '100%',
              height: 68,
              objectFit: 'cover',
              borderRadius: 1,
              display: 'block',
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
}

export default WarehouseLocationCard;