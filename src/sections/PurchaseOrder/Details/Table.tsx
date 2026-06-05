import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import React from 'react';

import type { PurchaseOrder } from 'src/redux/PurchaseOrder/PurchaseOrderSlice';

type LineItemsTableProps = {
  purchaseOrder: PurchaseOrder
}

const rows = [
  {
    code: 'HW-8821',
    product: 'Enterprise Server Rack',
    desc: '42U Standard Grade, Black Chrome',
    ordered: 2,
    unitPrice: '$2,400.00',
    total: '$4,800.00',
    status: 'Approved',
  },
  {
    code: 'SW-0042',
    product: 'Cloud Infra License',
    desc: 'Annual Subscription - Tier 3',
    ordered: 5,
    unitPrice: '$1,200.00',
    total: '$6,000.00',
    status: 'Pending',
  },
  {
    code: 'CS-1192',
    product: 'Managed Setup Fee',
    desc: 'On-site technical configuration',
    ordered: 1,
    unitPrice: '$1,216.00',
    total: '$1,216.00',
    status: 'Verified',
  },
];

const LineItemsTable = ({ purchaseOrder }: LineItemsTableProps) => (
  <Paper
    elevation={0}
    sx={{
      border: '1px solid #e7e7ee',
      borderRadius: 1,
      overflow: 'hidden',
    }}
  >
    {/* Header */}
    <Box
      sx={{
        px: 2,
        py: 1.4,
        borderBottom: '1px solid #ececf2',
        background: ' #f8f9fa',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: '#202124',
            }}
          >
            Line Items
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: '#7b7b88',
              mt: 0.2,
            }}
          >
            Procurement items included in this purchase order
          </Typography>
        </Box>

        <Box
          sx={{
            px: 1.2,
            py: 0.45,
            borderRadius: 1.5,
            background: '#f6f8fcbb',
            border: '1px solid #d8e2ff',
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: '#3559d9',
            }}
          >
            {rows.length} ITEMS
          </Typography>
        </Box>
      </Stack>
    </Box>

    {/* Tiles */}
    <Box
      sx={{
        p: 1.2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {rows.map((row, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            border: '1px solid #ececf3',
            borderRadius: 1,
            p: 1.4,
            transition: '0.2s',
            background: '#fff',
            cursor: 'pointer',

            '&:hover': {
              borderColor: '#d7def7',
              boxShadow: '0 3px 10px rgba(16, 24, 40, 0.05)',
            },
          }}
        >
          <Stack direction="row" justifyContent="space-between" spacing={1.5}>
            {/* Left */}
            <Stack spacing={0.7} flex={1}>
              <Stack direction="row" alignItems="center" spacing={0.8} flexWrap="wrap">
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#202124',
                  }}
                >
                  {row.product}
                </Typography>

                <Chip
                  label={row.code}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    background: '#f3f4f7',
                    color: '#5f6472',
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  fontSize: 11.5,
                  color: '#737887',
                  lineHeight: 1.4,
                  mt: -0.2,
                }}
              >
                {row.desc}
              </Typography>

              <Stack direction="row" spacing={0.8} alignItems="center">
                <Typography
                  sx={{
                    fontSize: 11,
                    color: '#8a8f9d',
                  }}
                >
                  Qty Ordered: {row.ordered}
                </Typography>
              </Stack>
            </Stack>

            {/* Right */}
            <Stack spacing={0.8} alignItems="flex-end" justifyContent="center" minWidth={120}>
              <Box textAlign="right">
                <Typography
                  sx={{
                    fontSize: 10,
                    color: '#8a8f9d',
                    mb: 0.2,
                  }}
                >
                  Unit Price
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#202124',
                  }}
                >
                  {row.unitPrice}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      ))}

      {/* Total */}
      <Paper
        elevation={0}
        sx={{
          mt: 0.5,
          border: '1px solid #dce3ff',
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="right">
          <Box textAlign="right">
            <Typography
              sx={{
                fontSize: 10,
                color: '#7b7b88',
              }}
            >
              Subtotal
            </Typography>

            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                color: '#202124',
              }}
            >
              $12,016.00
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  </Paper>
);

export default LineItemsTable;
