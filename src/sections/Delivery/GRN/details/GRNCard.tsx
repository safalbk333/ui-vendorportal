'use client';

import { Box, Paper, Stack, Button, Chip, Divider, Typography } from '@mui/material';

import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import React from 'react';

import type { GoodsReceipt } from 'src/redux/GoodsReceiptService/GoodsReceiptSlice';

type GrnCardProps = {
  goodsReceipt: GoodsReceipt;
};

// ==================== HELPER: Format date string ====================
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

// ==================== HELPER: Map status string to Chip color ====================
function getStatusColor(
  status: string
): 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'draft':
      return 'default';
    default:
      return 'info';
  }
}

export default function GrnCard({ goodsReceipt }: GrnCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 0,
        transition: '0.25s ease',
        overflow: 'hidden',
      }}
    >
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2}>
        {/* LEFT */}
        <Box flex={1}>
          {/* Top */}
          <Stack
            direction="row"
            alignItems="baseline"
            flexWrap="wrap"
            gap={1}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box>
                {/* GRN Code — from API: chr_grn_code */}
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {goodsReceipt.chr_grn_code || '—'}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '11px',
                    color: '#64748B',
                    mt: 0.2,
                  }}
                >
                  Goods Receipt Note
                </Typography>
              </Box>
            </Stack>

            {/* Status Chip — from API: chr_status */}
            <Chip
              label={goodsReceipt.chr_status || 'Unknown'}
              color={getStatusColor(goodsReceipt.chr_status)}
              size="small"
              sx={{
                fontSize: 8,
                fontWeight: 600,
                height: 22,
                textTransform: 'capitalize',
              }}
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Info Grid */}
          <Stack direction="row" flexWrap="wrap" gap={2.5}>
            {/* PO Number — from API: purchase_order.chr_po_number */}
            <Stack direction="row" spacing={0.9} alignItems="center">
              <Box>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#94A3B8',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  PO Number
                </Typography>

                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 500,
                    mt: 0.3,
                  }}
                >
                  {goodsReceipt.purchase_order?.chr_po_number || '—'}
                </Typography>
              </Box>
            </Stack>

            {/* Delivery Note — from API: chr_delivery_note_no */}
            <Stack direction="row" spacing={0.9} alignItems="center">
              <Box>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#94A3B8',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  Delivery Note
                </Typography>

                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 500,
                    mt: 0.3,
                  }}
                >
                  {goodsReceipt.chr_delivery_note_no || '—'}
                </Typography>
              </Box>
            </Stack>

            {/* Received On — from API: dt_received_at */}
            <Stack direction="row" spacing={0.9} alignItems="center">
              <Box>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#94A3B8',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  Received On
                </Typography>

                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 500,
                    mt: 0.3,
                  }}
                >
                  {formatDate(goodsReceipt.dt_received_at)}
                </Typography>
              </Box>
            </Stack>

            {/* Document Status — from API: chr_document_status */}
            <Stack direction="row" spacing={0.9} alignItems="center">
              <Box>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#94A3B8',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  Doc Status
                </Typography>

                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 500,
                    mt: 0.3,
                    textTransform: 'capitalize',
                  }}
                >
                  {goodsReceipt.chr_document_status || '—'}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Notes — from API: txt_notes (only shown if present) */}
          {goodsReceipt.txt_notes && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#64748B',
                  lineHeight: 1.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: '#94A3B8',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mr: 0.8,
                  }}
                >
                  Notes:
                </Box>
                {goodsReceipt.txt_notes}
              </Typography>
            </>
          )}
        </Box>

        {/* RIGHT — Action Buttons */}
        <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} alignItems="center">
          <Button
            variant="outlined"
            sx={{
              height: 36,
              px: 1.5,
              borderRadius: '10px',
              borderColor: '#CBD5E1',
              color: '#0F172A',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 'unset',
              '&:hover': {
                borderColor: '#94A3B8',
                background: '#F8FAFC',
              },
            }}
          >
            PDF
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 36,
              px: 1.8,
              borderRadius: '10px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            Print
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}