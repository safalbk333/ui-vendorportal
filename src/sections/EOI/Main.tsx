'use client';

import { Box, Chip, Paper, Stack, Button, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';

import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PremiumBreadcrumbs from 'src/components/DynamicBreadcrumbs/page';
import React, { useEffect, useState } from 'react';
import ThumbUpOffAltRoundedIcon from '@mui/icons-material/ThumbUpOffAltRounded';
import { useRouter } from 'next/navigation';

import { fetchEois, updateEoiStatus } from 'src/redux/EoiManagement/EoiManagementSlice';
import { RootState } from 'src/redux/store';
import { useAppDispatch, useAppSelector } from 'src/redux/hooks';
import { Download } from '@mui/icons-material';

export default function VendorEOIWhiteUI() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux State
  const { data: eois, loading, error } = useAppSelector(
    (state: RootState) => state.eoiManagement
  );

  // Local state to track responded/declined EOIs
  const [respondedEois, setRespondedEois] = useState<Set<string>>(new Set());
  const [declinedEois, setDeclinedEois] = useState<Set<string>>(new Set());

  // Track which EOIs are currently being updated (to disable buttons)
  const [updatingEois, setUpdatingEois] = useState<Set<string>>(new Set());

  // Toast state
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch EOIs on component mount
  useEffect(() => {
    dispatch(fetchEois());
  }, [dispatch]);

  // Helper function to format closing date
  const formatClosingDate = (dateString: string) => {
    const date = new Date(dateString);
    return `Closes ${date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`;
  };

  // Handle Express Interest
  const handleExpressInterest = async (eoiId: string) => {
    if (updatingEois.has(eoiId)) return;

    setUpdatingEois(prev => new Set(prev).add(eoiId));

    try {
      await dispatch(updateEoiStatus({
        id: eoiId,
        data: {
          chr_status: "INTERESTED",
          txt_notes: "Vendor expressed interest"
        }
      })).unwrap();

      setRespondedEois(prev => new Set(prev).add(eoiId));

      setToast({
        open: true,
        message: 'Successfully expressed interest in this EOI!',
        severity: 'success',
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.message || 'Failed to express interest. Please try again.',
        severity: 'error',
      });
    } finally {
      setUpdatingEois(prev => {
        const newSet = new Set(prev);
        newSet.delete(eoiId);
        return newSet;
      });
    }
  };

  // Handle Decline
  const handleDecline = async (eoiId: string) => {
    if (updatingEois.has(eoiId)) return;

    setUpdatingEois(prev => new Set(prev).add(eoiId));

    try {
      await dispatch(updateEoiStatus({
        id: eoiId,
        data: {
          chr_status: "DECLINED",
          txt_notes: "Vendor declined the EOI"
        }
      })).unwrap();

      setDeclinedEois(prev => new Set(prev).add(eoiId));

      setToast({
        open: true,
        message: 'EOI has been declined',
        severity: 'info',
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.message || 'Failed to decline EOI. Please try again.',
        severity: 'error',
      });
    } finally {
      setUpdatingEois(prev => {
        const newSet = new Set(prev);
        newSet.delete(eoiId);
        return newSet;
      });
    }
  };

  // Close toast
  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box mb={2}>
        <PremiumBreadcrumbs
          title="Expression of Interest (EOI)"
          paths={[
            { label: 'Home', href: '/dashboard' },
            { label: 'EOI', href: '/expression-of-interest' },
          ]}
        />
      </Box>

      <Box mb={2} sx={{ borderTop: '1px dashed #d1d5db' }} />

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {/* {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )} */}

      {!loading && !error && eois.length === 0 && (
        <Typography variant="h6" textAlign="center" py={6} color="text.secondary">
          No Expressions of Interest available at the moment.
        </Typography>
      )}

      <Stack spacing={2}>
        {eois.map((eoi) => {
          const isResponded = respondedEois.has(eoi.pk_chr_eoi_id);
          const isDeclined = declinedEois.has(eoi.pk_chr_eoi_id);
          const isUpdating = updatingEois.has(eoi.pk_chr_eoi_id);

          return (
            <Paper
              key={eoi.pk_chr_eoi_id}
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 1,
                border: '1px solid #e6edf5',
                transition: '0.25s',
                position: 'relative',
                overflow: 'hidden',
                opacity: isDeclined ? 0.6 : 1,
              }}
            >
              {/* Top Row */}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#94a3b8',
                      letterSpacing: 0.8,
                      mb: 0.8,
                    }}
                  >
                    {eoi.chr_eoi_code}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: 18, md: 22 },
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1.25,
                      mb: 1.2,
                    }}
                  >
                    {eoi.chr_eoi_title || eoi.request.chr_title}
                  </Typography>

                  <Typography
                    sx={{
                      maxWidth: 1000,
                      color: '#64748b',
                      fontSize: 13.5,
                      lineHeight: 1.7,
                    }}
                  >
                    {eoi.txt_notes || eoi.request.txt_description}
                  </Typography>
                </Box>

                {/* Closing Badge */}
                <Chip
                  label={formatClosingDate(eoi.dt_submission_deadline)}
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: '#fff8e6',
                    color: '#b7791f',
                    fontWeight: 700,
                    borderRadius: '999px',
                    height: 30,
                    fontSize: 12,
                    border: '1px solid #fde68a',
                  }}
                />
              </Stack>

              {/* Tags */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                <Chip
                  label={eoi.request.chr_currency}
                  size="small"
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 600,
                    borderRadius: '999px',
                    fontSize: 11,
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Chip
                  label={`$${eoi.request.flt_estimated_value?.toLocaleString()}`}
                  size="small"
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 600,
                    borderRadius: '999px',
                    fontSize: 11,
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Chip
                  label={eoi.vendor.chr_vendor_name ? "Vendor Interest" : "Open EOI"}
                  size="small"
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 600,
                    borderRadius: '999px',
                    fontSize: 11,
                    border: '1px solid #e2e8f0',
                  }}
                />
              </Stack>

              {/* Divider */}
              <Box
                sx={{
                  height: 1,
                  bgcolor: '#edf2f7',
                  my: 2,
                }}
              />

              {/* Actions */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                <Button
                  variant={isResponded ? "outlined" : "contained"}
                  size="small"
                  startIcon={isResponded ?
                    <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> :
                    <ThumbUpOffAltRoundedIcon sx={{ fontSize: 18 }} />
                  }
                  onClick={() => !isResponded && !isDeclined && handleExpressInterest(eoi.pk_chr_eoi_id)}
                  disabled={isResponded || isDeclined || isUpdating}
                  sx={{
                    bgcolor: isResponded ? 'transparent' : '#06b6d4',
                    color: isResponded ? '#06b6d4' : '#fff',
                    borderColor: isResponded ? '#06b6d4' : 'transparent',
                    px: 2,
                    py: 0.9,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                    boxShadow: isResponded ? 'none' : 'none',

                    '&:hover': {
                      bgcolor: isResponded ? '#f0fdfa' : '#0891b2',
                      boxShadow: 'none',
                      borderColor: isResponded ? '#06b6d4' : 'transparent',
                    },
                  }}
                >
                  {isUpdating ? 'Processing...' : isResponded ? 'Responded' : 'Express Interest'}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloseRoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => !isDeclined && !isResponded && handleDecline(eoi.pk_chr_eoi_id)}
                  disabled={isResponded || isDeclined || isUpdating}
                  sx={{
                    borderColor: '#dbe3ec',
                    color: '#475569',
                    px: 2,
                    py: 0.9,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 13,

                    '&:hover': {
                      borderColor: '#94a3b8',
                      bgcolor: '#f8fafc',
                    },
                  }}
                >
                  {isUpdating ? 'Processing...' : 'Decline'}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download sx={{ fontSize: 18 }} />}
                  disabled={isDeclined || isUpdating}
                  sx={{
                    borderColor: '#dbe3ec',
                    color: '#475569',
                    px: 2,
                    py: 0.9,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 13,

                    '&:hover': {
                      borderColor: '#94a3b8',
                      bgcolor: '#f8fafc',
                    },
                  }}
                >
                  Download EOI
                </Button>

                <Button
                  onClick={() => router.push('/expression-of-interest/clarifications')}
                  variant="outlined"
                  size="small"
                  startIcon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18 }} />}
                  disabled={isDeclined || isUpdating}
                  sx={{
                    borderColor: '#dbe3ec',
                    color: '#475569',
                    px: 2,
                    py: 0.9,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 13,

                    '&:hover': {
                      borderColor: '#94a3b8',
                      bgcolor: '#f8fafc',
                    },
                  }}
                >
                  Ask Clarification
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      {/* Toast Message */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}