'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Checkbox from '@mui/material/Checkbox';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContactCard from './ContactCards';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import LineItemsTable from './Table';
import POSupportingDocsBox from './SupportingDocuments';
import PremiumBreadcrumbs from 'src/components/DynamicBreadcrumbs/page';
import PrintIcon from '@mui/icons-material/Print';
import PurchaseOrderTracker from './POTracker';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import {
  fetchPurchaseOrderById,
  clearSelectedPurchaseOrder,
  PurchaseOrder,
} from 'src/redux/PurchaseOrder/PurchaseOrderSlice';
import { useSearchParams } from 'next/navigation';
import { RootState } from 'src/redux/store';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from 'minimal-shared/hooks';

// ==================== PURCHASE ORDER CARD ====================
// Renders the top summary bar for the selected purchase order.
// Receives the full PurchaseOrder object and displays key metadata.

const PurchaseOrderCard = ({ purchaseOrder }: { purchaseOrder: PurchaseOrder }) => (
  <Box
    sx={{
      borderBottom: '1px solid #e4e7ec',
      borderRadius: 0,
      px: 2,
      py: 1.5,
      mb: 2,
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
      {/* LEFT CONTENT */}
      <Box flex={1} minWidth={0}>
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          {/* PO Number */}
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#1f2937',
            }}
          >
            {purchaseOrder?.chr_po_number || 'PO-XXXX-XXXX'}
          </Typography>

          {/* Document Status Badge — driven by chr_document_status from the API */}
          <Box
            sx={{
              px: 1,
              py: '2px',
              borderRadius: '4px',
              backgroundColor: '#edf7ed',
              color: '#2e7d32',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {purchaseOrder?.chr_document_status || 'Pending Vendor Action'}
          </Box>
        </Box>

        {/* Metadata Grid: Vendor, Total Value, Issue Date, Delivery Date */}
        <Box
          mt={1}
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, minmax(140px, 1fr))',
            md: 'repeat(4, minmax(120px, auto))',
          }}
          gap={1.5}
        >
          {[
            {
              label: 'Vendor',
              // Correctly sourced from the nested vendor relation in the API response
              value: purchaseOrder?.vendor?.chr_vendor_name || 'N/A',
              color: '#344054',
            },
            {
              label: 'Total Value',
              value: `${purchaseOrder?.chr_currency || 'USD'} ${purchaseOrder?.flt_total_value?.toLocaleString() || '0.00'
                }`,
              color: '#3b5ccc',
            },
            {
              label: 'Issue Date',
              value: purchaseOrder?.dt_issued_at
                ? new Date(purchaseOrder.dt_issued_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : 'N/A',
              color: '#344054',
            },
            {
              label: 'Delivery Date',
              value: purchaseOrder?.dt_expected_delivery
                ? new Date(purchaseOrder.dt_expected_delivery).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : 'N/A',
              color: '#d97706',
            },
          ].map((item) => (
            <Box key={item.label}>
              <Typography
                sx={{
                  fontSize: '10px',
                  color: '#98a2b3',
                  textTransform: 'uppercase',
                  mb: 0.2,
                }}
              >
                {item.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: item.color,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Print Action */}
      <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
        <IconButton
          size="small"
          sx={{
            border: '1px solid #d0d5dd',
            borderRadius: '6px',
          }}
        >
          <PrintIcon sx={{ fontSize: 17, color: '#475467' }} />
        </IconButton>
      </Box>
    </Box>
  </Box>
);

// ==================== DETAILED VIEW ====================

function DetailedView() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  // Pull purchase order state from Redux store
  const { selectedPurchaseOrder, detailLoading, detailError } = useAppSelector(
    (state: RootState) => state.purchaseOrder
  );

  // Dialog state
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<'agree' | 'disagree' | ''>('');
  const [clarification, setClarification] = useState('');
  const [submitting, setSubmitting] = useState(false)

  // ── ID from URL query params (?id=<purchase_order_id>)
  const id = searchParams.get('id');

  const router = useRouter()

  useEffect(() => {

    if (id) {

      dispatch(fetchPurchaseOrderById(id));
    }

    return () => {
      dispatch(clearSelectedPurchaseOrder());
    };
  }, [dispatch, id]);

  useEffect(() => {
    const id = searchParams.get('id');
    console.log({ id })
  }, [id])

  // ==================== HANDLERS ====================

  // Close the acknowledgement dialog and reset its local state
  const handleClose = () => {
    setOpen(false);
    setDecision('');
    setClarification('');
  };

  // Submit acknowledgement decision (agree / disagree + optional clarification)
  const handleSubmit = async () => {
    console.log({
      purchaseOrderId: id,
      decision,
      clarification: decision === 'disagree' ? clarification : null,
    });

    // TODO: Dispatch acknowledge PO thunk here when the endpoint is ready
    handleClose();

    // Navigate back to the previous page once the dialog has finished closing
    setTimeout(() => {
      router.back();
    }, 300);
  };

  // ==================== RENDER ====================

  return (
    <Box>
      {/* Breadcrumb + Page Header */}
      <Box mb={2}>
        <PremiumBreadcrumbs
          title="Purchase Orders Details"
          paths={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Purchase Orders', href: '/purchase_orders' },
            { label: 'Details', href: '/purchase_orders/details' },
          ]}
          action={
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpen(true)}
                // Disable while loading or when no PO data is available
                disabled={detailLoading || !selectedPurchaseOrder}
                sx={{
                  borderRadius: 0.5,
                  textTransform: 'none',
                  px: 2.5,
                  height: 40,
                  fontWeight: 700,
                }}
              >
                Acknowledge PO
              </Button>
            </Stack>
          }
        />
      </Box>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* ── No ID in URL ── */}
      {!id && (
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          No purchase order ID provided in the URL.
        </Typography>
      )}

      {/* ── Loading State ── */}
      {id && detailLoading && (
        <Typography align="center" sx={{ py: 4 }}>
          Loading purchase order details...
        </Typography>
      )}

      {/* ── Error State ── */}
      {id && !detailLoading && detailError && (
        <Typography color="error" align="center" sx={{ py: 4 }}>
          Error: {detailError}
        </Typography>
      )}

      {/* ── Main Content: only rendered once data is loaded ── */}
      {!detailLoading && selectedPurchaseOrder && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            flexDirection: {
              xs: 'column',
              lg: 'row',
            },
          }}
        >
          {/* ── Left Column ── */}
          <Box
            sx={{
              flex: { lg: '0 0 70%' },
              width: '100%',
              minWidth: 0,
            }}
          >
            {/* PO Summary Header Card */}
            <PurchaseOrderCard purchaseOrder={selectedPurchaseOrder} />

            {/* Line Items Table — receives PO data for rendering line items */}
            <Box mt={2}>
              <LineItemsTable purchaseOrder={selectedPurchaseOrder} />
            </Box>

            {/* PO Status Tracker — receives PO data to render timeline/status */}
            <PurchaseOrderTracker purchaseOrder={selectedPurchaseOrder} />
          </Box>

          {/* ── Right Column (sticky sidebar) ── */}
          <Box
            sx={{
              flex: { lg: '0 0 30%' },
              width: '100%',
              minWidth: 280,
              position: 'sticky',
              top: 20,
            }}
          >
            {/* Vendor / Contact Info — receives nested vendor data */}
            <ContactCard purchaseOrder={selectedPurchaseOrder} />

            {/* Supporting Documents associated with this PO */}
            <POSupportingDocsBox purchaseOrder={selectedPurchaseOrder} />
          </Box>
        </Box>
      )}

      {/* ==================== ACKNOWLEDGE PO DIALOG ==================== */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            p: 0,
          },
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            px: 2.2,
            py: 1.8,
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
            borderBottom: '1px solid #eaecf0',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Purchase Order Acknowledgement
              </Typography>

              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#667085',
                  mt: 0.3,
                }}
              >
                Confirm whether you accept this purchase order.
              </Typography>
            </Box>

            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                border: '1px solid #e5e7eb',
                bgcolor: '#fff',
                p: 0.7,
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        {/* BODY */}
        <DialogContent sx={{ p: 2.2 }}>
          {/* PO SUMMARY STRIP — shows PO number + total value inside the dialog */}
          <Box
            sx={{
              border: '1px solid #e4e7ec',
              borderRadius: '12px',
              p: 1.6,
              mb: 2,
              mt: 2,
              background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#98a2b3',
                    textTransform: 'uppercase',
                    mb: 0.4,
                    letterSpacing: 0.4,
                  }}
                >
                  Purchase Order
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#111827',
                  }}
                >
                  {selectedPurchaseOrder?.chr_po_number || 'PO-XXXX-XXXX'}
                </Typography>
              </Box>

              <Box textAlign="right">
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: '#98a2b3',
                    textTransform: 'uppercase',
                    mb: 0.4,
                    letterSpacing: 0.4,
                  }}
                >
                  Total Value
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '14px',
                    color: '#4f46e5',
                  }}
                >
                  {`${selectedPurchaseOrder?.chr_currency || 'USD'} ${selectedPurchaseOrder?.flt_total_value?.toLocaleString() || '0.00'
                    }`}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* AGREE OPTION */}
          <Box
            onClick={() => setDecision('agree')}
            sx={{
              border: decision === 'agree' ? '2px solid #22c55e' : '1px solid #e5e7eb',
              borderRadius: '14px',
              p: 1.6,
              cursor: 'pointer',
              transition: '0.2s',
              mb: 1.5,
              background: decision === 'agree' ? 'rgba(34,197,94,0.05)' : '#fff',
              '&:hover': {
                borderColor: '#22c55e',
              },
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="flex-start">
              <Checkbox checked={decision === 'agree'} size="small" sx={{ p: 0.3 }} />

              <Box>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <CheckCircleRoundedIcon sx={{ color: '#22c55e', fontSize: 18 }} />

                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
                    I Agree
                  </Typography>
                </Stack>

                <Typography sx={{ fontSize: '12px', color: '#667085', mt: 0.5, lineHeight: 1.5 }}>
                  I acknowledge and accept all terms, pricing, delivery timelines, and conditions
                  mentioned in this purchase order.
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* DISAGREE OPTION */}
          <Box
            onClick={() => setDecision('disagree')}
            sx={{
              border: decision === 'disagree' ? '1px solid #f59e0b' : '1px solid #e5e7eb',
              borderRadius: '14px',
              p: 1.6,
              cursor: 'pointer',
              transition: '0.2s',
              background: decision === 'disagree' ? 'rgba(240, 238, 234, 0.06)' : '#fff',
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="flex-start">
              <Checkbox checked={decision === 'disagree'} size="small" sx={{ p: 0.3 }} />

              <Box width="100%">
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <ErrorOutlineRoundedIcon sx={{ color: '#f59e0b', fontSize: 18 }} />

                  <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
                    I Disagree
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    fontSize: '12px',
                    color: '#667085',
                    mt: 0.5,
                    lineHeight: 1.5,
                    mb: decision === 'disagree' ? 1.5 : 0,
                  }}
                >
                  I have concerns or clarification requests related to pricing, quantities,
                  timelines, or other PO terms.
                </Typography>

                {/* Clarification text field — slides in when "disagree" is selected */}
                {decision === 'disagree' && (
                  <Slide direction="up" in={decision === 'disagree'} mountOnEnter unmountOnExit>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder="Enter clarification or concern..."
                      value={clarification}
                      onChange={(e) => setClarification(e.target.value)}
                      sx={{
                        mt: 0.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          background: '#fff',
                          fontSize: '13px',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '13px',
                          p: 1.2,
                        },
                      }}
                    />
                  </Slide>
                )}
              </Box>
            </Stack>
          </Box>

          {/* ACTIONS */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: '9px',
                px: 2.2,
                height: 38,
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              color="primary"
              // Disable submit if no decision has been made,
              // or if "disagree" is chosen but no clarification has been entered
              disabled={!decision || (decision === 'disagree' && clarification.trim() === '')}
              sx={{
                textTransform: 'none',
                borderRadius: '9px',
                px: 2.2,
                height: 38,
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: 'none',
              }}
            >
              Submit
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default DetailedView;