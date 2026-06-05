'use client';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import React from 'react';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { createQuotation } from 'src/redux/Quotation/Quatation';
import { useAppDispatch } from 'src/redux/hooks';
import { useRouter } from 'next/navigation';

interface RFQData {
  pk_chr_rfq_id: string;
  chr_rfq_code: string;
  chr_rfq_title: string;
  dt_due_date: string;
  dt_submission_deadline: string;
  chr_status: string;
quotations:any;
  eoi?: {
    vendor?: {
      chr_vendor_name: string;
    };
  };

  rfq_item_mappings?: Array<{
    pk_chr_rfq_item_mapping_id: string;
    int_quantity: number;
  }>;
}

interface QuoteSummaryCardProps {
  rfq: RFQData | null;
}

export default function QuoteSummaryCard({
  rfq,
}: QuoteSummaryCardProps) {
  const router = useRouter();
const dispatch=useAppDispatch()
  const totalItems =
    rfq?.rfq_item_mappings?.length || 0;

  const totalQuantity =
    rfq?.rfq_item_mappings?.reduce(
      (sum, item) => sum + (item.int_quantity || 0),
      0
    ) || 0;

    console.log(rfq,'rfq----')
    console.log('RFQ', rfq);
console.log('Quotations', rfq?.quotations);
console.log('First quotation', rfq?.quotations?.[0]);
const handleSubmitQuote = async () => {
  const quotation = rfq?.quotations?.[0];

  if (!quotation || !rfq) {
    console.log('RFQ/Quotation data not available');
    return;
  }

  const payload = {
    strVendorId: quotation?.vendor?.pk_chr_vendor_id ?? '',
    strRfqId: rfq.pk_chr_rfq_id,
    strBuyerId: quotation?.fk_chr_buyer_id ?? '',
    strBuyerDetails: quotation?.chr_buyer_details ?? '',
    strSellerDetails: quotation?.chr_seller_details ?? '',
    strStatus: quotation?.chr_status ?? '',
    intTotalAmount: quotation?.flt_total_amount ?? 0,
    strCurrency: quotation?.chr_currency ?? '',
    strIssueDate: quotation?.dt_issue_date ?? '',
    strDueDate: quotation?.dt_due_date ?? '',
    strNotes: quotation?.txt_notes ?? '',
    arrItems:
      quotation?.quotation_items?.map((item: any) => ({
        strItemId: item?.fk_chr_item_id ?? '',
        strItemDescription: item?.chr_item_description ?? '',
        intQuantity: item?.int_quantity ?? 0,
        strUnitOfMeasure: item?.chr_unit_of_measure ?? '',
        intUnitPrice: item?.flt_unit_price ?? 0,
        intTaxPercentage: item?.flt_tax_percentage ?? 0,
        intTaxAmount: item?.flt_tax_amount ?? 0,
        intTotalPrice: item?.flt_total_price ?? 0,
        strCurrency: item?.chr_currency ?? '',
        strNotes: item?.txt_notes ?? '',
      })) ?? [],
    strHtmlContent: quotation?.txt_rendered_html ?? '',
  };

  try {
    await dispatch(createQuotation(payload)).unwrap();

    router.push('/quotations');
  } catch (error) {
    console.error('Failed to create quotation:', error);
  }
};
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 1,
        border: '1px solid rgba(148,163,184,0.16)',
        color: '#0F172A',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.8,
          pt: 1.8,
          pb: 1.2,
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Chip
              label={rfq?.chr_rfq_code || 'RFQ'}
              size="small"
              sx={{
                height: 22,
                borderRadius: '7px',
                fontSize: 10,
                fontWeight: 700,
                color: '#1D4ED8',
                background: 'rgba(59,130,246,0.10)',
                border: '1px solid rgba(59,130,246,0.14)',
              }}
            />

            <Typography
              sx={{
                mt: 1.1,
                fontSize: 10,
                letterSpacing: 1,
                fontWeight: 700,
                color: '#64748B',
              }}
            >
              QUOTATION SUMMARY
            </Typography>
          </Box>

          <Avatar
            variant="rounded"
            sx={{
              width: 50,
              height: 50,
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(148,163,184,0.16)',
              color: '#2563EB',
            }}
          >
            <ReceiptLongRoundedIcon sx={{ fontSize: 22 }} />
          </Avatar>
        </Stack>
      </Box>

      {/* RFQ Title */}
      <Box px={1.8}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: '#0F172A',
            mb: 0.5,
          }}
        >
          {rfq?.chr_rfq_title || '-'}
        </Typography>

      </Box>

      {/* Summary */}
      <Box
        sx={{
          px: 1.8,
          py: 1.8,
        }}
      >
        <Stack spacing={1}>
          <SummaryItem
            icon={<BusinessRoundedIcon sx={{ fontSize: 14 }} />}
            label="Vendor"
            value={
              rfq?.eoi?.vendor?.chr_vendor_name || '-'
            }
          />

          <SummaryItem
            icon={<Inventory2RoundedIcon sx={{ fontSize: 14 }} />}
            label="Line Items"
            value={String(totalItems)}
          />

          <SummaryItem
            icon={<Inventory2RoundedIcon sx={{ fontSize: 14 }} />}
            label="Total Quantity"
            value={String(totalQuantity)}
          />

          <SummaryItem
            icon={<LocalShippingRoundedIcon sx={{ fontSize: 14 }} />}
            label="Submission Deadline"
            value={
              rfq?.dt_submission_deadline
                ? new Date(
                    rfq.dt_submission_deadline
                  ).toLocaleDateString()
                : '-'
            }
          />
        </Stack>

        <Divider
          sx={{
            my: 1.6,
            borderColor: 'rgba(148,163,184,0.14)',
          }}
        />

        {/* Due Date */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              sx={{
                fontSize: 10.5,
                color: '#64748B',
                fontWeight: 700,
              }}
            >
              RFQ Due Date
            </Typography>

            <Typography
              sx={{
                mt: 0.4,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {rfq?.dt_due_date
                ? new Date(
                    rfq.dt_due_date
                  ).toLocaleDateString()
                : '-'}
            </Typography>
          </Box>

          <Chip
            label={rfq?.chr_status || 'Draft'}
            size="small"
            sx={{
              height: 26,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: 10,
              color: '#334155',
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(148,163,184,0.14)',
            }}
          />
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1.3,
          background: 'rgba(255,255,255,0.55)',
          borderTop: '1px solid rgba(148,163,184,0.12)',
        }}
      >
        <Button
          fullWidth
          color='primary'
          variant="contained"
          endIcon={
            <ArrowUpwardRoundedIcon sx={{ fontSize: 18 }} />
          }
          sx={{
            height: 44,
            borderRadius: 0.5,
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 600,
          }}
 onClick={handleSubmitQuote}
        >
          Submit Final Quote
        </Button>

        <Stack
          direction="row"
          justifyContent="space-between"
          mt={1.2}
        >
          <Typography
            sx={{
              fontSize: 10,
              color: '#64748B',
            }}
          >
            RFQ Status
          </Typography>

          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: '#2563EB',
            }}
          >
            {rfq?.chr_status || '-'}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

/* -------------------------------- */
/* Summary Row */
/* -------------------------------- */

function SummaryItem({
  label,
  value,
  icon,
  green = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  green?: boolean;
}) {
  return (
    <Box
      sx={{
        px: 1.2,
        py: 1,
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.68)',
        border: '1px solid rgba(148,163,184,0.12)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          spacing={0.8}
          alignItems="center"
        >
          {icon && (
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(59,130,246,0.08)',
                color: '#2563EB',
              }}
            >
              {icon}
            </Box>
          )}

          <Typography
            sx={{
              fontSize: 11.5,
              fontWeight: 600,
              color: '#475569',
            }}
          >
            {label}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 11.5,
            fontWeight: 700,
            color: green ? '#22C55E' : '#0F172A',
            maxWidth: 120,
            textAlign: 'right',
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}