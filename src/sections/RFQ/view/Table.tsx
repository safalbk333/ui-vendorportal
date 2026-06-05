'use client';

import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';

import React from 'react';

interface Props {
  items?: any[];
}

export default function CompactModernTable({ items = [] }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        borderRadius: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 1.4,
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          Material Line Items
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          Here are the details of the materials requested for quotation. Each item includes a
          description, code, quantity, and unit of measurement for your reference.
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Box py={4}>
          <Typography
            align="center"
            sx={{
              fontSize: 13,
              color: '#64748B',
            }}
          >
            No items available
          </Typography>
        </Box>
      ) : (
        items.map((row, index) => (
          <Box key={row.pk_chr_rfq_item_mapping_id}>
            <Box
              sx={{
                py: 1.8,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                transition: '0.2s',
              }}
            >
              {/* LEFT */}
              <Box flex={1}>
                {/* Description */}
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.5,
                    letterSpacing: 0.1,
                  }}
                >
                  {row.item?.chr_item_name || '-'}
                </Typography>

                {/* Bottom Info */}
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{ mt: 1.2 }}
                >
                  <Chip
                    label={row.item?.chr_item_code || '-'}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: '#EEF2FF',
                      color: '#4338CA',
                      borderRadius: '6px',
                    }}
                  />

                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: '#CBD5E1',
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: '#64748B',
                      fontWeight: 500,
                    }}
                  >
                    Qty :
                    <Box
                      component="span"
                      sx={{
                        color: '#111827',
                        fontWeight: 700,
                        ml: 0.5,
                      }}
                    >
                      {row.int_quantity ?? '-'}
                    </Box>
                  </Typography>

                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: '#CBD5E1',
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: '#64748B',
                      fontWeight: 500,
                    }}
                  >
                    Unit :
                    <Box
                      component="span"
                      sx={{
                        color: '#2563EB',
                        fontWeight: 700,
                        ml: 0.5,
                      }}
                    >
                      {row.item?.chr_unit || '-'}
                    </Box>
                  </Typography>
                </Stack>

                {row.item?.txt_description && (
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 12,
                      color: '#6B7280',
                      lineHeight: 1.5,
                    }}
                  >
                    {row.item.txt_description}
                  </Typography>
                )}
              </Box>
            </Box>

            {index !== items.length - 1 && (
              <Divider
                sx={{
                  borderColor: '#F1F5F9',
                }}
              />
            )}
          </Box>
        ))
      )}
    </Paper>
  );
}