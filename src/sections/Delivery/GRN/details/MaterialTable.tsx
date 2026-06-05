import { Box, Paper, Stack, Typography } from '@mui/material';

import React from 'react';

import type { GoodsReceipt } from 'src/redux/GoodsReceiptService/GoodsReceiptSlice';

type MaterialLineItemsProps = {
  goodsReceipt: GoodsReceipt;
};

function MaterialLineItems({ goodsReceipt }: MaterialLineItemsProps) {
  // ==================== DATA: goods_receipt_items from API ====================
  // Destructure items array from the passed goodsReceipt prop
  const items = goodsReceipt.goods_receipt_items ?? [];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Table Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '2fr repeat(4, 1fr)',
          px: 1.5,
          py: 1,
          bgcolor: '#f3f4f68b',
          borderRadius: 0.5,
        }}
      >
        {/* Column headers — mapped to GoodsReceiptItem fields */}
        {['SKU / Description', 'Ordered', 'Received', 'Rejected', 'Unit'].map((head) => (
          <Typography
            key={head}
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: '#4B5563',
            }}
          >
            {head}
          </Typography>
        ))}
      </Box>

      {/* Rows — rendered from API: goodsReceipt.goods_receipt_items */}
      <Stack spacing={1} sx={{ mt: 1 }}>
        {items.length === 0 ? (
          // ==================== EMPTY STATE ====================
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color: '#9CA3AF',
              }}
            >
              No line items found for this goods receipt.
            </Typography>
          </Box>
        ) : (
          items.map((lineItem) => (
            <Box
              key={lineItem.pk_chr_gri_id} // from API: pk_chr_gri_id
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr repeat(4, 1fr)',
                alignItems: 'center',
                border: '1px solid #EEF2F7',
                borderRadius: 0,
                p: 1.5,
                transition: 'all .2s ease',
                '&:hover': {
                  borderColor: '#D7DEE7',
                },
              }}
            >
              {/* SKU + Description — from API: item.chr_item_code & item.chr_item_name */}
              <Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'primary.main',
                    lineHeight: 1.3,
                  }}
                >
                  {lineItem.item?.chr_item_code || '—'}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 10.5,
                    color: '#6B7280',
                    mt: 0.2,
                  }}
                >
                  {lineItem.item?.chr_item_name || '—'}
                </Typography>

                {/* Item description — from API: item.txt_description (shown if available) */}
                {lineItem.item?.txt_description && (
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: '#9CA3AF',
                      mt: 0.1,
                      fontStyle: 'italic',
                    }}
                  >
                    {lineItem.item.txt_description}
                  </Typography>
                )}
              </Box>

              {/* Ordered — from API: int_quantity_ordered */}
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#374151',
                }}
              >
                {lineItem.int_quantity_ordered ?? '—'}
              </Typography>

              {/* Received — from API: int_quantity_received */}
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#3F51B5',
                }}
              >
                {lineItem.int_quantity_received ?? '—'}
              </Typography>

              {/* Rejected — from API: int_quantity_rejected */}
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  // Highlight rejected quantities in red if > 0, grey otherwise
                  color: lineItem.int_quantity_rejected > 0 ? '#DC2626' : '#9CA3AF',
                }}
              >
                {lineItem.int_quantity_rejected ?? 0}
              </Typography>

              {/* Unit of Measure — from API: chr_unit_of_measure */}
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                }}
              >
                {lineItem.chr_unit_of_measure || lineItem.item?.chr_unit || '—'}
              </Typography>
            </Box>
          ))
        )}
      </Stack>

      {/* ==================== SUMMARY FOOTER ==================== */}
      {items.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr repeat(4, 1fr)',
            px: 1.5,
            py: 1.2,
            mt: 1,
            bgcolor: '#F9FAFB',
            borderTop: '1px solid #EEF2F7',
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            Totals
          </Typography>

          {/* Total Ordered */}
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
            {items.reduce((sum, i) => sum + (i.int_quantity_ordered ?? 0), 0)}
          </Typography>

          {/* Total Received */}
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#3F51B5' }}>
            {items.reduce((sum, i) => sum + (i.int_quantity_received ?? 0), 0)}
          </Typography>

          {/* Total Rejected */}
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>
            {items.reduce((sum, i) => sum + (i.int_quantity_rejected ?? 0), 0)}
          </Typography>

          {/* Empty for Unit column */}
          <span />
        </Box>
      )}
    </Paper>
  );
}

export default MaterialLineItems;